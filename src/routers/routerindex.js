import { StyleSheet, Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import FirstScreen from '../screens/FirstScreen';
import CreateScreen from '../screens/CreateScreen';
import SplashScreen from '../screens/SplashScreen';
import InvestmentDetails from '../screens/InvestmentDetails';
import EditInvestmentScreen from '../screens/EditInvestmentScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import ProductScreen from '../screens/ProductScreen';
import RoundChartInvestment from '../screens/RoundChartInvestment';
import IncomeChartScreen from '../screens/IncomeChartScreen';
import EditProductScreen from '../screens/EditScreen/EditProductScreen';
import EditExpenseScreen from '../screens/EditScreen/EditExpenseScreen';
import EditIncomeScreen from '../screens/EditScreen/EditIncomeScreen';
import EditRoundScreen from '../screens/EditScreen/EditRoundScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import BottomTabNavigator from '../navigations/BottomTabNavigator';
import RoundListScreen from '../screens/RoundListScreen';


// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { FontAwesome, Ionicons } from '@expo/vector-icons'; // ตัวอย่างใช้ FontAwesome และ Ionicons สำหรับ React Native Expo
// const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// const TabNavigator = () => {
//   return (
//     <Tab.Navigator>
//       <Tab.Screen
//         name="Home"
//         component={FirstScreen}
//         options={{
//           tabBarLabel: 'Home',
//           tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
//         }}
//       />
//       <Tab.Screen
//         name="Create"
//         component={CreateScreen}
//         options={{
//           tabBarLabel: 'Create',
//           tabBarIcon: ({ color, size }) => <FontAwesome name="plus" size={size} color={color} />,
//         }}
//       />
//       <Tab.Screen
//         name="Details"
//         component={InvestmentDetails}
//         options={{
//           tabBarLabel: 'Details',
//           tabBarIcon: ({ color, size }) => <Ionicons name="ios-information-circle" size={size} color={color} />,
//         }}
//       />
//       {/* Add other screens for the tabs as needed */}
//     </Tab.Navigator>
//   );
// };
const routerindex = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }} // Hide the header for the Splash screen
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'หน้าเเรก',
          headerTitle: 'ยินดีต้อนรับ',
          headerStyle: {
            backgroundColor: '#7954A1', // Change the header background color
          },
          headerTintColor: '#FFFF'
        }} // Show the header for the Home screen
      />
      <Stack.Screen
        name="Home"
        component={FirstScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'หน้าเเรก',
          headerTitle: 'สร้างการลงทุน',
          headerStyle: {
            backgroundColor: '#7954A1', // Change the header background color
          },
          headerTintColor: '#FFFF'
        }} // Show the header for the Home screen
      />
      <Stack.Screen name="App" component={BottomTabNavigator} 
      options={{
        headerShown: false
        , headerTitleAlign: 'center',
        headerTitle: 'หน้าเเรก',
        headerTitle: 'หน้าเเรก',
        headerStyle: {
          backgroundColor: '#7954A1', // Change the header background color
        },
      }}
      />
     
      <Stack.Screen
        name="Create"
        component={CreateScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'หน้าสำหรับสร้างการลงทุน',
          headerStyle: {
            backgroundColor: '#7954A1', // Change the header background color
          },
          headerTintColor: '#FFFF'
        }} // Show the header for the Create screen
      />
      <Stack.Screen
        name="Details"
        component={InvestmentDetails}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'หน้ารอบการลงทุน',
          headerStyle: {
            backgroundColor: '#7954A1', // Change the header background color
          },
          headerTintColor: '#FFFF'
        }} // Show the header for the Create screen
      />

   
  

      <Stack.Screen name="EditInvestment" component={EditInvestmentScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#7954A1', // Change the header background color
          },
          headerTitle: 'หน้าเเก้ไขข้อมูลการลงทุน',
          headerTintColor: '#FFFF'
        }}

      />
      <Stack.Screen
        name="AddIncome"
        component={IncomeScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#3498DB', // Change the header background color
          },
          headerTitle: 'หน้าเพิ่มรายได้',
          headerTintColor: '#FFFF'
        }}
      />
      <Stack.Screen
        name="AddExpense"
        component={ExpenseScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#FFA500', // Change the header background color
          },
          headerTitle: 'หน้าเพิ่มค่าใช้จ่าย',
          headerTintColor: '#FFFF'
        }}
      />
      <Stack.Screen
        name="AddProduct"
        component={ProductScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#52BE80', // Change the header background color
          },
          headerTitle: 'หน้าเพิ่มผลผลิต',
          headerTintColor: '#FFFF'
        }}
      />

      <Stack.Screen
        name="BarChart"
        component={RoundChartInvestment}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#E983D8', // Change the header background color
          },
          headerTitle: 'หน้าเเสดงกราฟข้อมูล',
          headerTintColor: '#FFFF'
        }}
      />


      <Stack.Screen
        name="IncomeChart"
        component={IncomeChartScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#1434A4', // Change the header background color
          },
          headerTitle: 'หน้าเเสดงข้อมูลเเผนภาพ',
          headerTintColor: '#FFFF'
        }}
      />
      
      {/* สำหรับหน้าเเก้ไข */}
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#52BE80', // Change the header background color
          },
          headerTitle: 'หน้าเเก้ไขการเพิ่มผลผลิต',
          headerTintColor: '#FFFF'
        }}
      />

      <Stack.Screen
        name="EditExpense"
        component={EditExpenseScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#FFA500', // Change the header background color
          },
          headerTitle: 'หน้าเเก้ไขการเพิ่มค่าใช้จ่าย',
          headerTintColor: '#FFFF'
        }}
      />

      <Stack.Screen
        name="EditcomeIN"
        component={EditIncomeScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'ListChart',
          headerStyle: {
            backgroundColor: '#3498DB', // Change the header background color
          },
          headerTitle: 'หน้าเเก้ไขการเพิ่มรายได้',
          headerTintColor: '#FFFF'
        }}
      />

      <Stack.Screen
        name="EditRound"
        component={EditRoundScreen}
      />

      {/* Rename this screen */}
      <Stack.Screen
        name="RoundList"
        component={RoundListScreen}
      />
      {/* history */}
      {/* <Stack.Screen
        name="List"
        component={ListScreen}
        options={{
          headerShown: true
          , headerTitleAlign: 'center',
          headerTitle: 'List',
          headerStyle: {
            backgroundColor: '#3498DB', // Change the header background color
          },
          headerTitle: 'หน้าประวัติการลงทุน',
          headerTintColor: '#FFFF'
        }}
      /> */}



    </Stack.Navigator>

  )
}

export default routerindex

const styles = StyleSheet.create({})