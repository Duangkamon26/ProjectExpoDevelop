import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker'; // นำเข้า Picker
const db = SQLite.openDatabase('test01.db');

const EditInvestmentScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [editedName, setEditedName] = useState('');
  const [editedType, setEditedType] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false); // เพิ่มตัวแปร state เพื่อเก็บค่าสถานะการยืนยัน
  const [investmentTypes, setInvestmentTypes] = useState([
    'เกษตรกรรม',
    'การประมง',
    'อื่นๆ',
    'ไม่ระบุ',
  ]);
  useEffect(() => {
    fetchInvestment();
  }, []);

  const fetchInvestment = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM investments WHERE id = ?;',
        [id],
        (_, { rows }) => {
          const investment = rows.item(0);
          setEditedName(investment.name);
          setEditedType(investment.type);
        },
        (_, error) => {
          console.error('Error fetching investment:', error);
        }
      );
    });
  };

  const handleSave = () => {
    if (editedName === '' || editedType === '') {
      console.log('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    if (!isConfirmed) { // เพิ่มเงื่อนไขเพื่อยืนยันการบันทึก
      Alert.alert(
        'ยืนยันการบันทึก',
        'คุณแน่ใจหรือไม่ที่จะบันทึกการแก้ไข?',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'บันทึก', onPress: handleConfirm },
        ]
      );
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE investments SET name = ?, type = ? WHERE id = ?;',
        [editedName, editedType, id],
        () => {
          console.log('แก้ไขการลงทุนเรียบร้อยแล้ว');
          fetchUpdatedInvestments();
          navigation.goBack();
        },
        (_, error) => {
          console.error('Error updating investment:', error);
        }
      );
    });
  };

  const fetchUpdatedInvestments = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM investments;',
        [],
        (_, { rows }) => {
          console.log('Updated investments:', rows._array);
          // Update your investments state or perform any necessary operations with the updated data
        },
        (_, error) => {
          console.error('Error fetching updated investments:', error);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={editedType}
        onValueChange={(itemValue) => setEditedType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="เลือกประเภทการลงทุน" value="" />
        {investmentTypes.map((type) => (
          <Picker.Item key={type} label={type} value={type} />
        ))}
      </Picker>
      <TextInput
        style={styles.input}
        fontSize={20}
        placeholder="แก้ไขชื่อการลงทุน"
        value={editedName}
        onChangeText={setEditedName}
      />
      <TouchableOpacity style={styles.CreateButton} onPress={handleSave}>
        <Text style={styles.textButton}>
          บันทึกการแก้ไข
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditInvestmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginTop: 10
  },
  input: {
    width: '80%',
    height: 60,
    borderColor: 'gray',
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFFF',
    color: 'purple',
    fontWeight: '800'
  },
  CreateButton: {
    borderRadius: 5,
    height: 70,
    width: '80%',
    backgroundColor: 'orange',
    justifyContent: 'center'
  },
  textButton: {
    alignSelf: 'center',
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFFF'
  },
  picker: {
    width: '80%',
    height: 150,
    borderColor: 'gray',
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFFF',
    color: 'purple',
    fontWeight: '800',
  },
});
