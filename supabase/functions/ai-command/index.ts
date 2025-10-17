import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command } = await req.json();
    console.log('Received command:', command);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use AI to parse the command
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a data management assistant. Parse user commands to determine database operations.
Available tables: stocks, financials, business_overviews, risks.

Table schemas:
- stocks: symbol (TEXT, UNIQUE), name (TEXT), price (NUMERIC), market (TEXT)
- financials: stock_symbol (TEXT, FK), revenue (NUMERIC), cost_of_revenue (NUMERIC), net_profit (NUMERIC), eps (NUMERIC), period (TEXT)
- business_overviews: stock_symbol (TEXT, FK), business_model (TEXT), customer_segment (TEXT), revenue_segment (TEXT), channel (TEXT), moat (TEXT), tam (TEXT), growth_engine (TEXT)
- risks: stock_symbol (TEXT, FK), type (TEXT), description (TEXT)

Respond with structured data about the operation to perform.`
          },
          {
            role: "user",
            content: command
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "execute_database_operation",
              description: "Execute a database operation based on the user command",
              parameters: {
                type: "object",
                properties: {
                  operation: {
                    type: "string",
                    enum: ["insert", "update", "upsert"],
                    description: "The database operation to perform"
                  },
                  table: {
                    type: "string",
                    enum: ["stocks", "financials", "business_overviews", "risks"],
                    description: "The table to operate on"
                  },
                  data: {
                    type: "object",
                    description: "The data to insert or update"
                  },
                  filter: {
                    type: "object",
                    description: "Filter conditions for update operations (e.g., {symbol: 'AAPL'})"
                  }
                },
                required: ["operation", "table", "data"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "execute_database_operation" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    // Extract the tool call arguments
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ 
        error: "Could not parse command. Please be more specific." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const args = JSON.parse(toolCall.function.arguments);
    console.log('Parsed operation:', args);

    const { operation, table, data, filter } = args;

    let result;
    let message = "";

    // Execute the database operation
    switch (operation) {
      case "insert":
        result = await supabase.from(table).insert(data).select();
        if (result.error) throw result.error;
        message = `Successfully added ${table.slice(0, -1)} record.`;
        break;

      case "update":
        if (!filter) {
          throw new Error("Filter required for update operations");
        }
        let query = supabase.from(table).update(data);
        // Apply filters
        for (const [key, value] of Object.entries(filter)) {
          query = query.eq(key, value);
        }
        result = await query.select();
        if (result.error) throw result.error;
        message = `Successfully updated ${table.slice(0, -1)} record.`;
        break;

      case "upsert":
        result = await supabase.from(table).upsert(data, {
          onConflict: table === 'stocks' ? 'symbol' : 'id'
        }).select();
        if (result.error) throw result.error;
        message = `Successfully saved ${table.slice(0, -1)} record.`;
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    console.log('Database operation result:', result);

    return new Response(JSON.stringify({ 
      success: true,
      message,
      data: result.data 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in ai-command function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});