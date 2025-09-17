// lib/supabase.ts
// This file sets up the Supabase client for use in the app.
// It handles authentication, session persistence, and auto-refresh.

import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

// Get Supabase project URL and anon key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || ''

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
          ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}), // Use AsyncStorage on native
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          lock: processLock,
     },
})

// This keeps the user's session refreshed while the app is open
if (Platform.OS !== "web") {
     AppState.addEventListener('change', (state) => {
          if (state === 'active') {
               supabase.auth.startAutoRefresh()
          } else {
               supabase.auth.stopAutoRefresh()
          }
     })
}