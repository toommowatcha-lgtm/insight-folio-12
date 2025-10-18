import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxqyrhibagubljpkfrzv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cXlyaGliYWd1YmxqcGtmcnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NTQxODQsImV4cCI6MjA3NjIzMDE4NH0.cDhbqabqlKyc0bPdS9o1asIKU59aPxgGE-jANzda2uM'

export const supabase = createClient(supabaseUrl, supabaseKey)
