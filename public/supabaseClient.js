import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://amyxwbzebihtrcamkars.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteXh3YnplYmlodHJjYW1rYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTI3MjksImV4cCI6MjA3NjE4ODcyOX0.93uTzOWL8EoTt5Sl6I77IjJBSVUtRDkgzrU35C_r34M'

// export ตัวแปร supabase ให้ main.tsx ใช้ได้
export const supabase = createClient(supabaseUrl, supabaseKey)

// ทดสอบเชื่อมต่อ
supabase.from('your_table_name').select('*')
  .then(({ data, error }) => {
    if (error) console.error('❌ Supabase error:', error)
    else console.log('✅ Connected Supabase:', data)
  })
