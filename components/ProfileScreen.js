import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hesabımı Yönet Sayfası</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Arka plan rengi
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee', // Yazı rengi
  },
});

export default ProfileScreen;
