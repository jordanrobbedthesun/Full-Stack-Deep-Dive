// App.tsx
// This is the main entry point for the React Native app.
// It decides whether to show the login screen or the chat screen based on user authentication.

import 'react-native-url-polyfill/auto' // Polyfill for URL support in React Native
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase' // Supabase client for auth and database
import Auth from './components/Auth' // Login/signup UI
import ChatBox from './components/ChatBox' // Main chat UI
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function App() {
  // Holds the current user session (null if not logged in)
  const [session, setSession] = useState<Session | null>(null)

  // On mount, check if the user is already logged in and listen for login/logout events
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  // If not logged in, show Auth screen. If logged in, show ChatBox.
  return (
    <View style={{ flex: 1 }}>
      {!session ? (
        <Auth />
      ) : (
        <ChatBox userId={session.user.id} onSignOut={() => supabase.auth.signOut()} />
      )}
    </View>
  )
}