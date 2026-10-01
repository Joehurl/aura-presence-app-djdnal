import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cikoikxaiwruwutkkiiy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpa29pa3hhaXdydXd1dGtraWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Mjc2NDksImV4cCI6MjEwNjMwMzY0OX0.LbY0Q8hL7ygicP7TMK5CP7lUTG0t8EhaATjvQCCMghE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
