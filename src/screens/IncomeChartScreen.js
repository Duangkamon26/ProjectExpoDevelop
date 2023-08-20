import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { VictoryChart, VictoryTheme, VictoryLine, VictoryLabel,VictoryBar ,VictoryGroup} from 'victory-native';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import 'moment/locale/th';
import { useRoute } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Text as SVGText } from 'react-native-svg';
const IncomeChartScreen = ({ route }) => {
    const db = SQLite.openDatabase('test01.db');
    const { roundId } = route.params;
    const [incomeData, setIncomeData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [products, setProducts] = useState([]); // State to hold product data


    
    const calculateTotalIncomeAndExpenses = () => {
        const totalIncome = incomeData.reduce((sum, income) => sum + income.amount, 0);
        const totalExpenses = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
        return { totalIncome, totalExpenses };
    };

    

    const { totalIncome, totalExpenses } = calculateTotalIncomeAndExpenses();

    // Calculate the percentage of total income and expenses for the pie chart

    const totalAmount = totalIncome + totalExpenses;
    const incomePercentage = ((totalIncome / totalAmount) * 100).toFixed(2);
    const expensesPercentage = ((totalExpenses / totalAmount) * 100).toFixed(2);
    const chartData = [
        {
            name: `รายรับ (${incomePercentage}%)`,
            amount: totalIncome,
            color: '#3498DB',
            legendFontColor: '#7F7F7F',
            legendFontSize: 10,
        },
        {
            name: `รายจ่าย (${expensesPercentage}%)`,
            amount: totalExpenses,
            color: '#E53E3E',
            legendFontColor: '#7F7F7F',
            legendFontSize: 10,
        },
    ];

    const chartConfigPie = {
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        showLegend: false, // Add this line to hide the side labels
    };
    const chartConfig = {
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };
    useEffect(() => {
        fetchIncomesData(roundId);
        fetchExpensesData(roundId); // Fetch expense data
        fetchProducts(roundId);
    }, [roundId]);

    const fetchIncomesData = (roundId) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM incomes WHERE round_id = ?;',
                [roundId],
                (_, { rows }) => {
                    const incomesData = rows._array;
                    setIncomeData(incomesData);
                    console.log('ดึง INCOME',incomeData)
                },
                (_, error) => {
                    console.error('Error fetching incomes data:', error);
                }
            );
        });
    };

    const fetchExpensesData = (roundId) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM expenses WHERE round_id = ?;',
                [roundId],
                (_, { rows }) => {
                    const expensesData = rows._array;
                    setExpenseData(expensesData);
                    console.log('ดึง INCOME',expenseData)
                },
                (_, error) => {
                    console.error('Error fetching expenses data:', error);
                }
            );
        });
    };

    const fetchProducts = (roundId) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM products WHERE round_id = ?;',
                [roundId],
                (_, { rows }) => {
                    const productsData = rows._array;
                    setProducts(productsData);
                    console.log(productsData); // Add this line to check the fetched data
                },
                (_, error) => {
                    console.error('Error fetching products:', error);
                }
            );
        });
    };

    // Prepare data for the bar chart
    const productChartData = products.map((product) => ({
        name: product.name,
        quantity: product.quantity,
    }));
    // Prepare data for income chart
    const incomeChartData = incomeData
        .map((income) => ({
            x: moment(income.date).format('D MMM'), // Format to display day and month (e.g., "15 Jul")
            y: income.amount,
            label: income.name,
        }))
        .sort((a, b) => moment(a.x, 'D MMM').valueOf() - moment(b.x, 'D MMM').valueOf());

    // Prepare data for expense chart
    const expenseChartData = expenseData
        .map((expense) => ({
            x: moment(expense.date).format('D MMM'), // Format to display day and month (e.g., "15 Jul")
            y: expense.amount,
            label: expense.category,
        }))
        .sort((a, b) => moment(a.x, 'D MMM').valueOf() - moment(b.x, 'D MMM').valueOf());

