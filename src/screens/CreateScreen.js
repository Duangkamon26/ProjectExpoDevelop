import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Alert,Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
//ระบุdatabase
const db = SQLite.openDatabase('test01.db');

const CreateScreen = () => {
  const navigation = useNavigation();
  const [investments, setInvestments] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [isDataCleared, setIsDataCleared] = useState(false);
  //boxinput
  const handleInputChange = (text) => {
    setInputText(text);
  };
  //pickerinput
  const handleTypeChange = (itemValue) => {
    setSelectedType(itemValue);
  };

  //createTable
  const createTables = (tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS rounds (id INTEGER PRIMARY KEY, investment_id INTEGER, opendate TEXT, enddate TEXT, investment_amount REAL, total_amount REAL, is_closed INTEGER DEFAULT 0, closing_time TEXT, FOREIGN KEY (investment_id) REFERENCES investments (id));',
      [],
      () => {
        console.log('Rounds table created successfully');
      },
      (_, error) => {
        console.error('Error creating rounds table:', error);
      }
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS incomes (id INTEGER PRIMARY KEY, round_id INTEGER, name TEXT, amount REAL, date TEXT, FOREIGN KEY (round_id) REFERENCES rounds (id));',
      [],
      () => {
        console.log('Incomes table created successfully');
      },
      (_, error) => {
        console.error('Error creating incomes table:', error);
      }
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, round_id INTEGER, category TEXT, amount REAL, date TEXT, FOREIGN KEY (round_id) REFERENCES rounds (id));',
      [],
      () => {
        console.log('Expenses table created successfully');
      },
      (_, error) => {
        console.error('Error creating expenses table:', error);
      }
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, round_id INTEGER, name TEXT, quantity INTEGER, FOREIGN KEY (round_id) REFERENCES rounds (id));',
      [],
      () => {
        console.log('Products table created successfully');
      },
      (_, error) => {
        console.error('Error creating products table:', error);
      }
    );
  };

  //fetch
  const fetchInvestments = async () => {
    try {
      const db = await SQLite.openDatabase('test01.db');
      const result = await new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT id, name FROM investments;',
            [],
            (_, { rows }) => resolve(rows),
            (_, error) => reject(error)
          );
        });
      });
      console.log('ดึงข้อมูลหน้าสร้างการลงทุนสำเร็จ');
      const investments = result._array.map(row => ({
        id: row.id,
        name: row.name,
      }));
      setInvestments(investments);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };


  const handleSubmit = () => {
    //condition check null
    if (selectedType === '' || inputText === '') {
      Alert.alert('กรุณากรอกข้อมูลให้ครบ', 'โปรดกรอกข้อมูลทั้งหมดก่อนบันทึก');
      console.log('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    const existingInvestment = investments.find(item => item.name === inputText);
    if (existingInvestment) {
      Alert.alert('ชื่อการลงทุนซ้ำ', 'การลงทุนนี้มีอยู่แล้วลองตรวจสอบหน้าประวัติ');
      console.log('ชื่อการลงทุนซ้ำ');
      return;
    }
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS investments (id INTEGER PRIMARY KEY, type TEXT, name TEXT);',
        [],
        () => {
          tx.executeSql(
            'INSERT INTO investments (id, type, name) VALUES (?, ?, ?);',
            [getNextId(), selectedType, inputText],
            (_, { insertId }) => {
              console.log('เพิ่มการลงงทุนเเล้วที่ ID:', insertId);
              fetchUpdatedInvestments();
              navigation.goBack();
            },
            (_, error) => {
              console.error('Error inserting investment:', error);
            }
          );
        },
        (_, error) => {
          console.error('Error creating investments table:', error);
        }
      );
    });

    setInputText('');
    setSelectedType('');
    createTables();
  };

  const getNextId = () => {
    if (investments.length === 0) {
      return 1; // If no investments exist, start from ID 1
    }

    const maxId = Math.max(...investments.map((item) => item.id));
    return maxId + 1; // Increment the maximum ID by 1
  };

  //CLEAR ALL DATA
  const clearAllData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM investments;',
        [],
        () => {
          console.log('All data cleared');
          setInvestments([]);
          setIsDataCleared(true);
        },
        (_, error) => {
          console.error('Error clearing data:', error);
        }
      );
    });
  };

  useEffect(() => {
    fetchInvestments((fetchedInvestments) => {
      setInvestments(fetchedInvestments);
    });
  }, []);


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
      <Text style={styles.title}>กรอกเพื่อสร้างการลงทุน</Text>
      <Picker
        style={styles.dropdown}
        selectedValue={selectedType}
        onValueChange={handleTypeChange}
        modalStyle={styles.pickerModal} // Add this line
      >
        <Picker.Item label="เลือกประเภทการลงทุน" value="null" />
        <Picker.Item label="เกษตรกรรม" value="เกษตรกรรม" />
        <Picker.Item label="การประมง" value="การประมง" />
        <Picker.Item label="อื่นๆ" value="อื่นๆ" />
        <Picker.Item label="ไม่ระบุ" value="ไม่ระบุ" />
        {/* Add more options as needed */}
      </Picker>
      <TextInput
        style={styles.input}
        fontSize={20}
        placeholder="กรอกชื่อสิ่งที่ต้องการลงทุน"
        value={inputText}
        onChangeText={handleInputChange}
      />




      <TouchableOpacity style={styles.CreateButton} onPress={handleSubmit}>
        <Text style={styles.textButton}>บันทึกการลงทุน</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearAllData}
      >
        <Text style={styles.clearButtonText}>ลบข้อมูลทั้งหมด</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateScreen

