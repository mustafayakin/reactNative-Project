import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getDatabase, ref, set } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from './firebase';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name || !birthDate) {
      Alert.alert('Hata', 'Tüm alanlar doldurulmalıdır!');
      return;
    }

    setLoading(true);
    try {
      // Firebase Authentication ile kullanıcı kaydı
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Firebase Realtime Database'e kullanıcı bilgilerini ekle
      const db = getDatabase();
      await set(ref(db, `users/${user.uid}`), {
        name,
        email,
        birthDate: birthDate.toISOString(),
        yetki_id: 0,
        created_at: new Date().toISOString(),
      });

      Alert.alert('Başarılı', 'Kayıt başarıyla tamamlandı!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      {/* İsim Soyisim */}
      <TextInput
        style={styles.input}
        placeholder="İsim Soyisim"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      {/* E-mail */}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {/* Şifre */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Doğum Tarihi Seçici */}
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerText}>
          Doğum Tarihi: {birthDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setBirthDate(selectedDate);
            }
          }}
        />
      )}

      {/* Kayıt Butonu veya Yükleniyor */}
      {loading ? (
        <ActivityIndicator size="large" color="#f4511e" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F3', // Turuncumsu açık arka plan
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f4511e',  // Turuncu vurgu
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#f4511e', // Turuncu buton
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // Hafif gölge
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
