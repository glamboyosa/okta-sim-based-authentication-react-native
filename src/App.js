import React, { useLayoutEffect, useState } from 'react'

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { CLIENT_ID, REDIRECT_URI, LOGOUT_REDIRECT_URI, ISSUER } from '@env'

import { createConfig } from '@okta/okta-react-native'
const App = () => {
  const baseURL = '<YOUR_LOCAL_TUNNEL_URL>'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const errorHandler = ({ title, message }) => {
    return Alert.alert(title, message, [
      {
        text: 'Close',
        onPress: () => console.log('Alert closed'),
      },
    ])
  }

  const successHandler = () =>
    Alert.alert('Login Successful', '✅', [
      {
        text: 'Close',
        onPress: () => console.log('Alert closed'),
      },
    ])

  const signUpHandler = async () => {}

  useLayoutEffect(() => {
    const {
      clientId,
      redirectUri,
      endSessionRedirectUri,
      discoveryUri,
      scopes,
    } = {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      endSessionRedirectUri: LOGOUT_REDIRECT_URI,
      discoveryUri: ISSUER,
      scopes: ['openid', 'profile', 'offline_access'],
    }
    await createConfig({
      clientId,
      redirectUri,
      endSessionRedirectUri,
      discoveryUri,
      scopes,
    })
  }, [])
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image style={styles.logo} source={require('./images/tru-logo.png')} />
        <Text style={styles.heading}>Sign Up</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Email"
          placeholderTextColor="#d3d3d3"
          keyboardType="default"
          value={email}
          editable={!loading}
          onChangeText={(value) => setEmail(value.replace(/\s+/g, ''))}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          placeholderTextColor="#d3d3d3"
          keyboardType="default"
          secureTextEntry
          value={password}
          editable={!loading}
          onChangeText={(value) => setPassword(value.replace(/\s+/g, ''))}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Number ex. +448023432345"
          placeholderTextColor="#d3d3d3"
          keyboardType="phone-pad"
          value={phoneNumber}
          editable={!loading}
          onChangeText={(value) => setPhoneNumber(value.replace(/\s+/g, ''))}
        />
        {loading ? (
          <ActivityIndicator
            style={styles.spinner}
            size="large"
            color="#00ff00"
          />
        ) : (
          <TouchableOpacity onPress={signUpHandler} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginTop: 10,
    width: 0.5 * Dimensions.get('window').width,
    height: 200,
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    padding: 15,
    borderRadius: 3,
    backgroundColor: '#fff',
    borderColor: '#858585',
    borderWidth: 0.4,
    elevation: 7,
    marginBottom: 10,
    shadowColor: '#858585',
    shadowOffset: { width: 0.5, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    color: '#000',
    width: 0.7 * Dimensions.get('window').width,
  },
  spinner: {
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1955ff',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1955ff',
    marginTop: 17,
    width: 0.35 * Dimensions.get('window').width,
  },
  buttonText: {
    color: '#fff',
  },
})

export default App
