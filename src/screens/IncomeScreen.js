import React, { useState ,useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Keyboard,
  TouchableWithoutFeedback,Alert} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const db = SQLite.openDatabase('test01.db');

const IncomeScreen = ({ route, navigation }) => {
  const { roundId } = route.params;
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(''); // Add state for selected category
  const [selectedProduct, setSelectedProduct] = useState(null); // Add state for selected product

  
  const handleSaveIncome = () => {
    if (!incomeName || !incomeAmount) {
      alert('กรุณากรอกชื่อรายรับและจำนวนเงิน');
      return;
    }
  
    const parsedIncomeAmount = parseFloat(incomeAmount);
    if (isNaN(parsedIncomeAmount) || parsedIncomeAmount < 0) {
      alert('จำนวนเงินรายรับต้องเป็นจำนวนบวก');
      return;
    }
  
    const incomeData = {
      round_id: roundId,
      name: incomeName,
      amount: parsedIncomeAmount,
      date: moment(selectedDate).format('YYYY-MM-DD'),
    };
  
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO incomes (round_id, name, amount, date) VALUES (?, ?, ?, ?);',
        [incomeData.round_id, incomeData.name, incomeData.amount, incomeData.date],
        (_, { insertId }) => {
          console.log('Income inserted with ID:', insertId);
          navigation.goBack(); // Go back to the InvestmentDetails screen after saving the income
        },
        (_, error) => {
          console.error('Error inserting income:', error);
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

  const hideDatePickerModal = () => {
    setShowDatePicker(false);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <Text style={styles.headtitle}>เพิ่มรายรับ/ได้</Text>
      <TextInput
        style={styles.input}
        placeholder="ระบุชื่อของรายรับ"
        value={incomeName}
        onChangeText={setIncomeName}
      />

      <TextInput
        style={styles.input}
        placeholder="จำนวนเงิน"
        keyboardType="numeric"
        value={incomeAmount}
        onChangeText={setIncomeAmount}
      />

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

      <TouchableOpacity style={styles.buttonSubmit} onPress={handleSaveIncome}>
        <Text style={styles.buttonText}>บันทึกรายรับ</Text>
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
    backgroundColor:'#FFFF',
    height:60,
    borderRadius:7
  },
  inputmonth: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius:7,
    marginBottom: 16,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#FFFF',
   
  },
  buttonSubmit: {
    backgroundColor: '#2E8BC0',
    padding: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize:35
  },
});

export default IncomeScreen;
