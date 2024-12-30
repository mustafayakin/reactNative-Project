import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from './firebase';
import { getDatabase, ref, get } from 'firebase/database';

const PatientScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Kullanıcı');
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace('Login');
        return;
      }

      try {
        const db = getDatabase();
        // 1) Kullanıcı Adı
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserName(data.name || 'Kullanıcı');
        }

        // 2) Tahlil Sayısı
        const testsRef = ref(db, 'tests');
        const testsSnapshot = await get(testsRef);
        if (testsSnapshot.exists()) {
          const testsData = testsSnapshot.val();
          // Kullanıcının testlerini say
          const userTests = Object.values(testsData).filter(
            (test) => test.user_id === user.uid
          );
          setTestCount(userTests.length);
        }
      } catch (error) {
        console.error('Hata:', error.message);
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => navigation.replace('Login'))
      .catch((error) => console.error('Çıkış Hatası:', error.message));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Üst Bar */}
        <View style={styles.topBar}>
          <Text style={styles.userName}>Merhaba, {userName}!</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <FontAwesome name="sign-out" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Orta Alan */}
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Uygulamaya Hoş Geldiniz!</Text>
          <Text style={styles.subtitle}>
            Tahlil sonuçlarınızı ve hesap ayarlarınızı buradan yönetebilirsiniz.
          </Text>

          {/* Kullanıcının Tahlil Sayısı */}
          <View style={styles.testCountCard}>
            <Text style={styles.testCountTitle}>Tahlil Sayınız</Text>
            <Text style={styles.testCountValue}>{testCount}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PatientScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F3', // Arka plan rengi SafeAreaView ile birlikte
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF9F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e', // Turuncu üst bar
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f4511e', // Turuncu vurgu
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  // Tahlil sayısı kartı
  testCountCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    elevation: 2,
  },
  testCountTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f4511e',
    marginBottom: 10,
  },
  testCountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
});
