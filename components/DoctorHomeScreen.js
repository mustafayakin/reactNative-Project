import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DoctorHomeScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);

  // Yaş hesaplama fonksiyonu
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth)) {
      return 'Geçersiz tarih';
    }
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getDatabase();
        // 1) Tüm kullanıcıları çek
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);

        // 2) Tüm testleri çek (her hastanın kaç testi olduğunu bulmak için)
        const testsRef = ref(db, 'tests');
        const testsSnapshot = await get(testsRef);

        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          // Filtre: yetki_id === 0 olanlar hasta ve birthDate'i tanımlı
          const filteredPatients = Object.keys(usersData)
            .map((key) => ({
              id: key,
              ...usersData[key],
            }))
            .filter((user) => user.yetki_id === 0 && user.birthDate);

          // Test sayısını hesapla
          let testCounts = {};
          if (testsSnapshot.exists()) {
            const testsData = testsSnapshot.val();
            Object.keys(testsData).forEach((testKey) => {
              const test = testsData[testKey];
              const userId = test.user_id;
              if (userId) {
                testCounts[userId] = testCounts[userId]
                  ? testCounts[userId] + 1
                  : 1;
              }
            });
          }

          // Hasta nesnelerine yaş ve test sayısını ekle
          const patientsWithAgeAndTests = filteredPatients.map((patient) => ({
            id: patient.id,
            name: patient.name,
            age: calculateAge(patient.birthDate),
            testCount: testCounts[patient.id] || 0, // Testi yoksa 0
          }));

          setPatients(patientsWithAgeAndTests);
        }
      } catch (error) {
        console.error('Hata:', error.message);
      }
    };

    fetchData();
  }, []);

  // Liste öğesi render fonksiyonu
  const renderPatient = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // İleride profil detayına, tahlillerine vs. yönlendirmek istersen
        // navigation.navigate('UserProfileScreen', { userId: item.id });
      }}
      activeOpacity={0.9}
    >
      {/* Kart içeriği */}
      <View style={styles.cardContent}>
        <Text style={styles.patientName}>{item.name}</Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.patientAge}>{item.age} yaşında</Text>
          <View style={styles.testCountContainer}>
            <FontAwesome name="flask" size={16} color="#f4511e" />
            <Text style={styles.testCountText}>
              {` ${item.testCount} tahlil`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hastalar</Text>
      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Kayıtlı hasta bulunamadı.</Text>
        }
      />

      {/* (+) Butonu */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('PrescriptionEntry')}
        activeOpacity={0.7}
      >
        <FontAwesome name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default DoctorHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F3', // Turuncumsu açık bir zemin
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#f4511e',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    // Turuncu şerit efekti
    borderLeftWidth: 5,
    borderLeftColor: '#f4511e',
  },
  cardContent: {
    padding: 15,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientAge: {
    fontSize: 16,
    color: '#666',
  },
  testCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testCountText: {
    fontSize: 15,
    color: '#f4511e',
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: width / 2 - 25,
    backgroundColor: '#f4511e',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
