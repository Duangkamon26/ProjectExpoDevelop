import { StyleSheet, Text, View, Image, Button, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';

const WelcomeScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Background Gradient */}
      <Image
        source={require('../../assets/BackgroundGradient.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.appDescription}>เเอปนี้ใช้ในการลงทุนและติดตามผลกำไรของการลงทุน</Text>
      </View>

      <ScrollView horizontal style={styles.slideContainer}>
        {/* Add animated slide effects to images */}
        <Image
          source={require('../../assets/01.png')}
          style={[styles.slideImage, styles.animatedSlide]}
          resizeMode="cover"
        />
        <Image
          source={require('../../assets/02.jpg')}
          style={[styles.slideImage, styles.animatedSlide]}
          resizeMode="cover"
        />
        <Image
          source={require('../../assets/03.jpg')}
          style={[styles.slideImage, styles.animatedSlide]}
          resizeMode="cover"
        />
        <Image
          source={require('../../assets/04.jpg')}
          style={[styles.slideImage, styles.animatedSlide]}
          resizeMode="cover"
        />
      </ScrollView>

      {/* Add an introduction video */}
      {/* <View style={styles.videoContainer}>
        
      </View> */}

      {/* Styled Call-to-Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            navigation.navigate('Home');
          }}>
          <Text style={styles.buttonText}>สร้างการลงทุนกันเถอะ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            navigation.navigate('Record');
          }}>
          <Text style={styles.buttonText}>ดูประวัติการลงทุน</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  content: {
    marginTop: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  appDescription: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFF',
  },
  slideContainer: {
    marginTop: 10,
    marginBottom: 10,
    
  },
  slideImage: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginRight: 2,
    
  },
  animatedSlide: {
    opacity: 0.8,
    transform: [{ scale: 0.9 }],
  },
  videoContainer: {
    borderRadius: 10,
    marginBottom: 20,
    width: 350,
    height: 200,
    backgroundColor: '#ccc',
    // Add styling for video container if needed
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Add this line
  },
  createButton: {
    backgroundColor: 'purple',
    flex: 1,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
    marginRight:10,
    marginBottom:10
  },
  viewButton: {
    backgroundColor: '#28A8FE',
    flex: 1,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default WelcomeScreen;