// styleเก่า
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor: '#EFDCF9',
    backgroundColor: '#FFF'
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#170B3B'
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
    marginTop:80
  
  },
  CreateButton: {
    borderRadius: 2,
    height: 70,
    width: '80%',
    backgroundColor: '#6500B0',
    justifyContent: 'center'
  },
  textButton: {
    alignSelf: 'center',
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFFF'
  },
  dropdown: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    backgroundColor: '#FFFF',
  },
  clearButtonText: {
    color: '#FFF',
    borderRadius: 10,
    alignSelf: 'center'
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: 'red',
    height: 30,
    width: '80%',
    justifyContent: 'center',
    borderRadius: 10
  },
  pickerModal: {
    marginTop: Platform.OS === 'ios' ? 40 : 0, // Adjust the marginTop value as needed
  },

});

//styleใหม่
// const styles = StyleSheet.create({
//   container: {
//     flex:1,
//     alignItems: 'center',
//     justifyContent: 'flex-center',
//     backgroundColor: '#EFDCF9'
//   },
//   title: {
//     color:'#6500B0',
//     fontSize: 30,
//     fontWeight:'800',
//     marginBottom: 20,
//     ...Platform.select({
//       ios: {
//         marginTop: 40,
//       },
//       android: {
//         marginTop: 20,
//       },
//     }),
//   },
//   dropdown: {
//     width: '80%',
//     ...Platform.select({
//       ios: {
//         backgroundColor:'#FFFF',
//         marginTop: 10,
//         marginBottom: 20,
//         paddingVertical: 0,
//         paddingHorizontal: 16,
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 8,
//       },
//       android: {
//         backgroundColor:'#FFFF',
//         marginBottom: 20,
//         paddingVertical: 10,
//         paddingHorizontal: 16,
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 8,
//         elevation: 2,
//       },
//     }),
//   },
//   input: {
//     backgroundColor:'#FFFF',
//     height:50,
//     width: '80%',
//     marginBottom: 20,
//     fontSize: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     ...Platform.select({
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   CreateButton: {
//     borderRadius: 5,
//     height: 70,
//     width: '80%',
//     backgroundColor: '#6500B0',
//     justifyContent: 'center'
//   },
//   textButton: {
//     alignSelf: 'center',
//     fontSize: 35,
//     fontWeight: 'bold',
//     color: '#FFFF'
//   },
//   clearButton: {
//     marginTop:10,
//     backgroundColor: 'red',
//     padding: 10,
//     borderRadius: 8,
//   },
//   clearButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//   },
// });