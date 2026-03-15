import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native'
import { supabase } from '../src/lib/supabase'
import { router } from 'expo-router'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert('Error', error.message)
    else router.replace('/(tabs)')
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert('Error', error.message)
    else if (!session) Alert.alert('Success', 'Please check your inbox for email verification!')
    else router.replace('/(tabs)')
    
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>CommonsFlow</Text>
          <Text style={styles.subtitle}>Coordinate your community.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Email address"
            placeholderTextColor="#888"
            autoCapitalize={'none'}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor="#888"
            autoCapitalize={'none'}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            disabled={loading} 
            onPress={isLogin ? signInWithEmail : signUpWithEmail}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.secondaryButtonText}>
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#8AB8A8', // Sage green
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
})
