import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, StyleSheet, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabase('test01.db');

const ListScreen = ({ navigation }) => {

    const [searchText, setSearchText] = useState('');
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    //forsearch
    const handleSearch = () => {
        if (searchText.trim() === '') {
            // ไม่ต้องทำการค้นหาถ้าไม่มีข้อความค้นหา
            return;
        }

        // ทำการค้นหาข้อมูลด้วยชื่อการลงทุนที่ผู้ใช้ป้อนเข้ามา
        const filteredInvestments = investments.filter(
            item => item.name.includes(searchText)
        );

        setInvestments(filteredInvestments);
    };

    const handleClearSearch = () => {
        // เคลียร์ข้อความค้นหาและกลับไปแสดงข้อมูลทั้งหมด
        setSearchText('');
        fetchInvestmentData();
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
                    console.error('Error fetching investments:', error);
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


    const handleImageClick = () => {
        Alert.alert('ไม่พบข้อมูล !', 'ไม่พบการลงทุนโปรดสร้างการลงทุนก่อน');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('RoundList', { investmentId: item.id, investmentName: item.name })}>
            <View style={styles.card}>
                <Text style={styles.cardText}>{item.name}</Text>
                {/* Add other card content here */}
                {/* <TouchableOpacity
          style={{ alignSelf: 'center', backgroundColor: '#8D538D', borderRadius: 7, padding: 4 }}
          onPress={() => navigation.navigate('EditInvestment', { id: item.id })}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>เเก้ไขข้อมูลการลงทุน</Text>
        </TouchableOpacity> */}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="ค้นหาด้วยชื่อหรือจำนวนเงินลงทุน"
                    value={searchText}
                    onChangeText={setSearchText}
                />

                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>ค้นหา</Text>
                </TouchableOpacity>
                {searchText !== '' && (
                    <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
                        <Text style={styles.clearSearchButtonText}>เคลียร์</Text>
                    </TouchableOpacity>
                )}
            </View>

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

            {/* <TouchableOpacity
        style={styles.firstButton}
        onPress={() => navigation.navigate('Create')}
      >
        <Text style={styles.textButton}>สร้างการลงทุน</Text>
      </TouchableOpacity> */}
        </View>
    );
};

export default ListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginRight: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    searchButton: {
        backgroundColor: '#3498DB',
        borderRadius: 5,
        padding: 10,
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    clearSearchButton: {
        backgroundColor: '#E74C3C',
        borderRadius: 5,
        padding: 10,
    },
    clearSearchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    list: {
        marginTop: 10,
    },
    card: {
        backgroundColor: '#C8A2C8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFF',
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        color: '#777',
    },
    firstButton: {
        backgroundColor: '#3498DB',
        borderRadius: 7,
        padding: 10,
        alignSelf: 'center',
        marginTop: 20,
    },
    textButton: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

