import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const filteredPatients = Object.values(data).filter(
            (user) => user.yetki_id === 0 && user.birthDate
          );

          const patientsWithAge = filteredPatients.map((patient) => ({
            name: patient.name,
            age: calculateAge(patient.birthDate),
          }));

          setPatients(patientsWithAge);
        }
      } catch (error) {
        console.error('Hata:', error.message);
      }
    };

    fetchPatients();
  }, []);

  // Liste öğesi render fonksiyonu
  const renderPatient = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.patientName}>{item.name}</Text>
      <Text style={styles.patientAge}>{item.age} yaşında</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hastalar</Text>
      <FlatList
        data={patients}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderPatient}
        ListEmptyComponent={<Text style={styles.emptyText}>Kayıtlı hasta bulunamadı.</Text>}
      />
      
      {/* + Tuşu */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('PrescriptionEntry')} // PrescriptionEntry ekranına yönlendirir
      >
        <FontAwesome name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  patientAge: {
    fontSize: 16,
    color: '#666',
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

export default DoctorHomeScreen;
