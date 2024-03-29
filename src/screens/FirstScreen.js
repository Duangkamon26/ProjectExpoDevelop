import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Modal, TextInput, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import InvestmentDetails from './InvestmentDetails';
import { useNavigation } from '@react-navigation/native';



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



const FirstScreen = ({ navigation , route }) => {

    //เรียกใช้ตารางการลงทุน
    // createTableInvestment();
    const handleImageClick = () => {
        Alert.alert('ไม่พบข้อมูล !', 'ไม่พบการลงทุนโปรดสร้างการลงทุนก่อน');
    };
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rounds, setRounds] = useState([]);
    const [roundsData, setRoundsData] = useState([]);
    // const { investmentId, investmentName } = route.params;
    const [selectedValue, setSelectedValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    // const { id } = route.params;

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };


    const fetchRoundsData = () => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM rounds WHERE investment_id = ?;',
                    [investments], // ใช้ investmentId ที่ถูกส่งมาจากหน้า ListScreen
                    (_, { rows }) => {
                        const fetchedRoundsData = [];
                        const numRounds = rows.length;

                        for (let i = 0; i < numRounds; i++) {
                            const round = rows.item(i);
                            const opendate = moment(round.opendate, 'YYYY-MM-DD').toDate();
                            const enddate = round.is_closed ? moment(round.enddate, 'YYYY-MM-DD').toDate() : null;

                            fetchedRoundsData.push({
                                id: round.id,
                                investment_id: round.investment_id,
                                opendate: opendate,
                                enddate: enddate,
                                isRoundClosed: !!round.is_closed,
                                // Add other properties you need from the database
                            });
                        }

                        // Resolve the promise with the fetched data
                        resolve(fetchedRoundsData);
                    },
                    (_, error) => {
                        // Reject the promise if there's an error
                        reject(error);
                    }
                );
            });
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rounds = await fetchRoundsData();
                setRoundsData(rounds);

                await Promise.all(promises);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    const handleEditRoundPress = (roundId) => {
        navigation.navigate('EditRound', { roundId });
    };


    const renderRoundItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.cardRound}>
                <Text style={styles.roundId} onPress={() => handleEditRoundPress(item.id)}>
                    การลงทุน ID {item.id}
                </Text>
               
            </TouchableOpacity>
        );
    };


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
          <TouchableOpacity style={styles.cardRound}>
                <Text style={styles.roundId} onPress={() => handleEditRoundPress(item.id)}>
                    การลงทุน ID {item.id}
                </Text>
               
            </TouchableOpacity>
         
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
    

    // container: {
    //     flex: 1,
    //     padding: 16,
    //     backgroundColor: '#F5F5F5',
    // },
    // button: {
    //     backgroundColor: '#FF6347',
    //     paddingVertical: 10,
    //     paddingHorizontal: 20,
    //     borderRadius: 8,
    //     width: 100,
    // },
    // buttonText: {
    //     color: 'white',
    //     fontWeight: 'bold',
    // },
    // title: {
    //     fontSize: 24,
    //     fontWeight: 'bold',
    //     marginBottom: 16,
    //     textShadowColor: 'rgba(0, 0, 0, 0.3)',
    //     textShadowOffset: { width: 2, height: 2 },
    //     textShadowRadius: 4,
    //     color: '#9400D3',
    // },
    // cardRound: {
    //     borderWidth: 1,
    //     borderColor: '#E0E0E0',
    //     borderRadius: 8,
    //     padding: 16,
    //     marginBottom: 16,
    //     backgroundColor: '#FFFAFA',
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 2,
    //     elevation: 2,
    // },
    // roundId: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     marginBottom: 8,
    //     color: '#3333FF', 
    //     headerTintColor: '#9400D3'
    //     // textShadowColor: 'rgba(0, 0, 0, 0.3)',
    //     // textShadowOffset: { width: 2, height: 2 },
    //     // textShadowRadius: 4,
    // },
    // date: {
    //     fontSize: 16,
    //     marginBottom: 8,
    //     color: '#555',
    // },
    // amount: {
    //     fontSize: 16,
    //     marginBottom: 8,
    //     color: '#006600',
    // },
    // chartProductBtn: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: '#007ACC',
    //     borderRadius: 4,
    //     paddingHorizontal: 8,
    //     paddingVertical: 4,
    //     justifyContent: 'center',
    //     width: 120,
    //     marginTop: 8,
    // },
    // buttonText: {
    //     color: 'white',
    //     marginLeft: 4,
    // },
    // disabledButtonText: {
    //     opacity: 0.5,
    // },
    // sectionTitle: {
    //     fontSize: 19,
    //     fontWeight: 'bold',
    //     marginTop: 16,
    //     marginBottom: 8,
    //     color: '#333',
    // },
    // itemContainerIncome: {
    //     backgroundColor: '#D4E6F1',
    //     padding: 10,
    //     marginBottom: 5,
    //     borderRadius: 5,
    // },
    // itemText: {
    //     fontSize: 16,
    //     color: '#333',
    // },
    // itemText1: {
    //     fontSize: 17,
    //     fontWeight: 'bold',
    //     color: '#333',
    // },
    // itemContainerExpense: {
    //     backgroundColor: '#F5B7B1',
    //     padding: 10,
    //     marginBottom: 5,
    //     borderRadius: 5,
    // },
    // itemContainerProduct: {
    //     backgroundColor: '#D5F5E3',
    //     padding: 10,
    //     marginBottom: 5,
    //     borderRadius: 5,
    // },
    // chartInvestmentBtn: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: '#FF1493',
    //     borderRadius: 4,
    //     paddingHorizontal: 8,
    //     paddingVertical: 4,
    //     justifyContent: 'center',
    //     width: 160,
    //     marginTop: 16,
    // },
    // itemTextTotal: {
    //     fontSize: 16,
    //     color: '#333',
    //     marginTop: 8,
    // },
    // itemContainer1: {
    //     borderWidth: 2,
    //     borderRadius: 8,
    //     borderColor: '#3300FF',
    //     padding: 10,
    //     marginBottom: 5,
    //     backgroundColor: '#FFFAFA',
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 2,
    //     elevation: 2,
    // },
    // itemContainer2: {
    //     borderWidth: 2,
    //     borderRadius: 8,
    //     borderColor: '#FF3366',
    //     padding: 10,
    //     marginBottom: 5,
    //     backgroundColor: '#FFFAFA',
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 2,
    //     elevation: 2,
    // },
    // itemContainer3: {
    //     borderWidth: 2,
    //     borderRadius: 8,
    //     padding: 10,
    //     marginBottom: 5,
    //     backgroundColor: 'white',
    //     elevation: 2,
    // },

    // button: {
    //     backgroundColor: '#FF6347',
    //     paddingVertical: 10,
    //     paddingHorizontal: 20,
    //     borderRadius: 8,
    //     width: 100,
    // },
    // buttonText: {
    //     color: 'white',
    //     fontWeight: 'bold',
    // },
    // title: {
    //     fontSize: 24,
    //     fontWeight: 'bold',
    //     marginBottom: 16,
    //     textShadowColor: 'rgba(0, 0, 0, 0.3)',
    //     textShadowOffset: { width: 2, height: 2 },
    //     textShadowRadius: 4,
    //     color: '#9400D3',
    // },
    // cardRound: {
    //     borderWidth: 1,
    //     borderColor: '#E0E0E0',
    //     borderRadius: 8,
    //     padding: 16,
    //     marginBottom: 16,
    //     backgroundColor: '#FFFAFA',
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 2,
    //     elevation: 2,
    // },
    // roundId: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     marginBottom: 8,
    //     color: '#3333FF', 
    //     headerTintColor: '#9400D3'
    //     // textShadowColor: 'rgba(0, 0, 0, 0.3)',
    //     // textShadowOffset: { width: 2, height: 2 },
    //     // textShadowRadius: 4,
    // },
    // date: {
    //     fontSize: 16,
    //     marginBottom: 8,
    //     color: '#555',
    // },
    // amount: {
    //     fontSize: 16,
    //     marginBottom: 8,
    //     color: '#006600',
    // },
    // buttonText: {
    //     color: 'white',
    //     marginLeft: 4,
    // },
    // disabledButtonText: {
    //     opacity: 0.5,
    // },
    // sectionTitle: {
    //     fontSize: 19,
    //     fontWeight: 'bold',
    //     marginTop: 16,
    //     marginBottom: 8,
    //     color: '#333',
    // },
    // itemText: {
    //     fontSize: 16,
    //     color: '#333',
    // },
    // itemText1: {
    //     fontSize: 17,
    //     fontWeight: 'bold',
    //     color: '#333',
    // },
    // chartInvestmentBtn: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: '#FF1493',
    //     borderRadius: 4,
    //     paddingHorizontal: 8,
    //     paddingVertical: 4,
    //     justifyContent: 'center',
    //     width: 160,
    //     marginTop: 16,
    // },
    // itemTextTotal: {
    //     fontSize: 16,
    //     color: '#333',
    //     marginTop: 8,
    // },


})
