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

import { createConfig, signIn } from '@okta/okta-react-native'

import TruSDK from '@tru_id/tru-sdk-react-native'
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

  const createSubscriberCheck = async (phoneNumber) => {
    const body = { phone_number: phoneNumber }

    console.log('tru.ID: Creating PhoneCheck for', body)

    const response = await fetch(`${baseURL}/subscriber-check`, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const json = await response.json()

    return json
  }

  const getSubscriberCheck = async (checkId) => {
    const response = await fetch(`${baseURL}/subscriber-check/${checkId}`)
    const json = await response.json()
    return json
  }

  const signUpHandler = async () => {
    setLoading(true)
    // check if we have coverage using the `isReachable` function

    const reachabilityDetails = await TruSDK.isReachable()

    console.log('Reachability details are', reachabilityDetails)

    const info = JSON.parse(reachabilityDetails)

    if (info.error.status === 400) {
      errorHandler({
        title: 'Something went wrong.',
        message: 'Mobile Operator not supported',
      })
      setLoading(false)
      return
    }

    let isSubscriberCheckSupported = false

    if (info.error.status !== 412) {
      isSubscriberCheckSupported = false

      for (const { product_name } of info.products) {
        console.log('supported products are', product_name)

        if (product_name === 'Subscriber Check') {
          isSubscriberCheckSupported = true
        }
      }
    } else {
      isSubscriberCheckSupported = true
    }

    if (isSubscriberCheckSupported) {
      try {
        const subscriberCheckResponse = await createSubscriberCheck(phoneNumber)

        await TruSDK.check(subscriberCheckResponse.check_url)

        const subscriberCheckResult = await getSubscriberCheck(
          subscriberCheckResponse.check_id,
        )

        if (
          subscriberCheckResult.no_sim_change === false &&
          subscriberCheckResult.match === false
        ) {
          setLoading(false)
          return errorHandler({
            title: 'Something went wrong.',
            message:
              'We were unable to verify your identity. Please try again.',
          })
        } else {
          // WE HAVE A MATCH AND THE SIM HASN'T CHANGED RECENTLY
          authResponse = await signIn({ username: email, password })

          if (authResponse.access_token) {
            setLoading(false)
            return successHandler()
          }
        }
      } catch (e) {
        setLoading(false)
        return errorHandler({
          title: 'Something went wrong',
          message: e.message,
        })
      }
    } else {
      // MNO does not support SubscriberCheck so proceed with Okta sign in
      try {
        authResponse = await signIn({ username: email, password })

        if (authResponse.access_token) {
          setLoading(false)
          return successHandler()
        }
      } catch (e) {
        setLoading(false)
        return errorHandler({
          title: 'Something went wrong',
          message: e.message,
        })
      }
    }
  }

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
