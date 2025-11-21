 import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://llocwvoryuezuvxfogjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsb2N3dm9yeXVlenV2eGZvZ2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzI4OTgsImV4cCI6MjA3ODk0ODg5OH0.sWbo9t1zFhpfyDQw9gTluX5O1-wGj6lM5NKwdiUxmzc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)