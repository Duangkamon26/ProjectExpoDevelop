import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, FlatList, Button } from 'react-native'; // ตัวอย่าง import คอมโพเนนต์ที่ใช้ในหน้า EditRoundScreen
import * as SQLite from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/th';
const db = SQLite.openDatabase('test01.db');

const EditRoundScreen = ({ route, navigation }) => {
    const { roundId } = route.params;
    const [roundData, setRoundData] = useState(null);
    const [modifiedRound, setModifiedRound] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showOpendatePicker, setShowOpendatePicker] = useState(false);
    const [opendate, setOpendate] = useState('');
    const [enddate, setEnddate] = useState('');
    const [amount, setAmount] = useState('');
  
    useEffect(() => {
      fetchRoundData();
    }, []);
  
    const fetchRoundData = () => {
      // Fetch the round data using the roundId from the database
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM rounds WHERE id = ?;',
          [roundId],
          (_, { rows }) => {
            const roundData = rows._array[0];
            setRoundData(roundData);
            setModifiedRound({ ...roundData }); // Initialize 'modifiedRound' state with the fetched data
          },
          (_, error) => {
            console.error('Error fetching round data:', error);
          }
        );
      });
    };
  
    const handleUpdateRound = () => {
      // Validate the modified data (optional)
      if (!modifiedRound || !modifiedRound.opendate || !modifiedRound.investment_amount) {
        Alert.alert('Error', 'Please fill in all the required fields.');
        return;
      }
  
      // Perform the update operation in the database (similar to your handleUpdateRound function)
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE rounds SET opendate = ?, enddate = ?, investment_amount = ? WHERE id = ?;',
          [modifiedRound.opendate, modifiedRound.enddate, modifiedRound.investment_amount, roundId],
          () => {
            console.log('Round updated successfully');
            setRoundData(modifiedRound);
          },
          (_, error) => {
            console.error('Error updating round:', error);
          }
        );
      });
    };
  
    const handleChange = (field, value) => {
      setModifiedRound((prevState) => ({ ...prevState, [field]: value }));
    };
  
    if (!roundData) {
      return <Text>Loading...</Text>;
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายละเอียดการลงทุนของ : {investment.name}</Text>
      <TouchableOpacity style={styles.buttonRefresh} onPress={handleRefresh}>
        <Text style={styles.buttonTextRefresh}>รีโหลดข้อมูล</Text>
      </TouchableOpacity>
      <FlatList
        data={rounds}
        renderItem={({ item }) => renderRoundItem({ item, incomes, expenses, products })}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity style={styles.buttonRound} onPress={handleAddRound}>
        <Text style={styles.buttonTextRound}>สร้างรอบการลงทุน</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonClear} onPress={handleClearRounds}>
        <Text style={styles.buttonTextClear}>Clear Round</Text>
      </TouchableOpacity>


      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>สร้างรอบการลงทุน</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="จำนวนเงินการลงทุนของรอบนี้"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={{ alignSelf: 'center' }}>กำหนดวันเปิดรอบของการลงทุน:</Text>
          <Button
            onPress={() => setShowOpendatePicker(true)}
            title="DEFINEOPENDATE"
            style={styles.buttonStyle}
            color="#2E8BC0"
          />
          {showOpendatePicker && (
            <DateTimePicker
              value={opendate || new Date()}
              mode="date"
              display="default"
              onChange={handleOpendateChange}
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateRound}>
            <Text style={styles.buttonText}>สร้างรอบ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.buttonText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFFF'
      },
    
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      buttonClear: {
        marginBottom: 10,
        backgroundColor: 'red',
        justifyContent: 'center',
        height: 30,
        width: '80%',
        borderRadius: 7
      },
      buttonRound: {
        backgroundColor: '#51087E',
        justifyContent: 'center',
        height: 50,
        width: '80%',
        borderWidth: 1,
        borderRadius: 7,
        marginBottom: 5
      },
      buttonTextRound: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: 'white'
      },
      buttonTextClear: {
        fontSize: 15,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: '#FFFF'
      },
      buttonRefresh: {
        backgroundColor: '#81B622',
        justifyContent: 'center',
        height: 30,
        width: '30%',
        borderRadius: 7,
        marginBottom: 5,
        alignSelf: 'flex-start',
        marginLeft: 25
    
      },
      buttonTextRefresh: {
        fontSize: 15,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: 'white',
      },
      modalContainer: {
        marginTop: 50,
        flex: 1,
        justifyContent: 'flex-start',
        padding: 20,
        // backgroundColor: '#EFDCF9',
        backgroundColor: '#FFFF'
      },
      modalTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
        alignSelf: 'center',
        color: '#6500B0'
      },
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#FFFF',
        height: 50,
      },
      saveButton: {
        marginTop: 100,
        backgroundColor: '#6500B0',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignSelf: 'center'
      },
      cancelButton: {
        marginTop: 5,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignSelf: 'center'
      },
      buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
      },
      buttonStyle: {
        width: '50%',
      },
      cardRound: {
        backgroundColor: '#fff',
        padding: 5,
        margin: 5,
        borderRadius: 8,
        elevation: 2,
        backgroundColor: '#FFFF'
      },
      roundId: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      date: {
        fontSize: 14,
      },
      amount: {
        fontSize: 25,
        fontWeight: '500',
        color: 'blue'
      },
      detailsButton: {
        color: 'green',
        marginTop: 10
      },
      expensebtn: {
        marginTop: 5,
        backgroundColor: '#DC7633',
        borderRadius: 7,
        width: '100%',
        height: 30,
        alignSelf: 'center'
      },
      incomebtn: {
        marginTop: 5,
        backgroundColor: '#3498DB',
        borderRadius: 7,
        width: '100%',
        height: 30,
        alignSelf: 'center'
      },
      productbtn: {
        marginTop: 5,
        backgroundColor: '#52BE80',
        borderRadius: 7,
        width: '100%',
        height: 30,
        alignSelf: 'center'
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
        color: '#2E8BC0',
      },
      itemContainer: {
        marginBottom: 8,
      },
      itemText: {
        fontSize: 16,
        color: 'black',
      },
      chartInvestmentBtn: {
        backgroundColor: '#2E8BC0',
        padding: 12,
        alignItems: 'center',
        borderRadius: 4,
        marginTop: 8,
      },
};

export default EditRoundScreen;
