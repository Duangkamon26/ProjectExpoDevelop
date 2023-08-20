import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Button, FlatList, Alert, Dimensions, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/th';
import Icon from 'react-native-vector-icons/FontAwesome'; // Replace 'FontAwesome' with the desired icon library
import AsyncStorage from '@react-native-async-storage/async-storage';
const InvestmentDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const { roundId } = route.params;
  const db = SQLite.openDatabase('test01.db');
  const [investment, setInvestment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [opendate, setOpendate] = useState(new Date());
  const [enddate, setEnddate] = useState(new Date());
  const [showOpendatePicker, setShowOpendatePicker] = useState(false);
  const [showEnddatePicker, setShowEnddatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [maxRoundId, setMaxRoundId] = useState(0);
  const { round } = route.params;
  const [isRoundClosed, setIsRoundClosed] = useState(false);
  const [roundsData, setRoundsData] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [displayedIncome, setDisplayedIncome] = useState(null);
  const [displayedExpense, setDisplayedExpense] = useState(null);
  const [displayedProduct, setDisplayedProduct] = useState(null);



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

  const ClearDataButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.buttonClear} onPress={onPress}>
        <Text style={styles.buttonText}>Clear All Data</Text>
      </TouchableOpacity>
    );
  };
  const clearData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM rounds; DELETE FROM incomes; DELETE FROM expenses; DELETE FROM products;',
        [],
        () => {
          console.log('All data cleared successfully');
          // After clearing data, you may want to refresh the screen or take other actions as needed.
        },
        (_, error) => {
          console.error('Error clearing data:', error);
        }
      );
    });
  };
  const dropTables = (tx) => {
    tx.executeSql(
      'DROP TABLE IF EXISTS products;',
      [],
      () => {
        console.log('Products table dropped successfully');
      },
      (_, error) => {
        console.error('Error dropping products table:', error);
      }
    );

    tx.executeSql(
      'DROP TABLE IF EXISTS expenses;',
      [],
      () => {
        console.log('Expenses table dropped successfully');
      },
      (_, error) => {
        console.error('Error dropping expenses table:', error);
      }
    );

    tx.executeSql(
      'DROP TABLE IF EXISTS incomes;',
      [],
      () => {
        console.log('Incomes table dropped successfully');
      },
      (_, error) => {
        console.error('Error dropping incomes table:', error);
      }
    );

    tx.executeSql(
      'DROP TABLE IF EXISTS rounds;',
      [],
      () => {
        console.log('Rounds table dropped successfully');
      },
      (_, error) => {
        console.error('Error dropping rounds table:', error);
      }
    );
  };
  useEffect(() => {
    fetchInvestmentById(id);
    fetchRounds();
    fetchIncomes();
    fetchExpenses();
    fetchProducts();
  }, [id]);

  const fetchIncomes = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM incomes WHERE round_id IN (SELECT id FROM rounds WHERE investment_id = ?);',
        [id],
        (_, { rows }) => {
          const incomesData = rows._array;
          console.log('Fetched Incomes Data:', incomesData); // Add this line to log the data
          setIncomes(incomesData);
        },
        (_, error) => {
          console.error('Error fetching incomes:', error);
        }
      );
    });
  };

  const fetchExpenses = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE round_id IN (SELECT id FROM rounds WHERE investment_id = ?);',
        [id],
        (_, { rows }) => {
          const expensesData = rows._array;
          setExpenses(expensesData);
        },
        (_, error) => {
          console.error('Error fetching expenses:', error);
        }
      );
    });
  };

  const fetchProducts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM products WHERE round_id IN (SELECT id FROM rounds WHERE investment_id = ?);',
        [id],
        (_, { rows }) => {
          const productsData = rows._array;
          setProducts(productsData);
        },
        (_, error) => {
          console.error('Error fetching products:', error);
        }
      );
    });
  };
  const handleOpendateChange = (event, selectedDate) => {
    const currentDate = selectedDate || opendate;
    setShowOpendatePicker(false);
    setOpendate(currentDate);
  };

  const handleEnddateChange = (event, selectedDate) => {
    const currentDate = selectedDate || enddate;
    setShowEnddatePicker(false);
    setEnddate(currentDate);
  };

  useEffect(() => {
    fetchInvestmentById(id);
    fetchRounds();
    fetchInvestmentRounds();
  }, [id]);

  const fetchInvestmentRounds = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM rounds;',
        [],
        (_, { rows }) => {
          // Rounds data found
          const roundsData = rows._array;
          setRounds(roundsData);
          console.log('DATA ROUND:', roundsData)
        },
        (_, error) => {
          console.error('Error fetching investment rounds:', error);
        }
      );
    });
  };

  const fetchInvestmentById = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM investments WHERE id = ?;',
        [id],
        (_, { rows }) => {
          const investmentData = rows.item(0);
          setInvestment(investmentData);
          console.log('DATA ROUND BY ID:', investmentData)

        },
        (_, error) => {
          console.error('Error fetching investment details:', error);
        }
      );
    });
  };

  const fetchRounds = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM rounds WHERE investment_id = ?;',
        [id],
        (_, { rows }) => {
          const roundsData = rows._array;
          console.log('Fetched Rounds Data:', roundsData); // Add this line to log the data
          setRounds(roundsData);
        },
        (_, error) => {
          console.error('Error fetching rounds:', error);
        }
      );
    });
  };
  useEffect(() => {
    fetchRounds();
  }, []);

  const handleAddIncome = (roundId) => {
    navigation.navigate('AddIncome', { roundId });
  };

  const handleExpensePress = (roundId) => {
    navigation.navigate('AddExpense', { roundId });
  };

  const handleProductPress = (roundId) => {
    navigation.navigate('AddProduct', { roundId });
  };





  const handleIncomeChartPress = (roundId) => {
    navigation.navigate('IncomeChart', { roundId });
  };

  const [isEditing, setIsEditing] = useState(false);
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

  //calculate
  const calculateRoundNetProfitLoss = (roundId) => {
    const totalIncome = calculateTotalIncome(roundId);
    const totalExpenses = calculateTotalExpenses(roundId);
    const investmentAmount = rounds.find((round) => round.id === roundId)?.investment_amount || 0;

    const netProfitLoss = totalIncome - totalExpenses - investmentAmount;

    return netProfitLoss;
  };






  const fetchRoundsData = () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Fetch all rounds data from the database
        tx.executeSql(
          'SELECT * FROM rounds;',
          [],
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

  // Call fetchRoundsData to fetch the data when the component mounts or whenever needed
  useEffect(() => {
    // Use async/await to properly handle asynchronous data fetching
    const fetchData = async () => {
      try {
        const data = await fetchRoundsData();
        setRoundsData(data);
      } catch (error) {
        console.error('Error fetching rounds data:', error);
      }
    };

    fetchData();
  }, []);



  const handleRoundClose = async (roundId) => {
    const roundIndex = roundsData.findIndex((round) => round.id === roundId);

    if (roundIndex !== -1) {
      const roundToClose = roundsData[roundIndex];

      // Check if the round is already closed
      if (roundToClose.is_closed) {
        Alert.alert(
          'รอบการลงทุนถูกปิดแล้ว',
          'รอบการลงทุนนี้ถูกปิดไปแล้ว คุณต้องการทำรายการต่อหรือไม่?',
          [
            { text: 'ยกเลิก', style: 'cancel' },
            { text: 'ตกลง', onPress: () => { } },
          ]
        );
        return; // Exit the function since the round is already closed
      }

      // Show a confirmation dialog before closing the round
      Alert.alert(
        'ยืนยันการปิดรอบการลงทุน',
        'คุณต้องการปิดรอบการลงทุนนี้ใช่หรือไม่?',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ตกลง',
            onPress: async () => {
              try {
                const closingTime = new Date(); // Get the current time

                // Perform the database update operation here using the provided SQL query
                db.transaction((tx) => {
                  tx.executeSql(
                    'UPDATE rounds SET is_closed = 1, closing_time = ?, enddate = ? WHERE id = ?;',
                    [closingTime.getTime(), closingTime.toISOString(), roundId],
                    () => {
                      console.log('Round closed successfully');

                      // Update the isRoundClosed status and enddate for the specific round in the state
                      setRoundsData((prevRoundsData) => {
                        const updatedRoundsData = [...prevRoundsData];
                        updatedRoundsData[roundIndex].is_closed = true;
                        updatedRoundsData[roundIndex].closing_time = closingTime.toISOString();
                        updatedRoundsData[roundIndex].enddate = closingTime;
                        return updatedRoundsData;
                      });
                    },
                    (_, error) => {
                      console.error('Error updating round data in the database:', error);
                    }
                  );
                });
              } catch (error) {
                console.error('Error updating round data:', error);
              }
            },
          },
        ]
      );
    }
  };







  const renderRoundItem = ({ item, incomes, expenses, products }) => {
    // Find the index of the round in the roundsData array
    const roundIndex = roundsData.findIndex((round) => round.id === item.id);
    const isClosed = roundIndex !== -1 ? roundsData[roundIndex].isRoundClosed : false;
    const opendate = moment(item.opendate).locale('th').format('LL');
    const netProfitLoss = calculateRoundNetProfitLoss(item.id);
    const profitOrLossText = netProfitLoss >= 0 ? 'ได้กำไร' : 'ขาดทุน';
    const profitOrLossColor = netProfitLoss >= 0 ? 'green' : 'red';

    // const roundIncomes = roundsData[roundIndex]?.incomes ?? [];
    // const roundExpenses = roundsData[roundIndex]?.expenses ?? [];
    // const roundProducts = roundsData[roundIndex]?.products ?? [];


    // Get the current index (1-based) for displaying

    const currentIndex = roundIndex !== -1 ? roundIndex + 1 : null;

    const handleEditRoundPress = (roundId) => {
      // Navigate to the EditRoundScreen and pass the round ID as a parameter
      navigation.navigate('EditRound', { roundId });
    };
    // Check if the incomes, expenses, and products arrays exist before accessing their properties
    const handleChartInvestmentPress = () => {
      navigation.navigate('BarChart', {
        roundsData: rounds,
        incomesData: incomes,
        expensesData: expenses,
      });
    };

    const handleDisplayIncomeDetails = (incomeId) => {
      if (displayedIncome === incomeId) {
        // If the displayedIncome is the same as the clicked incomeId, set it to null to hide the details
        setDisplayedIncome(null);
      } else {
        // Otherwise, set the clicked incomeId to display its details
        setDisplayedIncome(incomeId);
      }
    };

    const handleDisplayExpenseDetails = (expenseId) => {
      if (displayedExpense === expenseId) {
        // If the displayedIncome is the same as the clicked incomeId, set it to null to hide the details
        setDisplayedExpense(null);
      } else {
        // Otherwise, set the clicked incomeId to display its details
        setDisplayedExpense(expenseId);
      }
    };


    const handleDisplayProductDetails = (productId) => {
      if (displayedProduct === productId) {
        // If the displayedIncome is the same as the clicked incomeId, set it to null to hide the details
        setDisplayedProduct(null);
      } else {
        // Otherwise, set the clicked incomeId to display its details
        setDisplayedProduct(productId);
      }
    };

    const calculateRoundRemainingInvestment = (roundId) => {
      const totalIncome = calculateTotalIncome(roundId);
      const totalExpenses = calculateTotalExpenses(roundId);
      const investmentAmount = roundsData.find((round) => round.id === roundId)?.investment_amount || 0;

      const remainingInvestment = investmentAmount - totalExpenses;

      return remainingInvestment;
    };
    const remainingInvestment = calculateRoundRemainingInvestment(item.id);
    const windowWidth = Dimensions.get('window').width;
    const cardWidth = windowWidth * 0.8;





    return (
      <TouchableOpacity
        style={styles.cardRound}
      >
        <Text style={styles.roundId}
          onPress={() => handleEditRoundPress(item.id)}
        >การลงทุนของ {investment.name} ID ที่: {item.id}
        </Text>


        <Text style={styles.date}>วันเปิดรอบ: {opendate}</Text>

        {/* <Text style={styles.date}>วันปิดรอบ: {enddate}</Text> */}

        <Text style={styles.amount}>จำนวนเงินการลงทุน: {item.investment_amount}</Text>
        <Text style={styles.itemTextTotal}>คงเหลือ: {remainingInvestment} บาท</Text>

        {/* <TouchableOpacity style={styles.chartProductBtn} onPress={() => handleProductPress(item.id)} disabled={isRoundClosed}> */}
        <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.roundButton, styles.chartProductBtn]}
          onPress={() => handleProductPress(item.id)}
          disabled={isClosed}
        >
          <Icon name="shopping-cart" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>ผลผลิต</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roundButton, styles.IncomeBtn]}
          onPress={() => handleAddIncome(item.id)}
          disabled={isClosed}
        >
          <Icon name="money" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>รายได้</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roundButton, styles.ExpenseBtn]}
          onPress={() => handleExpensePress(item.id)}
          disabled={isClosed}
        >
          <Icon name="frown-o" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>ค่าใช้จ่าย</Text>
        </TouchableOpacity>
      </View>

        <TouchableOpacity style={styles.chartInvestmentBtn} onPress={handleChartInvestmentPress}>
          <Icon name="bar-chart" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}> แสดงกราฟเเท่ง</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chartInvestmentBtntwo}
          onPress={() => handleIncomeChartPress(item.id)}
        >
          <Icon name="line-chart" size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText]}> เเสดงกราฟเปรียบเทียบ</Text>
        </TouchableOpacity>

        {typeof item.is_closed !== 'undefined' && item.is_closed ? (
          <Text style={[styles.closedStatus, { color: 'brown', fontSize: 20 }]}>
            สถานะ: ปิดรอบแล้ว ({moment(item.enddate).locale('th').format('LL')})
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => handleRoundClose(item.id)}
          >
            <Text style={styles.closeButtonText}>ปิดรอบการลงทุน</Text>
          </TouchableOpacity>
        )}


        {/* Render Incomes */}
        <Text style={styles.sectionTitle}>รายรับ:</Text>
        <FlatList
          data={incomes.filter((income) => income.round_id === item.id)}
          keyExtractor={(income) => income.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainerIncome}
              onPress={() => handleDisplayIncomeDetails(item.id)}
            >
              <Text style={styles.itemText}>ชื่อรายรับ: {item.name}</Text>
              <Text style={styles.itemText}>จำนวนเงิน: {item.amount} บาท</Text>
              <Text style={styles.itemText}>วันที่: {moment(item.date).locale('th').format('LL')}</Text>

              {/* Show the details if the current income item is the one being displayed */}
              {displayedIncome === item.id && (
                <View style={styles.incomeDetailsContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditcomeIN', { incomeId: item.id, incomeData: item })}
                    style={{ backgroundColor: 'red', justifyContent: 'center', borderRadius: 4, width: '50%', alignSelf: 'center', height: 40 }}>
                    <Text style={{ color: 'white', alignSelf: 'center' }}>
                      เเก้ไขข้อมูล
                    </Text>
                  </TouchableOpacity>

                </View>
              )}
            </TouchableOpacity>
          )}
        />

        {/* Render Expenses */}
        <Text style={styles.sectionTitle}>รายจ่าย:</Text>
        <FlatList
          data={expenses.filter((expense) => expense.round_id === item.id)}
          keyExtractor={(expense) => expense.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainerExpense}
              onPress={() => handleDisplayExpenseDetails(item.id)}
            // onPress={() => navigation.navigate('EditExpense', { expenseId: item.id })}
            >
              {/* <Text style={styles.itemText}>ชื่อรายจ่าย: {item.name}</Text> */}
              <Text style={styles.itemText}>ชื่อรายการ: {item.category}</Text>
              <Text style={styles.itemText}>จำนวนเงิน: {item.amount}</Text>
              <Text style={styles.itemText}>วันที่: {moment(item.date).locale('th').format('LL')}</Text>
              {/* Show the details if the current income item is the one being displayed */}
              {displayedExpense === item.id && (
                <View style={styles.incomeDetailsContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditExpense', { expenseId: item.id })}
                    style={{ backgroundColor: 'red', justifyContent: 'center', borderRadius: 4, width: '50%', alignSelf: 'center', height: 40 }}>
                    <Text style={{ color: 'white', alignSelf: 'center' }}>
                      เเก้ไขข้อมูล
                    </Text>
                  </TouchableOpacity>

                </View>
              )}
            </TouchableOpacity>
          )}
        />

        {/* Render Products */}
        <Text style={styles.sectionTitle}>ผลผลิต:</Text>
        <FlatList
          data={products.filter((product) => product.round_id === item.id)}
          keyExtractor={(product) => product.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainerProduct}
              onPress={() => handleDisplayProductDetails(item.id)}

            >
              <Text style={styles.itemText}>ชื่อผลผลิต: {item.name}</Text>
              <Text style={styles.itemText}>จำนวน: {item.quantity}</Text>
              {/* Show the details if the current income item is the one being displayed */}
              {displayedProduct === item.id && (
                <View style={styles.incomeDetailsContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
                    style={{ backgroundColor: 'red', justifyContent: 'center', borderRadius: 4, width: '50%', alignSelf: 'center', height: 40 }}>
                    <Text style={{ color: 'white', alignSelf: 'center', fontWeight: 'bold' }}>
                      เเก้ไขข้อมูล
                    </Text>
                  </TouchableOpacity>

                </View>
              )}
            </TouchableOpacity>
          )}
        />

        <Text style={styles.sectionTitle}>สรุปผล:</Text>
        <Text style={styles.itemTextTotal}>อดรวมรายรับ: {calculateTotalIncome(item.id)} บาท</Text>
        <Text style={styles.itemTextTotal}>ยอดรวมรายจ่าย: {calculateTotalExpenses(item.id)} บาท</Text>
        <Text style={[styles.itemTextTotal, { color: profitOrLossColor }]}>
          กําไรสุทธิ: {netProfitLoss} บาท ({profitOrLossText})
        </Text>

      </TouchableOpacity>
    );
  };


  const handleRefresh = () => {
    setRefreshing(true);
    // Fetch the data again
    fetchInvestmentById(id);
    fetchRounds();
    fetchIncomes();
    fetchExpenses();
    fetchProducts();


    setRefreshing(false);
  };

  const handleAddRound = () => {
    setIsModalVisible(true);
  };
  const validateInvestmentAmount = (amount) => {
    if (amount === '') {
      setAmountError('กรุณากรอกจำนวนเงินการลงทุน');
      setIsValidAmount(false);
    } else if (!/^\d+$/.test(amount) || Number(amount) <= 0) {
      setAmountError('กรุณากรอกจำนวนเงินการลงทุนเป็นจำนวนเต็มบวก');
      setIsValidAmount(false);
    } else {
      setAmountError('');
      setIsValidAmount(true);
    }
  };
  const [amountError, setAmountError] = useState('');
  const [isValidAmount, setIsValidAmount] = useState(true);

  const handleSaveRound = () => {
    validateInvestmentAmount(amount);
    if (isValidAmount) {
      const investmentId = investment.id;
      const investmentAmount = amount;
      const opendateString = moment(opendate).format('YYYY-MM-DD');
      const enddateString = moment(enddate).format('YYYY-MM-DD');

      db.transaction((tx) => {
        // Inside the handleSaveRound function when creating the rounds table:
        createTables(tx); // Call createTables function first

        // Fetch the max round ID for the current investment
        tx.executeSql(
          'SELECT MAX(id) AS max_round_id FROM rounds WHERE investment_id = ?;',
          [investmentId],
          (_, { rows }) => {
            const maxRoundId = rows.item(0).max_round_id || 0;

            // Insert the new round with the next round ID for the current investment
            tx.executeSql(
              'INSERT INTO rounds (investment_id, opendate, enddate, investment_amount, total_amount) VALUES (?, ?, ?, ?, ?);',
              [investmentId, opendateString, enddateString, investmentAmount, 0],
              (_, { insertId }) => {
                console.log('Added round with ID:', insertId);

                // Update maxRoundId state with the newly created round ID for the current investment
                setMaxRoundId(maxRoundId + 1);


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

                // Create the expense table
                tx.executeSql(
                  'CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, round_id INTEGER, name TEXT, category TEXT, amount REAL, date TEXT, FOREIGN KEY (round_id) REFERENCES rounds (id));',
                  [],
                  () => {
                    console.log('Expenses table created successfully');
                  },
                  (_, error) => {
                    console.error('Error creating expenses table:', error);
                  }
                );

                // Create the product table
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
              },
              (_, error) => {
                console.error('Error inserting round:', error);
              }
            );
          },
          (_, error) => {
            console.error('Error creating rounds table:', error);
          }
        );
      });

      setIsModalVisible(false);
      setOpendate('');
      setEnddate('');
      setAmount('');
    }
  };




  const handleClearRounds = () => {
    db.transaction((tx) => {
      dropTables(tx); // Dropping tables
      tx.executeSql(
        'DELETE FROM rounds;',
        [],
        () => {
          console.log('Cleared all rounds');
          // Clear the incomes, expenses, and products state arrays
          setIncomes([]);
          setExpenses([]);
          setProducts([]);
        },
        (_, error) => {
          console.error('Error clearing rounds:', error);
        }
      );
    });
  };

  if (!investment) {
    return (
      <View style={styles.container}>
        <Text>กำลังโหลด...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายละเอียดการลงทุนของ : {investment.name}</Text>
      <TouchableOpacity style={styles.buttonRefresh} onPress={handleRefresh}>
        <Text style={styles.buttonTextRefresh}>ดึงข้อมูล</Text>
      </TouchableOpacity>
      <FlatList

        data={rounds}
        renderItem={({ item }) => renderRoundItem({ item, incomes, expenses, products })}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity style={styles.buttonRound} onPress={handleAddRound}>
        <Text style={styles.buttonTextRound}>สร้างรอบการลงทุน</Text>
      </TouchableOpacity>

      {/* ปุ่มClear */}
      <ClearDataButton onPress={clearData} />
      <TouchableOpacity style={styles.buttonClear} onPress={handleClearRounds}>
        <Text style={styles.buttonTextClear}>Clear Round</Text>
      </TouchableOpacity>


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
          <TouchableOpacity
            style={styles.inputmonth}
            onPress={() => setShowOpendatePicker(true)}>
            <Text>กำหนดวันเปิดรอบของการลงทุน:</Text>
          </TouchableOpacity>
          {showOpendatePicker && (
            <DateTimePicker
              value={opendate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => handleOpendateChange(event, selectedDate)}
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveRound}>
            <Text style={styles.buttonText}>สร้างรอบ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.buttonText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default InvestmentDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFF'
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonClear: {
    marginBottom: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    height: 30,
    width: '80%',
    borderRadius: 7
  },
  buttonRound: {
    backgroundColor: '#51087E',
    justifyContent: 'center',
    height: 50,
    width: '80%',
    borderWidth: 1,
    borderRadius: 7,
    marginBottom: 5
  },
  buttonTextRound: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white'
  },
  buttonTextClear: {
    fontSize: 15,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#FFFF'
  },
  buttonRefresh: {
    backgroundColor: '#81B622',
    justifyContent: 'center',
    height: 30,
    width: '30%',
    borderRadius: 7,
    marginBottom: 5,
    alignSelf: 'flex-start',
    marginLeft: 25

  },
  buttonTextRefresh: {
    fontSize: 15,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white',
  },
  modalContainer: {
    marginTop: 50,
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    // backgroundColor: '#EFDCF9',
    backgroundColor: '#FFFF'
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
    color: '#6500B0'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#FFFF',
    height: 50,
  },
  saveButton: {
    marginTop: 100,
    backgroundColor: '#6500B0',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignSelf: 'center'
  },
  cancelButton: {
    marginTop: 5,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignSelf: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center'
  },
  buttonStyle: {
    width: '50%',
  },
  cardRound: {
    backgroundColor: '#fff',
    padding: 5,
    margin: 5,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFFF',
    width: Platform.OS === 'web' ? '80vw' : '100%', // Set width to 80% using vw for web and percentage for mobile
  },
  roundId: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
  },
  amount: {
    fontSize: 25,
    fontWeight: '500',
    color: 'blue'
  },
  detailsButton: {
    color: 'green',
    marginTop: 10
  },
  expensebtn: {
    marginTop: 5,
    backgroundColor: '#DC7633',
    borderRadius: 7,
    width: '100%',
    height: 30,
    alignSelf: 'center'
  },
  incomebtn: {
    marginTop: 5,
    backgroundColor: '#3498DB',
    borderRadius: 7,
    width: '100%',
    height: 30,
    alignSelf: 'center'
  },
  productbtn: {
    marginTop: 5,
    backgroundColor: '#52BE80',
    borderRadius: 7,
    width: '60%',
    height: 20,
    alignSelf: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#2E8BC0',
  },
  itemContainer: {
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#37173D',
    fontWeight: 'bold'
  },
  itemTextTotal: {
    fontSize: 16,
    color: 'purple',
    fontWeight: 'bold'
  },

  inputError: {
    borderColor: 'red', // Border color for invalid input
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
  closeButton: {

    marginTop: 10,
    backgroundColor: 'red',
    height: 20,
    borderRadius: 2,
    width: '100%',
    alignSelf: 'center',
    height: 40

  },
  closeButtonText: {
    fontSize: 25,
    color: '#FFF',
    alignSelf: 'center',
    fontWeight: 'bold'
  },
  chartInvestmentBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E983D8',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    width: '100%',
    height: 50,
    alignSelf: 'center'
  },
  chartProductBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#52BE80',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    width: '100%',
    height: 50,
    alignSelf: 'center'
  },
  ExpenseBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    width: '100%',
    height: 50,
    alignSelf: 'center'
  },
  IncomeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    width: '100%',
    height: 50,
    alignSelf: 'center'
  },
  chartInvestmentBtntwo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1434A4',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    width: '100%',
    height: 50,
    alignSelf: 'center'
  },
  editRoundBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    width: '100%',
    height: 50,
    alignSelf: 'center'
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  disabledButtonText: {
    color: '#666',
  },
  swipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  itemContainerIncome: {
    backgroundColor: '#D4E6F1',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
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
  incomeDetailsContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  roundButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
});
