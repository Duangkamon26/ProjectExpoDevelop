import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Button, Platform,Keyboard,
  TouchableWithoutFeedback,Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import moment from 'moment';
import 'moment/locale/th';
import DateTimePicker from '@react-native-community/datetimepicker';

const db = SQLite.openDatabase('test01.db'); // Import your database connection here

const EditRoundScreen = ({ route, navigation }) => {
  const { roundId } = route.params;
  const [rounds, setRounds] = useState([]);
  const [roundData, setRoundData] = useState(null);
  const [opendate, setOpendate] = useState(null);
  const [enddate, setEnddate] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investment, setInvestment] = useState(null);
  const [round, setRound] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [amountError, setAmountError] = useState('');
  const [showOpendatePicker, setShowOpendatePicker] = useState(false);
  const [showEnddatePicker, setShowEnddatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Hide the date picker after selecting a date
    if (selectedDate) {
      setOpendate(selectedDate);
    }
  };
  useEffect(() => {
    // Check if roundId exists before fetching the data
    if (roundId) {
      fetchRoundData(roundId);
      fetchInvestmentRounds();
    }
  }, [roundId]);

  const fetchInvestmentRounds = () => {
    // Fetch investment rounds data from the database
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM rounds;',
        [],
        (_, { rows }) => {
          // Rounds data found
          const roundsData = rows._array;
          setRounds(roundsData);
        },
        (_, error) => {
          console.error('Error fetching investment rounds:', error);
        }
      );
    });
  };
  const handleEnddateChange = (event, selectedDate) => {
    setShowEnddatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEnddate(selectedDate);
    }
  };
  const renderRoundItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.cardRound}
        onPress={() => handleEditRoundPress(item.id)}
      >
        <Text style={styles.roundId}>การลงทุนครั้งที่: {item.id}</Text>
        {/* Add other information about the investment round here */}
      </TouchableOpacity>
    );
  };

  const fetchRoundData = (roundId) => {
    // Fetch the round data from the database using the roundId
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM rounds WHERE id = ?;',
        [roundId],
        (_, { rows }) => {
          if (rows.length > 0) {
            // Round data found
            const roundData = rows.item(0);
            setRoundData(roundData);

            // Convert the dates to Moment objects for use in DatePicker
            setOpendate(moment(roundData.opendate).toDate());
            if (roundData.enddate) {
              setEnddate(moment(roundData.enddate).toDate());
            }

            // Set the investment amount
            setInvestmentAmount(roundData.investment_amount.toString());
            // Set the selected round data
            setRound(roundData);
          } else {
            // Round data not found (handle the error)
            console.log('Round data not found');
          }
        },
        (_, error) => {
          console.error('Error fetching round data:', error);
        }
      );
    });
  };
  const handleDeleteRound = () => {
    Alert.alert(
      'ยืนยันการลบรอบการลงทุน',
      'คุณต้องการลบรอบการลงทุนนี้ใช่หรือไม่?',
      [
        {
          text: 'ยืนยัน',
          onPress: () => {
            db.transaction((tx) => {
              tx.executeSql(
                'DELETE FROM rounds WHERE id = ?;',
                [roundId],
                () => {
                  console.log('Round deleted successfully');
                  // Navigate back to the previous screen
                  navigation.goBack();
                },
                (_, error) => {
                  console.error('Error deleting round:', error);
                }
              );
            });
          },
        },
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
      ]
    );
  };
 // Function to check if all required inputs are filled
 const isFormValid = () => {
  return !!opendate && !!enddate && !!investmentAmount;
};
  const handleEditRoundPress = (roundId) => {
    // Handle the onPress event for a specific round item
    // Set the roundId or navigate to another screen for editing a specific round
  };

  // Function to handle saving the round data
  const handleSaveRound = () => {
    if (!isValidAmount || !isFormValid()) {
      Alert.alert('เตือน !', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    Alert.alert(
      'ยืนยัน !',
      'คุณต้องการบันทึกเเก้ไขข้อมูลรอบการลงทุนใช่หรือไม่?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            // Update the round data in the database
            const opendateString = moment(opendate).format('YYYY-MM-DD');
            const enddateString = enddate ? moment(enddate).format('YYYY-MM-DD') : null;

            db.transaction((tx) => {
              tx.executeSql(
                'UPDATE rounds SET opendate = ?, enddate = ?, investment_amount = ? WHERE id = ?;',
                [opendateString, enddateString, investmentAmount, roundId],
                () => {
                  console.log('Round data updated successfully');
                  // Navigate back to the previous screen (InvestmentDetailsScreen)
                  navigation.goBack();
                },
                (_, error) => {
                  console.error('Error updating round data:', error);
                }
              );
            });
          },
        },
      ]
    );
  };

  // Function to handle saving the new round data
  const handleSaveNewRound = () => {
    if (!isValidAmount || !isFormValid()) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    Alert.alert(
      'Confirm',
      'คุณต้องการสร้างรอบการลงทุนใหม่ใช่หรือไม่?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            // Save the new round data to the database
            const opendateString = moment(opendate).format('YYYY-MM-DD');
            const enddateString = moment(enddate).format('YYYY-MM-DD');

            db.transaction((tx) => {
              tx.executeSql(
                'INSERT INTO rounds (opendate, enddate, investment_amount) VALUES (?, ?, ?);',
                [opendateString, enddateString, investmentAmount],
                () => {
                  console.log('New round created successfully');
                  // Close the modal and reset the input fields and date pickers
                  setIsModalVisible(false);
                  setAmount('');
                  setOpendate(null);
                  setEnddate(null);
                  // Fetch updated investment rounds data from the database
                  fetchInvestmentRounds();
                },
                (_, error) => {
                  console.error('Error creating new round:', error);
                }
              );
            });
          },
        },
      ]
    );
  };

  const validateInvestmentAmount = (amount) => {
    // Perform validation for the investment amount
    // You can customize the validation rules based on your requirements
    if (isNaN(amount) || amount <= 0) {
      setIsValidAmount(false);
      setAmountError('กรุณากรอกจำนวนเงินการลงทุนให้ถูกต้อง');
    } else {
      setIsValidAmount(true);
      setAmountError('');
    }
  };

  const handleOpendateChange = (event, selectedDate) => {
    setShowOpendatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setOpendate(selectedDate);
    }
  };

  const handleCreateRound = () => {
    // Reset the input fields and date pickers when opening the modal
    setIsModalVisible(true);
    setAmount('');
    setOpendate(null);
    setEnddate(null);
  };



  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <Text style={styles.headerText}>หน้าเเก้ไขรายการการลงทุน</Text>
      {/* <FlatList
        data={rounds}
        renderItem={renderRoundItem}
        keyExtractor={(item) => item.id.toString()}
      /> */}
      {/* Render input fields for editing round details */}
      {round && (
        <View style={styles.editRoundContainer}>
          <Text style={styles.roundId}>การลงทุนครั้งที่: {round.id}</Text>
          <Text>วันเปิดรอบปัจจุบัน: {moment(opendate).locale('th').format('LL')}</Text>
          {/* <Text>
            วันปิดรอบ: {enddate ? moment(enddate).locale('th').format('LL') : 'วันปิดรอบยังไม่ได้กำหนด'}
          </Text> */}
          <TextInput
            style={[styles.input, !isValidAmount ? styles.inputError : null]}
            keyboardType="numeric"
            placeholder="จำนวนเงินการลงทุนของรอบนี้"
            value={investmentAmount}
            onChangeText={(text) => {
              setInvestmentAmount(text);
              validateInvestmentAmount(text);
            }}
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={{fontSize:20,color:'red',alignSelf:'center'}}>เเก้ไขวันเปิดรอบ</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={opendate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          {!isValidAmount && <Text style={styles.errorText}>{amountError}</Text>}
          {/* Add other input fields as needed (e.g., total income, total expenses, etc.) */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveRound}>
            <Text style={styles.buttonText}>บันทึกเเก้ไขข้อมูลรอบการลงทุน</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteRound}>
              <Text style={styles.buttonText}>ลบรอบการลงทุน</Text>
            </TouchableOpacity>
          {/* Add other buttons or components for handling different actions */}
        </View>
      )}

      {/* Modal for creating a new round */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>สร้างรอบการลงทุน</Text>
          <TextInput
            style={[styles.input, !isValidAmount ? styles.inputError : null]}
            keyboardType="numeric"
            placeholder="จำนวนเงินการลงทุนของรอบนี้"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              validateInvestmentAmount(text);
            }}
          />
          {!isValidAmount && <Text style={styles.errorText}>{amountError}</Text>}
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
          <Text style={{ alignSelf: 'center' }}>กำหนดวันปิดรอบของการลงทุน:</Text>
          <Button
            onPress={() => setShowEnddatePicker(true)}
            title="DEFINEENDDATE"
            style={styles.buttonStyle}
            color="#2E8BC0"
          />
          {showEnddatePicker && (
            <DateTimePicker
              value={enddate || new Date()}
              mode="date"
              display="default"
              onChange={handleEnddateChange}
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveNewRound}>
            <Text style={styles.buttonText}>สร้างรอบ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.buttonText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Button to trigger creating a new round */}
      {/* <TouchableOpacity style={styles.createRoundBtn} onPress={handleCreateRound}>
        <Text style={styles.createRoundBtnText}>สร้างรอบการลงทุนใหม่</Text>
      </TouchableOpacity> */}
    </View>
    </TouchableWithoutFeedback>
  );
};


export default EditRoundScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  editRoundContainer: {
    marginBottom: 16,
  },
  roundId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    height:50,
    marginTop:5

  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    fontSize:15
  },
  saveButton: {
    backgroundColor: '#2E8BC0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    height:60
  },
  buttonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  createRoundBtn: {
    backgroundColor: '#2E8BC0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  createRoundBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  cancelButton: {
    backgroundColor: '#C0392B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonStyle: {
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    height: 60,
  },
});
