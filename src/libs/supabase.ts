import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/database.types';

export const supabaseUrl = 'https://ykcpcgwzwrgvohhvrbrz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrY3BjZ3d6d3Jndm9oaHZyYnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTQ5ODcsImV4cCI6MjA2OTA5MDk4N30.z-DVQcPEnHd6Djkl9_H7xolbmsZu7AjnmTSsuB_rk-g';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for persisting auth session across app reloads
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    }
  }
});
