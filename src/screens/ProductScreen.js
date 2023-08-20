import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Keyboard,
  TouchableWithoutFeedback, } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('test01.db');

const ProductScreen = ({ route, navigation }) => {
  const { roundId } = route.params;
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');

  const handleSaveProduct = () => {
    if (!productName || !productQuantity) {
      alert('กรุณากรอกชื่อผลผลิตและปริมาณผลผลิต');
      return;
    }
  
    const parsedQuantity = parseInt(productQuantity);
  
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      alert('กรุณากรอกปริมาณผลผลิตที่ถูกต้อง (จำนวนเต็มบวก)');
      return;
    }
  
    const productData = {
      round_id: roundId,
      name: productName,
      quantity: parsedQuantity,
    };

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO products (round_id, name, quantity) VALUES (?, ?, ?);',
        [productData.round_id, productData.name, productData.quantity],
        (_, { insertId }) => {
          console.log('Product inserted with ID:', insertId);
          navigation.goBack(); // Go back to the RoundDetails screen after saving the product
        },
        (_, error) => {
          console.error('Error inserting product:', error);
        }
      );
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <Text style={styles.headtitle}>เพิ่มผลผลิต</Text>
      <TextInput
        style={styles.input}
        placeholder="ชื่อผลผลิต"
        value={productName}
        onChangeText={setProductName}
      />

      <TextInput
        style={styles.input}
        placeholder="ปริมาณผลผลิต"
        keyboardType="numeric"
        value={productQuantity}
        onChangeText={setProductQuantity}
      />

      <TouchableOpacity style={styles.buttonSubmit} onPress={handleSaveProduct}>
        <Text style={styles.buttonText}>บันทึกผลผลิต</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor:'#FFF'
  },
  headtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    height:50,
    borderRadius:5,
    backgroundColor:'#FFF'
  },
  buttonSubmit: {
    backgroundColor: '#52BE80',
    padding: 12,
    alignItems: 'center',
    borderRadius: 4,
    height:70
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 35,
  },
});

export default ProductScreen;
