import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { Button } from '@rneui/themed'
import { supabase } from '../lib/supabase'

type Props = {
  userId: string
}

export default function Home({ userId }: Props) {
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) Alert.alert(error.message)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>User ID: {userId}</Text>
      <View style={styles.buttonWrap}>
        <Button title="Sign out" onPress={() => signOut()} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
  },
  buttonWrap: {
    width: 140,
  },
})
