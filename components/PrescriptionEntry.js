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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref, onValue, push } from 'firebase/database';

const PrescriptionScreen = () => {
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
            yetki_id: data[key].yetki_id, // Yetki kontrolü için
          }))
          .filter((user) => user.yetki_id === 0); // Sadece yetki_id=0 olanlar
        setAllUsers(usersArray);
      }
    });
  }, []);

  const handleUserSearch = (value) => {
    setUserId(value);
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

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserId(user.name);
    setFilteredUsers([]);
    setShowModal(false);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setUserId('');
  };

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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Hasta Seç</Text>
        <TextInput
          style={styles.input}
          placeholder="Hasta adı girin ve boşluk bırakın"
          value={userId}
          onChangeText={handleUserSearch}
        />
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
                    <Text>{item.name}</Text>
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

        {selectedUser && (
          <View style={styles.selectedUserContainer}>
            <Text style={styles.selectedUser}>Seçilen Hasta: {selectedUser.name}</Text>
            <TouchableOpacity onPress={handleClearUser} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Test Tarihi</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{`Tarih: ${testDate.toLocaleDateString()}`}</Text>
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

        {Object.keys(testValues).map((key) => (
          <View key={key} style={styles.inputGroup}>
            <Text style={styles.label}>{key}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Değer (${key})`}
              keyboardType="numeric"
              value={testValues[key]}
              onChangeText={(value) =>
                setTestValues((prev) => ({ ...prev, [key]: value }))
              }
            />
          </View>
        ))}

        <Text style={styles.label}>Not</Text>
        <TextInput
          style={styles.input}
          placeholder="Not yazın"
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    maxHeight: '50%',
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  selectedUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#fff',
  },
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
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PrescriptionScreen;
