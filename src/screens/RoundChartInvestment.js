// import React, { useEffect, useState } from 'react';
// import { View, Text } from 'react-native';
// import { BarChart } from 'react-native-chart-kit';
// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabase('test01.db');

// const RoundChartInvestment = ({ route }) => {
//   const investmentId = route.params?.investmentId;
//   const [rounds, setRounds] = useState([]);
//   const [data, setData] = useState(null); // Add a state for the chart data

//   useEffect(() => {
//     if (investmentId) {
//       fetchRounds();
//     }
//   }, [investmentId]);

//   const fetchRounds = () => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         'SELECT * FROM rounds WHERE investment_id = ?;',
//         [investmentId],
//         (_, { rows }) => {
//           const roundsData = rows._array;
//           setRounds(roundsData);
//         },
//         (_, error) => {
//           console.error('Error fetching rounds:', error);
//         }
//       );
//     });
//   };

//   useEffect(() => {
//     if (rounds.length > 0) {
//       // Create the chart data once the rounds data is available
//       setData({
//         labels: rounds.map((round) => `รอบ ${round.id}`),
//         datasets: [
//           {
//             data: getInvestmentAmounts(),
//           },
//         ],
//       });
//     }
//   }, [rounds]);

//   const getInvestmentAmounts = () => {
//     return rounds.map((round) => round.investment_amount);
//   };

//   return (
//     <View>
//       <Text>กราฟแสดงเงินการลงทุนของแต่ละรอบ</Text>
//       {data && (
//         <BarChart
//           data={data}
//           width={300}
//           height={200}
//           yAxisLabel="฿"
//           chartConfig={{
//             backgroundColor: '#ffffff',
//             backgroundGradientFrom: '#ffffff',
//             backgroundGradientTo: '#ffffff',
//             decimalPlaces: 2,
//             color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//             style: {
//               borderRadius: 16,
//             },
//           }}
//         />
//       )}
//     </View>
//   );
// };

// export default RoundChartInvestment;


// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel  } from 'victory-native';

// const RoundChartInvestment = () => {
//   // Sample data for demonstration (you can replace this with your actual data)
//   const rounds = [
//     { id: 1, investment_amount: 9000, expense_amount: 0 },
//     { id: 2, investment_amount: 5800, expense_amount: 200 },
//   ];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>กราฟแสดงเงินการลงทุนของแต่ละรอบ</Text>
//       <VictoryChart domainPadding={{ x: 50 }}>
//         <VictoryBar
//           data={rounds}
//           x="id"
//           y="investment_amount"
//           style={{
//             data: { fill: '#2E8BC0' }, // Blue color for investments
//           }}
//           // labels={'วงเงินการลงทุน'}
//           labels={({ datum }) => `฿${datum.investment_amount}`}
//           labelComponent={<VictoryLabel dy={-1} />}
//         />
//         <VictoryBar
//           data={rounds}
//           x="id"
//           y="expense_amount"
//           style={{
//             data: { fill: 'orange' }, // Red color for expenses
//           }}
//           // labels={'ค่าใช้จ่าย'}
//           labels={({ datum }) => `฿${datum.expense_amount}`}
//           labelComponent={<VictoryLabel dy={1} />}
//         />
//         <VictoryAxis
//           tickValues={rounds.map((round) => round.id)}
//           tickFormat={(tick) => `รอบ ${tick}`}
//           style={{
//             axis: { stroke: '#222222' },
//             ticks: { stroke: '#222222', size: 5 },
//             tickLabels: { fontSize: 12, padding: 5, fill: '#222222' },
//           }}
//         />
//         <VictoryAxis
//           dependentAxis
//           tickFormat={(tick) => `฿${tick}`}
//           style={{
//             axis: { stroke: '#222222' },
//             ticks: { stroke: '#222222', size: 5 },
//             tickLabels: { fontSize: 12, padding: 5, fill: '#222222' },
//           }}
//         />
//       </VictoryChart>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#FFFFFF',

//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
// });

// export default RoundChartInvestment;


import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryLabel } from 'victory-native';
import * as SQLite from 'expo-sqlite';
import moment from 'moment';
import 'moment/locale/th';
import { useRoute } from '@react-navigation/native';

const RoundChartInvestment = () => {
  const db = SQLite.openDatabase('test01.db');
  const [rounds, setRounds] = useState([]);
  const { roundsData } = useRoute().params;

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM rounds WHERE is_closed = 1;',
        [],
        (_, { rows }) => {
          const roundsData = rows._array;
          setRounds(roundsData);
        },
        (_, error) => {
          console.error('Error fetching rounds:', error);
        }
      );
    });
  };

  // Function to generate a random color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Prepare data for investment chart
  const investmentChartData = roundsData
    ? roundsData.map((round) => ({
      x: `วงเงินการลงทุนครั้งที่ ${round.id}`,
      y: round.investment_amount,
      color: getRandomColor(),
    }))
    : [];

  // Customize the appearance of the chart
  const chartTheme = VictoryTheme.material;

  return (
    <ScrollView style={{ backgroundColor: '#FFF' }}>
      <View style={styles.container}>
        {roundsData && roundsData.length > 0 ? (
          <>
            {/* Investment Chart */}
            <VictoryChart theme={chartTheme} domainPadding={{ x: 30 }}>
              <VictoryBar
                data={investmentChartData}
                style={{ data: { fill: '#2E8BC0' } }}
                labels={({ datum }) => `฿${datum.y}`}
                labelComponent={<VictoryLabel dy={-20} />}
              />
            </VictoryChart>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default RoundChartInvestment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
