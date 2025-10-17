import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://amyxwbzebihtrcamkars.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteXh3YnplYmlodHJjYW1rYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTI3MjksImV4cCI6MjA3NjE4ODcyOX0.93uTzOWL8EoTt5Sl6I77IjJBSVUtRDkgzrU35C_r34M";

export const supabase = createClient(supabaseUrl, supabaseKey);
