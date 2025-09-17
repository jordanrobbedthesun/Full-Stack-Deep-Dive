// App.tsx
import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import ChatScreen from './components/ChatScreen'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 🔑 Always sign out on reload so no session persists
    supabase.auth.signOut().then(() => {
      setSession(null) // reset local state too
    })

    // Listen for login / logout events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => {
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Always start logged out. After login, ChatScreen shows. */}
      {!session ? <Auth /> : <ChatScreen />}
    </View>
  )
}
