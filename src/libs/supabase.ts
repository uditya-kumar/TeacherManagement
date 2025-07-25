import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
// import { Database } from '@/database.types';

const supabaseUrl = 'https://qdoycqsmepkpackfsjyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb3ljcXNtZXBrcGFja2ZzanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTI0MDcsImV4cCI6MjA2ODk4ODQwN30.tGmaK1YUAEK7yRXVyct1py0VGrHXBk3ErjV2_KKuke0';

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for persisting auth session across app reloads
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});