import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';

const RecordListScreen = () => {
  // ข้อมูลการลงทุน (เปลี่ยนเป็นข้อมูลจริงของคุณ)
  const investmentData = [
    { id: '1', name: 'เลี้ยงไก่', amount: '5000 บาท' },
    { id: '2', name: 'เลี้ยงหมูดำ', amount: '8000 บาท' },
    { id: '3', name: 'เลี้ยงปลานิล', amount: '2000 บาท' },
    // ... ข้อมูลเพิ่มเติม
  ];

  const renderInvestmentItem = ({ item }) => (
    <View style={styles.investmentItem}>
      <Text style={styles.investmentName}>{item.name}</Text>
      <Text style={styles.investmentAmount}>{item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ชื่อรายการที่เคยลงทุน</Text>
      <FlatList
        data={investmentData}
        renderItem={renderInvestmentItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  investmentItem: {
    height:50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#D3D3D3',
    borderRadius: 4,
  },
  investmentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  investmentAmount: {
    fontSize: 18,
    color: 'green',
  },
});

export default RecordListScreen;
