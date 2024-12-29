import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from './firebase';
import { getDatabase, ref, get } from 'firebase/database';

const PatientScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Kullanıcı'); // Varsayılan kullanıcı adı

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace('Login'); // Kullanıcı giriş yapmamışsa giriş ekranına yönlendirme
        return;
      }

      try {
        const db = getDatabase(); // Realtime Database'e erişim
        const userRef = ref(db, `users/${user.uid}`); // Kullanıcının bilgilerine erişim
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserName(data.name || 'Kullanıcı'); // Veritabanından kullanıcı adını al
        }
      } catch (error) {
        console.error('Hata:', error.message);
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => navigation.replace('Login')) // Çıkış yaptıktan sonra giriş ekranına yönlendirme
      .catch((error) => console.error('Çıkış Hatası:', error.message));
  };

  return (
    <LinearGradient
      colors={['white', '#87CEEB']}
      style={styles.container}
    >
      {/* Üst Bar */}
      <View style={styles.topBar}>
        <Text style={styles.userName}>Merhaba, {userName}!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <FontAwesome name="sign-out" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Orta Alan */}
      <View style={styles.middle}>
        <Text style={styles.greeting}>Uygulamaya Hoş Geldiniz!</Text>
        <Text style={styles.greetingSub}>Tahlil sonuçlarınızı ve hesap ayarlarınızı buradan yönetin.</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f4511e',
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
  greetingSub: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});

export default PatientScreen;