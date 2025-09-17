// Auth.tsx
// This component provides the login and signup UI for the app.
// It uses Supabase Auth to handle user authentication with email and password.

import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'

export default function Auth() {
     // State for email, password, and loading spinner
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [loading, setLoading] = useState(false)

     // Called when user presses "Sign in"
     async function signInWithEmail() {
          setLoading(true)
          const { error } = await supabase.auth.signInWithPassword({
               email: email,
               password: password,
          })

          if (error) Alert.alert(error.message)
          setLoading(false)
     }

     // Called when user presses "Sign up"
     async function signUpWithEmail() {
          setLoading(true)
          const {
               data: { session },
               error,
          } = await supabase.auth.signUp({
               email: email,
               password: password,
          })

          if (error) Alert.alert(error.message)
          // If you want, you can alert the user to check their email for verification
          setLoading(false)
     }

     // Renders the login/signup form
     return (
          <View style={styles.container}>
               <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Input
                         label="Email"
                         leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                         onChangeText={(text) => setEmail(text)}
                         value={email}
                         placeholder="email@address.com"
                         autoCapitalize={'none'}
                    />
               </View>
               <View style={styles.verticallySpaced}>
                    <Input
                         label="Password"
                         leftIcon={{ type: 'font-awesome', name: 'lock' }}
                         onChangeText={(text) => setPassword(text)}
                         value={password}
                         secureTextEntry={true}
                         placeholder="Password"
                         autoCapitalize={'none'}
                    />
               </View>
               <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
               </View>
               <View style={styles.verticallySpaced}>
                    <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
               </View>
          </View>
     )
}

// Styles for the Auth screen
const styles = StyleSheet.create({
     container: {
          marginTop: 40,
          padding: 12,
     },
     verticallySpaced: {
          paddingTop: 4,
          paddingBottom: 4,
          alignSelf: 'stretch',
     },
     mt20: {
          marginTop: 20,
     },
})