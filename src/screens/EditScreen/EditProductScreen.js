import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('test01.db');

const EditProductScreen = ({ route, navigation }) => {
  const { productId } = route.params; // Get the product ID from the route params
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');

  useEffect(() => {
    // Load the product details when the component mounts
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT name, quantity FROM products WHERE id = ?;',
        [productId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const product = rows.item(0);
            setProductName(product.name);
            setProductQuantity(product.quantity.toString());
          }
        },
        (_, error) => {
          console.error('Error fetching product details:', error);
        }
      );
    });
  }, [productId]);

  const handleUpdateProduct = () => {
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
      name: productName,
      quantity: parsedQuantity,
    };

    // Show confirmation alert before updating the product
    Alert.alert(
      'ยืนยันการเปลี่ยนแปลง',
      'คุณต้องการบันทึกการเปลี่ยนแปลงใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ตกลง',
          onPress: () => {
            db.transaction((tx) => {
              tx.executeSql(
                'UPDATE products SET name = ?, quantity = ? WHERE id = ?;',
                [productData.name, productData.quantity, productId],
                () => {
                  console.log('Product updated successfully');
                  navigation.goBack(); // Go back to the previous screen after updating the product
                },
                (_, error) => {
                  console.error('Error updating product:', error);
                }
              );
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteProduct = () => {
    // Show confirmation alert before deleting the product
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบผลผลิตนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ตกลง',
          onPress: () => {
            db.transaction((tx) => {
              tx.executeSql(
                'DELETE FROM products WHERE id = ?;',
                [productId],
                () => {
                  console.log('Product deleted successfully');
                  navigation.goBack(); // Go back to the previous screen after deleting the product
                },
                (_, error) => {
                  console.error('Error deleting product:', error);
                }
              );
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headtitle}>แก้ไขผลผลิต</Text>
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

      <TouchableOpacity style={styles.buttonSubmit} onPress={handleUpdateProduct}>
        <Text style={styles.buttonText}>บันทึกการเปลี่ยนแปลง</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonDelete} onPress={handleDeleteProduct}>
        <Text style={styles.buttonText}>ลบผลผลิต</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
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
    height: 50,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  buttonSubmit: {
    backgroundColor: '#52BE80',
    padding: 12,
    alignItems: 'center',
    borderRadius: 4,
    height: 70,
  },
  buttonDelete: {
    backgroundColor: '#E74C3C',
    padding: 12,
    alignItems: 'center',
    borderRadius: 4,
    height: 70,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 35,
  },
});

export default EditProductScreen;
