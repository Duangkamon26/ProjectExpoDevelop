import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback,Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const db = SQLite.openDatabase('test01.db');

const IncomeScreen = ({ route, navigation }) => {
    const { incomeId, incomeData } = route.params;
    const [incomeName, setIncomeName] = useState('');
    const [incomeAmount, setIncomeAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');

    // This state holds the data of the selected income for editing or deletion
    const [selectedIncome, setSelectedIncome] = useState(null);

    useEffect(() => {
        // Check if we received any income data for editing
        if (route.params?.incomeData) {
            const { name, amount, date } = route.params.incomeData;
            setIncomeName(name);
            setIncomeAmount(amount.toString());
            setSelectedDate(new Date(date));
            setSelectedIncome(route.params.incomeData);
        }
    }, [route.params]);

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
            round_id: incomeId,
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
                    navigation.goBack();
                },
                (_, error) => {
                    console.error('Error inserting income:', error);
                }
            );
        });
    };

    const handleUpdateIncome = () => {
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
            round_id: incomeId,
            name: incomeName,
            amount: parsedIncomeAmount,
            date: moment(selectedDate).format('YYYY-MM-DD'),
        };

        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE incomes SET name = ?, amount = ?, date = ? WHERE id = ?;',
                [incomeData.name, incomeData.amount, incomeData.date, selectedIncome.id],
                () => {
                    console.log('Income updated');
                    navigation.goBack();
                },
                (_, error) => {
                    console.error('Error updating income:', error);
                }
            );
        });
    };

    const handleDeleteIncome = () => {
        if (!selectedIncome) {
            return;
        }

        // Show confirmation alert before deleting the income
        Alert.alert(
            'ยืนยันการลบ',
            'คุณต้องการลบข้อมูลรายรับนี้ใช่หรือไม่?',
            [
                {
                    text: 'ยกเลิก',
                    style: 'cancel',
                },
                {
                    text: 'ลบ',
                    onPress: () => {
                        db.transaction((tx) => {
                            tx.executeSql(
                                'DELETE FROM incomes WHERE id = ?;',
                                [selectedIncome.id],
                                () => {
                                    console.log('Income deleted');
                                    navigation.goBack();
                                },
                                (_, error) => {
                                    console.error('Error deleting income:', error);
                                }
                            );
                        });
                    },
                    style: 'destructive',
                },
            ],
        );
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
                <Text style={styles.headtitle}>{selectedIncome ? 'แก้ไขรายรับ' : 'เพิ่มรายรับ'}</Text>
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
                    <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
                )}

                {selectedIncome ? (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buttonDelete} onPress={handleDeleteIncome}>
                            <Text style={styles.buttonText}>ลบรายรับ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonUpdate} onPress={handleUpdateIncome}>
                            <Text style={styles.buttonText}>บันทึกการแก้ไข</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.buttonSubmit} onPress={handleSaveIncome}>
                        <Text style={styles.buttonText}>บันทึกรายรับ</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableWithoutFeedback>
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
        backgroundColor: '#FFFF',
        height: 60,
        borderRadius: 7,
    },
    inputmonth: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 7,
        marginBottom: 16,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFF',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    buttonSubmit: {
        backgroundColor: '#2E8BC0',
        padding: 12,
        alignItems: 'center',
        borderRadius: 4,
    },
    buttonUpdate: {
        backgroundColor: '#2E8BC0',
        padding: 12,
        alignItems: 'center',
        borderRadius: 4,
        flex: 1,
        marginRight: 8,

    },
    buttonDelete: {
        backgroundColor: '#C0392B',
        padding: 12,
        alignItems: 'center',
        borderRadius: 4,
        flex: 1,
        marginLeft: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 25,

    },
});

export default IncomeScreen;
