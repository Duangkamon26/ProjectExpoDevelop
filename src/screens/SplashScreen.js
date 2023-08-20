import { View, Text, Image, StyleSheet} from 'react-native'
import React, { useEffect, useState } from 'react'

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('App');
      //    handleGetToken();
    }, 2000);
  })
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/SplashLogo.png')}
        style={{ width: 500, height: 500, margin: 10 }}
      />

      {/* <Text style={styles.title}>WELCOME TO MYAPP BETA02</Text> */}
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#FFFF'
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
})