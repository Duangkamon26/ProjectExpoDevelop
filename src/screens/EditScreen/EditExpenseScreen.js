import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard,
    TouchableWithoutFeedback, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';


const db = SQLite.openDatabase('test01.db');

const EditExpenseScreen = ({ route, navigation }) => {
    const { expenseId } = route.params;
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

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT  category, amount, date FROM expenses WHERE id = ?;',
                [expenseId],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        const expense = rows.item(0);
                        setExpenseCategory(expense.category);
                        setExpenseAmount(expense.amount.toString());
                        setSelectedDate(new Date(expense.date));
                    }
                },
                (_, error) => {
                    console.error('Error fetching expense details:', error);
                }
            );
        });
    }, [expenseId]);

    const handleUpdateExpense = () => {
        if (!expenseAmount || !expenseCategory) {
            alert('โปรดกรอกชื่อค่าใช้จ่าย จำนวนเงิน และเลือกประเภทค่าใช้จ่าย');
            return;
        }

        const parsedExpenseAmount = parseFloat(expenseAmount);
        if (isNaN(parsedExpenseAmount) || parsedExpenseAmount <= 0) {
            alert('จำนวนเงินค่าใช้จ่ายต้องเป็นจำนวนบวก');
            return;
        }

        const expenseData = {
            category: expenseCategory,
            amount: parsedExpenseAmount,
            date: moment(selectedDate).format('YYYY-MM-DD'),
        };

        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE expenses SET category = ?, amount = ?, date = ? WHERE id = ?;',
                [expenseData.category, expenseData.amount, expenseData.date, expenseId],
                () => {
                    console.log('Expense updated successfully');
                    navigation.goBack(); // Go back to the previous screen after updating the expense
                },
                (_, error) => {
                    console.error('Error updating expense:', error);
                }
            );
        });
    };

    // Function to handle deleting the expense
    const handleDeleteExpense = () => {
        Alert.alert(
            'ยืนยันการลบค่าใช้จ่าย',
            'คุณต้องการลบค่าใช้จ่ายนี้ใช่หรือไม่?',
            [
                {
                    text: 'ยืนยัน',
                    onPress: () => {
                        db.transaction((tx) => {
                            tx.executeSql(
                                'DELETE FROM expenses WHERE id = ?;',
                                [expenseId],
                                () => {
                                    console.log('Expense deleted successfully');
                                    navigation.goBack(); // Go back to the previous screen after deleting the expense
                                },
                                (_, error) => {
                                    console.error('Error deleting expense:', error);
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
                <Text style={styles.headtitle}>แก้ไขค่าใช้จ่าย</Text>

                <TextInput
                    style={styles.input}
                    placeholder="จำนวนเงิน"
                    keyboardType="numeric"
                    value={expenseAmount}
                    onChangeText={setExpenseAmount}
                />

                {/* Add the Picker for selecting the expense category */}
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

                <TouchableOpacity style={styles.buttonSubmit} onPress={handleUpdateExpense}>
                    <Text style={styles.buttonText}>บันทึกการเปลี่ยนแปลง</Text>
                </TouchableOpacity>

                {/* Add a button for deleting the expense */}
                {/* Button to delete the expense */}
                <TouchableOpacity style={styles.buttonDelete} onPress={handleDeleteExpense}>
                    <Text style={styles.buttonText}>ลบค่าใช้จ่าย</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFF'
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
        marginTop: 5,
        backgroundColor: '#DC7633',
        padding: 12,
        alignItems: 'center',
        borderRadius: 4,
    },
    buttonDelete:{
        marginTop: 5,
        backgroundColor: 'red',
        padding: 12,
        alignItems: 'center',
        borderRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 35,
    },
    // picker: {
    //   height: 40,
    //   marginBottom: 16,
    //   paddingHorizontal: 8,
    //   borderWidth: 1,
    //   borderColor: 'gray',
    //   borderRadius: 7,
    // },
    pickerContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 7,
        marginBottom: 16,
        overflow: 'hidden', // This ensures that the picker stays inside the container
    },
});

export default EditExpenseScreen;
