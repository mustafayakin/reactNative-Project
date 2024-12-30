import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth } from './firebase';
import { getDatabase, ref, get } from 'firebase/database';
import DoctorHomeScreen from './DoctorHomeScreen';
import GuideScreen from './GuideScreen';
import UserProfilesScreen from './UserProfileScreen';


const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');


const DoctorScreen = ({ navigation }) => {
  const [doctorName, setDoctorName] = useState('Doktor');

  useEffect(() => {
    const fetchDoctorName = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace('Login');
        return;
      }

      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setDoctorName(data.name || 'Doktor');
        }
      } catch (error) {
        console.error('Hata:', error.message);
      }
    };

    fetchDoctorName();
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => navigation.replace('Login'))
      .catch((error) => console.error('Çıkış Hatası:', error.message));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F3' }} edges={['top', 'left', 'right']}>
      {/* Üst Bar */}
      <LinearGradient
        colors={['#f4511e', '#f4511e']} // Alt çubukla aynı renk
        style={styles.topBar}
      >
        <Text style={styles.userName}>Merhaba, {doctorName}!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <FontAwesome name="sign-out" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Alt Gezinme Çubuğu */}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#f4511e', height: 60 }, // Daha küçük height
          tabBarActiveTintColor: '#87CEEB',
          tabBarInactiveTintColor: '#FAD7A0',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Ana Sayfa"
          component={DoctorHomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Klavuz"
          component={GuideScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="book" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Hasta Tahlilleri"
          component={UserProfilesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="users" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  userName: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 10, // Bottom ile birleşik görünsün
    right: width / 2 - 25, // Daha küçük boyut ve ortalama
    backgroundColor: '#f4511e',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default DoctorScreen;