// Prepare data for income and expense chart
        const combinedChartData = [
            ...incomeChartData.map((income) => ({
                x: incomeChartData.indexOf(income), // Use index as x value (continuous numerical axis)
                y: income.y,
                label: income.label,
            })),
            ...expenseChartData.map((expense) => ({
                x: expenseChartData.indexOf(expense), // Use index as x value (continuous numerical axis)
                y: -expense.y, // Negate expense y-value to display it below the x-axis
                label: expense.label,
            })),
        ];
    

    return (
        <ScrollView style={{ backgroundColor: '#FFF' }}>
            <View style={styles.container}>
    
            <Text style={styles.title}>กราฟแท่งรายรับและรายจ่าย</Text>
                <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 30 }}>
                    <VictoryBar
                        data={[
                            { x: 'รายรับ', y: totalIncome },
                            { x: 'รายจ่าย', y: totalExpenses },
                        ]}
                        style={{
                            data: {
                                fill: ({ datum }) => (datum.x === 'รายรับ' ? '#2E8BC0' : '#E53E3E'),
                                width: 30,
                            },
                        }}
                        labels={({ datum }) => `฿${datum.y}`}
                        labelComponent={<VictoryLabel dy={-20} />}
                    />
                </VictoryChart>
                <Text style={styles.title}>แผนภูมิวงกลมรายได้เเละการลงทุน</Text>
                <PieChart
                    data={chartData}
                    width={Dimensions.get('window').width * 0.8}
                    height={180}
                    chartConfig={chartConfigPie}
                    accessor="amount"
                    backgroundColor="transparent"
                    center={[10, 0]}
                    absolute
                />
                
                <Text style={styles.title}>กราฟเปรียบเทียบรายได้/รายจ่าย</Text>
                <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 30 }}>
                    {/* VictoryGroup for income and expense lines */}
                    <VictoryGroup offset={10}>
                        {/* Income line */}
                        <VictoryLine
                            data={incomeChartData}
                            style={{ data: { stroke: '#2E8BC0', strokeWidth: 2 } }} // Set a unique color for income line
                            labels={({ datum }) => `฿${datum.y} (${datum.label})`}
                            labelComponent={<VictoryLabel dy={-20} />}
                            interpolation="natural"
                        />
                        {/* Expense line */}
                        <VictoryLine
                            data={expenseChartData}
                            style={{ data: { stroke: '#E53E3E', strokeWidth: 2 } }} // Set a unique color for expense line
                            labels={({ datum }) => `฿${datum.y} (${datum.label})`}
                            labelComponent={<VictoryLabel dy={20} />}
                            interpolation="natural"
                        />
                    </VictoryGroup>
                </VictoryChart>
                {/* <Text style={styles.title}>รายได้จากรอบการลงทุน</Text>
                {incomeChartData.length > 0 && (
                    <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 30 }}>
                        <VictoryLine
                            data={incomeChartData}
                            style={{ data: { stroke: '#2E8BC0', strokeWidth: 2 } }}
                            labels={({ datum }) => `฿${datum.y} (${datum.label})`}
                            labelComponent={<VictoryLabel dy={-20} />}
                            interpolation="natural"
                        />
                    </VictoryChart>
                )} */}
                {/* <Text style={styles.title}>รายจ่ายจากรอบการลงทุน</Text>
                {expenseChartData.length > 0 && (
                    <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 30 }} style={{ height: 300 }}>
                        <VictoryLine
                            data={expenseChartData}
                            style={{ data: { stroke: '#E53E3E', strokeWidth: 2 } }}
                            labels={({ datum }) => `฿${datum.y} (${datum.label})`}
                            labelComponent={<VictoryLabel dy={20} />}
                            interpolation="natural"
                        />
                    </VictoryChart>
                )}

                {incomeChartData.length === 0 && expenseChartData.length === 0 && (
                    <Text>No income and expense data available for this round.</Text>
                )} */}
                
                {/* Render legend items */}
                {/* {chartData.map((data, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: data.color }]} />
                        <Text style={styles.legendLabel}>{`${data.name} - ฿${data.amount}`}</Text>
                    </View>
                ))} */}

                <Text style={styles.title}>เเผนภูมิเเท่งข้อมูลผลผลิต</Text>

                {productChartData.length > 0 && (
                    <BarChart
                        data={{
                            labels: productChartData.map((data) => data.name),
                            datasets: [
                                {
                                    data: productChartData.map((data) => data.quantity),
                                    color: (opacity = 1) => `rgba(155, 89, 182, ${opacity})`,
                                },
                            ],
                        }}
                        width={Dimensions.get('window').width * 0.8}
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom: '#FFFFFF',
                            backgroundGradientTo: '#FFFFFF',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(155, 89, 182, ${opacity})`,
                        }}
                        fromZero
                        showValuesOnTopOfBars
                        yAxisLabel=""
                        yAxisSuffix=""
                    />
                )}
                {productChartData.length === 0 && <Text>No product data available for this round.</Text>}
                {/* Rest of the code... */}
                
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    legendColor: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        marginRight: 5,
    },
    legendLabel: {
        fontSize: 12,
    },
});

export default IncomeChartScreen;
