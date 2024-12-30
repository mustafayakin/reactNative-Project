import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref, onValue, push } from 'firebase/database';

/**
 * PrescriptionScreen
 * - Kullanıcı seçer (modal)
 * - Tahlil değerlerini (IgG vs.) girer
 * - Tarih ve not ekler
 * - Kaydet butonuyla veriyi Firebase'e gönderir
 *
 * Not: Bu ekranda artık “Reçete Oluştur” başlığı yok; 
 * üst bar, React Navigation tarafından sağlanıyor.
 */
const PrescriptionScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testDate, setTestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [testValues, setTestValues] = useState({
    IgG: '',
    IgG1: '',
    IgG2: '',
    IgG3: '',
    IgG4: '',
    IgA: '',
    IgA1: '',
    IgA2: '',
    IgM: '',
  });
  const [notes, setNotes] = useState('');

  // Firebase'den hasta listesini çekme
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data)
          .map((key) => ({
            id: key,
            name: data[key].name,
            yetki_id: data[key].yetki_id,
          }))
          // Sadece yetki_id=0 ise hasta
          .filter((user) => user.yetki_id === 0);
        setAllUsers(usersArray);
      }
    });
  }, []);

  // Kullanıcı arama
  const handleUserSearch = (value) => {
    setUserId(value);
    // Boşlukla bitince modal açıp listeyi gösteriyoruz
    if (value.endsWith(' ')) {
      const results = allUsers.filter((user) =>
        user.name.toLowerCase().includes(value.trim().toLowerCase())
      );
      setFilteredUsers(results);
      setShowModal(true);
    } else {
      setFilteredUsers([]);
      setShowModal(false);
    }
  };

  // Kullanıcı seçildiğinde
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserId(user.name);
    setFilteredUsers([]);
    setShowModal(false);
  };

  // Kullanıcı temizle
  const handleClearUser = () => {
    setSelectedUser(null);
    setUserId('');
  };

  // Kaydet
  const handleSave = () => {
    if (!selectedUser) {
      alert('Lütfen bir kullanıcı seçin.');
      return;
    }

    const db = getDatabase();
    const testsRef = ref(db, 'tests');

    const newTest = {
      user_id: selectedUser.id,
      test_date: testDate.toISOString().split('T')[0],
      ...testValues,
      notes,
    };

    push(testsRef, newTest)
      .then(() => alert('Tahlil başarıyla kaydedildi!'))
      .catch((error) => alert(`Hata: ${error.message}`));

    // Formu sıfırla
    setSelectedUser(null);
    setUserId('');
    setTestValues({
      IgG: '',
      IgG1: '',
      IgG2: '',
      IgG3: '',
      IgG4: '',
      IgA: '',
      IgA1: '',
      IgA2: '',
      IgM: '',
    });
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 
        Üst bar'ı React Navigation'da tanımlayacaksınız 
        (options={{headerTitle: 'Reçete Oluştur', ...}}).
        Burada sadece içerik:
      */}
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Hasta Seç */}
          <Text style={styles.label}>Hasta Seç</Text>
          <TextInput
            style={styles.input}
            placeholder="Hasta adı girin ve boşluk bırakın"
            placeholderTextColor="#999"
            value={userId}
            onChangeText={handleUserSearch}
          />

          {/* Modal: Hasta Listesi */}
          <Modal visible={showModal} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={filteredUsers}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.userItem}
                      onPress={() => handleUserSelect(item)}
                    >
                      <Text style={styles.userItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Seçilen Hasta */}
          {selectedUser && (
            <View style={styles.selectedUserContainer}>
              <Text style={styles.selectedUser}>
                Seçilen Hasta: {selectedUser.name}
              </Text>
              <TouchableOpacity
                onPress={handleClearUser}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tarih Seçimi */}
          <Text style={styles.label}>Test Tarihi</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>
              {`Tarih: ${testDate.toLocaleDateString()}`}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={testDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setTestDate(selectedDate);
                }
              }}
            />
          )}

          {/* Ig Değerleri */}
          {Object.keys(testValues).map((key) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{key}</Text>
              <TextInput
                style={styles.input}
                placeholder={`Değer (${key})`}
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={testValues[key]}
                onChangeText={(value) =>
                  setTestValues((prev) => ({ ...prev, [key]: value }))
                }
              />
            </View>
          ))}

          {/* Not Alanı */}
          <Text style={styles.label}>Not</Text>
          <TextInput
            style={styles.input}
            placeholder="Not yazın"
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
          />

          {/* Kaydet Butonu */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PrescriptionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F3', // Turuncu temalı arka plan
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    maxHeight: '60%',
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f4511e',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Seçili Hasta
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  selectedUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#f4511e',
    padding: 5,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Tarih
  datePickerButton: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 10,
  },
  // Kaydet Butonu
  saveButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
