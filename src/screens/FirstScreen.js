import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Modal, TextInput, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import InvestmentDetails from './InvestmentDetails';



//สร้างตารางการลงทุน
const createTableInvestment = () => {
    useEffect(() => {
      db.transaction((tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS investments (id INTEGER PRIMARY KEY, type TEXT, name TEXT);',
          [],
          () => {
            console.log('Investments table created successfully');
            // แล้วคุณสามารถเรียกใช้ฟังก์ชัน insertInvestments ได้ที่นี่ถ้าต้องการเพิ่มข้อมูลในตาราง
          },
          (_, error) => {
            console.error('Error creating investments table:', error);
          }
        );
      });
    }, []); // ให้ useEffect ทำงานเมื่อคอมโพเนนต์ตัวนี้ถูกโหลดเท่านั้น
  };

//ดึงข้อมูล
const db = SQLite.openDatabase('test01.db');

 const fetchInvestments = () => {
     return new Promise((resolve, reject) => {
         db.transaction((tx) => {
             tx.executeSql(
                 'SELECT * FROM investments;',
                 [],
                 (_, { rows }) => {
                     const investments = rows._array;
                     resolve(investments);
                 },
                 (_, error) => {
                     console.error('Error fetching investments:', error);
                     reject(error);
                 }
             );
         });
     });
 };
//const fetchInvestments = () => {
//    return new Promise((resolve, reject) => {
//      db.transaction((tx) => {
//        tx.executeSql(
//          'SELECT * FROM investments;',
//          [],
//          (_, { rows }) => {
//            const investments = rows._array;
//            if (investments.length === 0) {
//              resolve(null); // Resolve with null if no investments found
//            } else {
//              resolve(investments);
//            }
//          },
//          (_, error) => {
//            console.error('Error fetching investments:', error);
//            reject(error);
//          }
//        );
//      });
//    });
//  };
  

// Call fetchInvestments using async/await
const fetchInvestmentsSync = async () => {
    try {
      const investments = await fetchInvestments();
      if (investments === null) {
        console.log('Investments data is null');
      } else {
        console.log('ข้อมูลการลงทุนที่ดึงได้:', investments);
        // Update your UI or perform any necessary operations with the fetched data
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };
  
fetchInvestmentsSync();

// Call fetchInvestmentsSync



//clearDB



const FirstScreen = ({ navigation }) => {

    //เรียกใช้ตารางการลงทุน
    // createTableInvestment();
    const handleImageClick = () => {
        Alert.alert('ไม่พบข้อมูล !', 'ไม่พบการลงทุนโปรดสร้างการลงทุนก่อน');
    };
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rounds, setRounds] = useState([]);
    
    const fetchRounds = () => {
        db.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM rounds WHERE investment_id = ?;',
            [investmentId],
            (_, { rows }) => {
              const roundsData = rows._array;
              setRounds(roundsData);
            },
            (_, error) => {
              console.error('Error fetching investment rounds:', error);
            }
          );
        });
      };

      

    const fetchInvestmentData = () => {
        setLoading(true);                
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM investments;',
                [],
                (_, { rows }) => {
                    const updatedInvestments = rows._array;
                    setInvestments(updatedInvestments);
                    setLoading(false);
                },
                (_, error) => {
                    console.error('Error fetching investments22:', error);
                    setInvestments([]);
                    setLoading(false);
                }
            );
        });
    };

    useEffect(() => {
        // Fetch investment data when the screen mounts
        fetchInvestmentData();
    }, []);

    useEffect(() => {
        // Fetch investment data again when the investments array changes
        fetchInvestmentData();
    }, [investments]);

    
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


    //old
    // const renderItem = ({ item }) => (

    //     <TouchableOpacity onPress={() => navigation.navigate('Details', { id: item.id })}>

    //         <View style={styles.card}>
    //             <Text style={styles.cardText}>{item.name}</Text>
    //             {/* Add other card content here */}
    //         </View>
    //     </TouchableOpacity>
    // );
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Details', { id: item.id })}>
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.name}</Text>
            {/* Add other card content here */}
            <TouchableOpacity
            style={{alignSelf:'center',backgroundColor:'#8D538D',borderRadius:7,padding:4}} onPress={() => navigation.navigate('EditInvestment', { id: item.id })}>
              <Text style={{color:'white',fontWeight:'600'}}>เเก้ไขข้อมูลการลงทุน</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
      
    return (
        <View style={styles.container}>
            {investments.length > 0 ? (
                <FlatList
                    data={investments}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                />
            ) : (
                <View>
                    <TouchableOpacity onPress={handleImageClick}>
                        <Image
                            source={require('../../assets/emptyfirst.png')}
                            style={{ width: 200, height: 200 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleImageClick}>
                        <Text style={styles.noDataText}>ยังไม่พบข้อมูลการลงทุน</Text>
                    </TouchableOpacity>
                </View>
            )}


            <TouchableOpacity
                style={styles.firstButton}
                onPress={() => navigation.navigate('Create')}
            >
                <Text style={styles.textButton}>สร้างการลงทุน</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
                style={{ backgroundColor: 'blue',marginBottom:60,height:50,width:'90%',borderRadius:7 }}
                onPress={() => navigation.navigate('ListInvest', { investments })}
            >
                <Text style={{ color: '#FFFF',alignSelf:'center',justifyContent:'center',fontSize:50 }}>LIST</Text>
            </TouchableOpacity> */}







            {/* ปุ่มสำหรับrefreshดึงข้อมูลให้เเสดง */}
            {/* <TouchableOpacity style={styles.refreshButton} onPress={fetchInvestmentData} disabled={loading}>
                <Text style={styles.refreshButtonText}>{loading ? 'กำลังโหลด...' : 'รีโหลดข้อมูล'}</Text>
            </TouchableOpacity> */}

        </View>


    );
};


export default FirstScreen

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        justifyContent: 'space-around'
        , alignItems: 'center',
        backgroundColor: '#FFFF',
        flex: 1,
    },
    firstButton: {
        borderRadius: 10,
        height: 80,
        width: '90%',
        backgroundColor: '#887BB0',
        justifyContent: 'center',
        marginBottom: 10
    },
    textButton: {
        alignSelf: 'center',
        fontSize: 45,
        fontWeight: 'bold',
        color: '#FFFF'
    },
    flatlistText: {
        fontSize: 15,
        color: 'black',

    },
    card: {
        // backgroundColor: '#85D2D0',
        backgroundColor:'#C8A2C8',
        borderRadius: 8,
        padding: 10,
        marginBottom: 5,
        width: '100%',
        borderWidth:0
        // Add other card styles as needed
    },

    cardText: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center'
        // Add other card text styles as needed
    },
    list: {
        width: '80%',
        height: '80%',
    },
    noDataText: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 10
    }
    , refreshButton: {
        borderRadius: 10,
        height: 40,
        width: '90%',
        backgroundColor: '#85D2D0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    firstButton: {
        borderRadius: 10,
        height: 80,
        width: '90%',
        backgroundColor: '#51087E',
        justifyContent: 'center',
        marginBottom: 10
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalInput: {
        width: '100%',
        height: 40,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'gray',
        paddingLeft: 8,
    },
    modalButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginBottom: 8,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },


})