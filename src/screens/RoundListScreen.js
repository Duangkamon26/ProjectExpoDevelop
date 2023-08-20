import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Picker, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';

const db = SQLite.openDatabase('test01.db');

const RoundListScreen = ({ route }) => {
    const navigation = useNavigation();
    const { id } = route.params;
    const [roundsData, setRoundsData] = useState([]);
    const { investmentId, investmentName } = route.params;
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };


    const fetchIncomes = (roundId) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM incomes WHERE round_id = ?;',
                    [roundId],
                    (_, { rows }) => {
                        const incomesData = rows._array;
                        setIncomes((prevIncomes) => [...prevIncomes, ...incomesData]);
                        resolve();
                    },
                    (_, error) => {
                        console.error('Error fetching incomes:', error);
                        reject(error);
                    }
                );
            });
        });
    };

    const fetchExpenses = (roundId) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM expenses WHERE round_id = ?;',
                    [roundId],
                    (_, { rows }) => {
                        const expensesData = rows._array;
                        setExpenses((prevExpenses) => [...prevExpenses, ...expensesData]);
                        resolve();
                    },
                    (_, error) => {
                        console.error('Error fetching expenses:', error);
                        reject(error);
                    }
                );
            });
        });
    };

    const fetchProducts = (roundId) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM products WHERE round_id = ?;',
                    [roundId],
                    (_, { rows }) => {
                        const productsData = rows._array;
                        setProducts((prevProducts) => [...prevProducts, ...productsData]);
                        resolve();
                    },
                    (_, error) => {
                        console.error('Error fetching products:', error);
                        reject(error);
                    }
                );
            });
        });
    };

    const fetchRoundsData = () => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM rounds WHERE investment_id = ?;',
                    [investmentId], // ใช้ investmentId ที่ถูกส่งมาจากหน้า ListScreen
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
                                investment_amount: round.investment_amount,
                                total_amount: round.total_amount,
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

                // Fetch incomes, expenses, and products for each round
                const promises = rounds.map(async (round) => {
                    await fetchIncomes(round.id);
                    await fetchExpenses(round.id);
                    await fetchProducts(round.id);
                });

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

    const handleProductPress = (roundId) => {
        navigation.navigate('Product', { roundId });
    };

    const handleAddIncome = (roundId) => {
        navigation.navigate('AddIncome', { roundId });
    };

    const handleExpensePress = (roundId) => {
        navigation.navigate('Expense', { roundId });
    };

    const handleIncomeChartPress = (roundId) => {
        navigation.navigate('IncomeChart', { roundId });
    };

    const calculateTotalIncome = (roundId) => {
        // Filter incomes for the specific round
        const incomesForRound = incomes.filter((income) => income.round_id === roundId);

        // Calculate the total income for the round
        const totalIncome = incomesForRound.reduce((sum, income) => sum + income.amount, 0);

        return totalIncome;
    };

    const calculateTotalExpenses = (roundId) => {
        // Filter expenses for the specific round
        const expensesForRound = expenses.filter((expense) => expense.round_id === roundId);

        // Calculate the total expenses for the round
        const totalExpenses = expensesForRound.reduce((sum, expense) => sum + expense.amount, 0);

        return totalExpenses;
    };
    
    const calculateRoundNetProfitLoss = (roundId) => {
        const totalIncome = calculateTotalIncome(roundId);
        const totalExpenses = calculateTotalExpenses(roundId);
    
        const round = roundsData.find((round) => round.id === roundId);
        const investmentAmount = round?.investment_amount || 0;
    
        const netProfitLoss = totalIncome - totalExpenses - investmentAmount;
    
        return netProfitLoss;
    };
    
    const calculateRoundRemainingInvestment = (roundId) => {
        const totalIncome = calculateTotalIncome(roundId);
        const totalExpenses = calculateTotalExpenses(roundId);
    
        const round = roundsData.find((round) => round.id === roundId);
        const investmentAmount = round?.investment_amount || 0;
    
        const remainingInvestment = investmentAmount - totalExpenses + totalIncome;
    
        return remainingInvestment;
    };
    

 

    const renderRoundItem = ({ item }) => {
        const opendate = moment(item.opendate).locale('th').format('LL');
        const isClosed = item.isRoundClosed;
        const netProfitLoss = calculateRoundNetProfitLoss(item.id, item);
        const profitOrLossText = netProfitLoss >= 0 ? 'ได้กำไร' : 'ขาดทุน';
        const profitOrLossColor = netProfitLoss >= 0 ? 'green' : 'red';
        const remainingInvestment = calculateRoundRemainingInvestment(item.id, item);

        return (
            <TouchableOpacity style={styles.cardRound}>
                <Text style={styles.roundId} onPress={() => handleEditRoundPress(item.id)}>
                    การลงทุน ID {item.id}
                </Text>

                <Text style={styles.date} >วันเปิดรอบ: {opendate}</Text>

                <Text style={styles.amount}>จำนวนเงินการลงทุน: {item.investment_amount}</Text>
                
                {/* <View style={styles.container}>
                    <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
                        <Text style={styles.buttonText}>รายรับ</Text>
                    </TouchableOpacity>
                    {showDropdown && (
                        <Picker
                        style={styles.dropdown}
                        selectedValue={selectedValue}
                        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                        >
                        <Picker.Item label="Option 1" value="option1" />
                        <Picker.Item label="Option 2" value="option2" />
                        <Picker.Item label="Option 3" value="option3" />
                        </Picker>
                    )}
                </View> */}
 
                {/* <Text style={styles.itemTextTotal}>คงเหลือ: {remainingInvestment} บาท</Text> */}

                {/* <TouchableOpacity
                    style={styles.chartProductBtn}
                    onPress={() => handleProductPress(item.id)}
                    disabled={isClosed}
                >
                    <Icon name="shopping-cart" size={20} color="#FFFFFF" />
                    <Text style={[styles.buttonText, isClosed && styles.disabledButtonText]}> ผลผลิต</Text>
                </TouchableOpacity> */}

                {/* Render Incomes */}
                <Text style={styles.sectionTitle}>รายรับ:</Text>
                <FlatList
                    data={incomes.filter((income) => income.round_id === item.id)}
                    keyExtractor={(income) => income.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.itemContainerIncome}
                           
                        >
                            <Text>ชื่อรายรับ: {item.name}</Text>
                            <Text style={styles.itemText}>จำนวนเงิน: {item.amount} บาท</Text>
                            <Text style={styles.itemText}>วันที่: {moment(item.date).locale('th').format('LL')}</Text>
                            {/* ... (Other details or actions) ... */}
                        </TouchableOpacity>
                    )}
                />

                <Text style={styles.sectionTitle}>รายจ่าย:</Text>
                <FlatList
                    data={expenses.filter((expense) => expense.round_id === item.id)}
                    keyExtractor={(expense) => expense.id.toString()}
                    renderItem={({ item: expense }) => (
                        <TouchableOpacity
                            style={styles.itemContainerExpense}
                            
                        >
                            <Text style={styles.itemText}>ชื่อรายจ่าย: {expense.category}</Text>
                            <Text style={styles.itemText}>จำนวนเงิน: {expense.amount} บาท</Text>
                            <Text style={styles.itemText}>วันที่: {moment(expense.date).locale('th').format('LL')}</Text>
                            {/* ... (Other details or actions) ... */}
                        </TouchableOpacity>
                    )}
                />

                {/* Render Products */}
                <Text style={styles.sectionTitle}>ผลผลิต:</Text>
                <FlatList
                    data={products.filter((product) => product.round_id === item.id)}
                    keyExtractor={(product) => product.id.toString()}
                    renderItem={({ item: product }) => (
                        <TouchableOpacity
                            style={styles.itemContainerProduct}
                           
                        >
                            <Text style={styles.itemText}>ชื่อผลผลิต: {product.name}</Text>
                            <Text style={styles.itemText}>จำนวน: {product.quantity}</Text>
                            {/* ... (Other details or actions) ... */}
                        </TouchableOpacity>
                    )}
                />


                <TouchableOpacity style={styles.chartInvestmentBtn} onPress={() => handleIncomeChartPress(item.id)}>
                    <Icon name="bar-chart" size={30} color="#FFFFFF" />
                    <Text style={styles.buttonText}> แสดงกราฟเเท่ง</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>สรุปผล:</Text>
                <TouchableOpacity
                            style={styles.itemContainer1}
                            
                >
                    <Text style={styles.itemTextTotal}>รายรับ: {calculateTotalIncome(item.id)} บาท</Text>
                </TouchableOpacity>
                <TouchableOpacity
                            style={styles.itemContainer2}
                            
                >
                    <Text style={styles.itemTextTotal}>รายจ่าย: {calculateTotalExpenses(item.id)} บาท</Text>
                </TouchableOpacity>
                <TouchableOpacity
                            style={styles.itemContainer3}
                            
                >
                    <Text style={[styles.itemTextTotal, { color: profitOrLossColor }]}>
                    กําไรสุทธิ: {netProfitLoss} บาท ({profitOrLossText})
                    </Text>
                </TouchableOpacity>
               
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>รายการรอบการลงทุน</Text>
            <FlatList
                data={roundsData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRoundItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
    },
    button: {
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: 100,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        color: '#9400D3',
    },
    cardRound: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#FFFAFA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    roundId: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#3333FF', 
        // textShadowColor: 'rgba(0, 0, 0, 0.3)',
        // textShadowOffset: { width: 2, height: 2 },
        // textShadowRadius: 4,
    },
    date: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
    },
    amount: {
        fontSize: 16,
        marginBottom: 8,
        color: '#006600',
    },
    chartProductBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007ACC',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        justifyContent: 'center',
        width: 120,
        marginTop: 8,
    },
    buttonText: {
        color: 'white',
        marginLeft: 4,
    },
    disabledButtonText: {
        opacity: 0.5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#333',
    },
    itemContainerIncome: {
        backgroundColor: '#D4E6F1',
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    itemContainerExpense: {
        backgroundColor: '#F5B7B1',
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    itemContainerProduct: {
        backgroundColor: '#D5F5E3',
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    chartInvestmentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF1493',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        justifyContent: 'center',
        width: 160,
        marginTop: 16,
    },
    itemTextTotal: {
        fontSize: 16,
        color: '#333',
        marginTop: 8,
    },
    itemContainer1: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#3300FF',
        padding: 10,
        marginBottom: 5,
        backgroundColor: '#FFFAFA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    itemContainer2: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#FF3366',
        padding: 10,
        marginBottom: 5,
        backgroundColor: '#FFFAFA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    itemContainer3: {
        borderWidth: 2,
        borderRadius: 8,
        padding: 10,
        marginBottom: 5,
        backgroundColor: 'white',
        elevation: 2,
    },
});

export default RoundListScreen;

