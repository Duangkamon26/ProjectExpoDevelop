import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const db = SQLite.openDatabase('test01.db');

const ExpenseScreen = ({ route, navigation }) => {
  const { roundId } = route.params;
  const [expenseCategory, setExpenseCategory] = useState(''); // Add state for selected category
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const expenseCategories = [
    { label: 'ค่าปุ๋ย', value: 'ค่าปุ๋ย' },
    { label: 'ค่าเมล็ดพันธ์', value: 'ค่าเมล็ดพันธ์' },
    { label: 'ค่าอุปกรณ์', value: 'ค่าอุปกรณ์' },
    { label: 'ค่าอาหาร', value: 'ค่าอาหาร' },
    { label: 'ค่าว่าจ้าง', value: 'ค่าว่าจ้าง' },
    { label: 'ค่าที่ดิน', value: 'ค่าที่ดิน' },
    { label: 'ค่าขนส่ง', value: 'ค่าขนส่ง' },
    // Add more categories as needed
  ];

  const handleSaveExpense = () => {
    if (!expenseAmount || !expenseCategory) {
      alert('โปรดกรอกจำนวนเงิน และเลือกประเภทค่าใช้จ่าย');
      return;
    }
  
    const parsedExpenseAmount = parseFloat(expenseAmount);
    if (isNaN(parsedExpenseAmount) || parsedExpenseAmount <= 0) {
      alert('จำนวนเงินค่าใช้จ่ายต้องเป็นจำนวนบวก');
      return;
    }
  
    const expenseData = {
      round_id: roundId,
      category: expenseCategory,
      amount: parsedExpenseAmount,
      date: moment(selectedDate).format('YYYY-MM-DD'),
    };

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO expenses (round_id, category, amount, date) VALUES (?, ?, ?, ?);',
        [expenseData.round_id, expenseData.category, expenseData.amount, expenseData.date],
        (_, { insertId }) => {
          console.log('Expense inserted with ID:', insertId);
          navigation.goBack(); // Go back to the InvestmentDetails screen after saving the expense
        },
        (_, error) => {
          console.error('Error inserting expense:', error);
        }
      );
    });
  };

  const handleDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <Text style={styles.headtitle}>เพิ่มค่าใช้จ่าย</Text>

      {/* Expense Category Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={expenseCategory}
          onValueChange={(itemValue) => setExpenseCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="เลือกประเภทค่าใช้จ่าย" value="" />
          {expenseCategories.map((category) => (
            <Picker.Item key={category.value} label={category.label} value={category.value} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="จำนวนเงิน"
        keyboardType="numeric"
        value={expenseAmount}
        onChangeText={setExpenseAmount}
      />

      {/* Expense Date Picker */}
      <TouchableOpacity style={styles.inputmonth} onPress={showDatePickerModal}>
        <Text>{moment(selectedDate).format('LL')}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity style={styles.buttonSubmit} onPress={handleSaveExpense}>
        <Text style={styles.buttonText}>บันทึกค่าใช้จ่าย</Text>
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
    backgroundColor: '#FFFF',
    height: 60,
    borderRadius: 7,

  },
  inputmonth: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 7,
    marginBottom: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF',
    
  },
  buttonSubmit: {
    marginTop:5,
    backgroundColor: '#DC7633',
    padding: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 35,
  },
  pickerContainer: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 7,
    marginBottom: 5,
    overflow: '', // This ensures that the picker stays inside the container
    height:200
  },
  picker: {
    height: 60,
    paddingHorizontal: 8,
  },
});

export default ExpenseScreen;
