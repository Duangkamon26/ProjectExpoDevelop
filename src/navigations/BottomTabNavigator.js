import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // คุณอาจใช้ไอคอนจากแพ็คเกจอื่นได้
import ListScreen from '../screens/ListScreen';
import TrendScreen from '../screens/TrendScreen';
import FirstScreen from '../screens/FirstScreen';


const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
    <Tab.Screen
      name="Home"
      component={FirstScreen}
      options={{
        headerShown: true,
        headerTitle: 'หน้าแรก', // กำหนดชื่อ Header
        headerStyle: { backgroundColor: '#51087E' }, // กำหนดสีของ Header
        headerTintColor: 'white', 
        tabBarLabel: 'หน้าเเรก', // กำหนด tabBarLabel เป็นค่าว่าง
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={'#51087E'} />
        ),
        tabBarLabelStyle: { color: '#51087E' }, // กำหนดสี label
      }}
    />
    <Tab.Screen
      name="Trend"
      component={TrendScreen}
      options={{
        tabBarLabel: 'เปรียบเทียบ', // กำหนด tabBarLabel เป็นค่าว่าง
        headerTitle: 'เเสดงการเปรียบเทียบ', // กำหนดชื่อ Header
        headerStyle: { backgroundColor: '#51087E' }, // กำหนดสีของ Header
        headerTintColor: 'white', 
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'ios-analytics' : 'ios-analytics-outline'} size={size} color={'#51087E'} />
        ),
        tabBarLabelStyle: { color: '#51087E' }, // กำหนดสี label
      }}
    />
    <Tab.Screen
      name="List"
      component={ListScreen}
      options={{
        tabBarLabel: 'ประวัติ', // กำหนด tabBarLabel เป็นค่าว่าง
        headerTitle: 'หน้าประวัติการลงทุน', // กำหนดชื่อ Header
        headerStyle: { backgroundColor: '#51087E' }, // กำหนดสีของ Header
        headerTintColor: 'white', 
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={"#51087E"} />
        ),
        tabBarLabelStyle: { color: '#51087E' }, // กำหนดสี label
      }}
    />
  </Tab.Navigator>
  
  );
};

export default BottomTabNavigator;
