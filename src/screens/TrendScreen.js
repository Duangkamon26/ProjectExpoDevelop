import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryLegend } from 'victory-native';
import moment from 'moment';
import 'moment/locale/th';
import { Ionicons } from '@expo/vector-icons';

const db = SQLite.openDatabase('test01.db');

const TrendScreen = () => {
    const [investments, setInvestments] = useState([]);
    const [showGraph, setShowGraph] = useState(false);
    const [selectedInvestmentId, setSelectedInvestmentId] = useState(null);
    const [incomeData, setIncome] = useState([]);
    const [expenseData, setExpense] = useState([]);
    const [roundsData, setRounds] = useState([]);

    useEffect(() => {
        fetchInvestments().then((data) => {
            setInvestments(data);
        });
    }, []);

    const fetchInvestments = () => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM investments;',
                    [],
                    (_, { rows }) => {
                        const investments = rows._array;
                        setInvestments(investments);
                        resolve(investments);
                    },
                    (_, error) => {
                        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการลงทุน:', error);
                        reject(error);
                    }
                );
            });
        });
    };

    const fetchIncome = (investmentId) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM incomes WHERE round_id IN (SELECT id FROM rounds WHERE investment_id = ?);',
                [investmentId],
                (_, { rows }) => {
                    const incomeData = rows._array;
                    setIncome(incomeData);
                },
                (_, error) => {
                    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายรับ:', error);
                }
            );
        });
    };

    const fetchExpense = (investmentId) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM expenses WHERE round_id IN (SELECT id FROM rounds WHERE investment_id = ?);',
                [investmentId],
                (_, { rows }) => {
                    const expenseData = rows._array;
                    setExpense(expenseData);
                },
                (_, error) => {
                    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายจ่าย:', error);
                }
            );
        });
    };

    const fetchRounds = (investmentId) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM rounds WHERE investment_id = ?;',
                [investmentId],
                (_, { rows }) => {
                    const rounds = rows._array;
                    setRounds(rounds);
                },
                (_, error) => {
                    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรอบการลงทุน:', error);
                }
            );
        });
    };

    const calculateNetProfitLoss = (investmentId) => {
        const investmentIncome = incomeData.filter((income) => income.round_id === investmentId);
        const investmentExpense = expenseData.filter((expense) => expense.round_id === investmentId);

        const totalIncome = investmentIncome.reduce((sum, income) => sum + income.amount, 0);
        const totalExpense = investmentExpense.reduce((sum, expense) => sum + expense.amount, 0);

        return totalIncome - totalExpense;
    };

    const calculateIncome = (roundId) => {
        const roundIncome = incomeData.filter((income) => income.round_id === roundId);
        return roundIncome.reduce((sum, income) => sum + income.amount, 0);
    };

    const calculateExpense = (roundId) => {
        const roundExpense = expenseData.filter((expense) => expense.round_id === roundId);
        return roundExpense.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const renderRoundGraph = (investmentId) => {
        const roundsForInvestment = roundsData.filter((round) => round.investment_id === investmentId);
        const dataForRoundChart = roundsForInvestment.map((round) => ({
            x: round.opendate,
            y: calculateNetProfitLoss(round.id),
        }));

        const roundSummaries = roundsForInvestment.map((round) => ({
            x: round.opendate,
            profitLoss: calculateNetProfitLoss(round.id),
            income: calculateIncome(round.id),
            expense: calculateExpense(round.id),
        }));

        return (
            <ScrollView>
                <Text style={styles.roundTitle}>การลงทุน: {investments.find((investment) => investment.id === investmentId).name}</Text>
                <VictoryChart width={350} height={300}>
                    <VictoryAxis
                        tickValues={roundsForInvestment.map((round) => round.opendate)}
                        tickFormat={(x) => moment(x).format('L')}
                        style={{ tickLabels: { fontSize: 8, angle: 45 } }}
                    />
                    <VictoryAxis dependentAxis tickFormat={(y) => `${y} บาท`} fixLabelOverlap={true} style={{ tickLabels: { fontSize: 8 } }} />
                    <VictoryBar
                        data={dataForRoundChart}
                        x="x"
                        y="y"
                        style={{
                            data: { fill: ({ datum }) => (datum.y >= 0 ? 'blue' : 'red') },
                        }}
                    />


                    <VictoryLegend
                        x={10}
                        y={10}
                        orientation="horizontal"
                        gutter={10}
                        data={roundsForInvestment.map((round) => ({
                            name: `${moment(round.opendate).format('L')} (ID ${round.id})`,
                            symbol: { fill: 'purple' },
                        }))}
                    />
                </VictoryChart>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>สรุปผลรอบการลงทุน</Text>
                    {roundSummaries.map((summary) => (
                        <View key={summary.x} style={styles.roundSummary}>
                            <Text style={styles.date}>{moment(summary.x).format('L')}:</Text>
                            <View style={styles.profitLossContainer}>
                                <Text
                                    style={[
                                        styles.profitLoss,
                                        {
                                            color: summary.profitLoss >= 0 ? 'green' : 'red',
                                        },
                                    ]}
                                >
                                    {summary.profitLoss >= 0 ? `กำไร ${summary.profitLoss} บาท` : `ขาดทุน ${Math.abs(summary.profitLoss)} บาท`}
                                </Text>
                            </View>
                            <View style={styles.incomeExpenseContainer}>
                                <Text style={styles.income}>รายรับ: {summary.income} บาท</Text>
                                <Text style={styles.expense}>รายจ่าย: {summary.expense} บาท</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>เปรียบเทียบการลงทุน</Text>
            {showGraph ? (
                <View>
                    {selectedInvestmentId ? (
                        <View>
                            {renderRoundGraph(selectedInvestmentId)}
                            <Button title="กลับ" onPress={() => setShowGraph(false)} />
                        </View>
                    ) : (
                        <Text>กรุณาเลือกการลงทุนเพื่อดูข้อมูล</Text>
                    )}
                </View>
            ) : (
                <View>
                    {investments.map((investment) => (
                        <TouchableOpacity
                            key={investment.id}
                            style={styles.investmentItem}
                            onPress={() => {
                                setSelectedInvestmentId(investment.id);
                                setShowGraph(true);
                                fetchIncome(investment.id);
                                fetchExpense(investment.id);
                                fetchRounds(investment.id);
                            }}
                        >
                            <Text>{investment.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFF'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#51087E',
    },
    investmentItem: {
        backgroundColor: '#C8A2C8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roundTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#51087E',
    },
    summaryContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 10,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#51087E',
    },
    roundSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    date: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 10,
    },
    profitLossContainer: {
        backgroundColor: '#F2F2F2',
        borderRadius: 5,
        padding: 5,
    },
    profitLoss: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    incomeExpenseContainer: {
        marginLeft: 10,
    },
    income: {
        fontSize: 14,
        color: 'blue',
    },
    expense: {
        fontSize: 14,
        color: 'brown',
    },
});

export default TrendScreen;
