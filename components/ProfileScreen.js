import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';

import { auth } from './firebase';
import { getDatabase, ref, get, update } from 'firebase/database';

// <-- Firebase Auth Provider importu (reauthenticateWithCredential için)
import { EmailAuthProvider } from 'firebase/auth';

const ProfileScreen = ({ navigation }) => {
  // Ekrandaki inputlar
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [newPassword, setNewPassword] = useState(''); // Yeni Şifre (opsiyonel)
  const [currentPassword, setCurrentPassword] = useState(''); // Mevcut Şifre (reauth için)
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Kullanıcının mevcut bilgilerini çekme
    const fetchProfile = async () => {
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
          // DB'den gelen veriler
          setName(data.name || '');
          // Auth üzerinden anlık email:
          setEmail(user.email || '');
          // Doğum tarihi string geliyorsa Date'e çevir
          if (data.birthDate) {
            setBirthDate(new Date(data.birthDate));
          }
        }
      } catch (error) {
        console.log('Profil bilgisi çekilirken hata:', error.message);
      }
    };

    fetchProfile();
  }, [navigation]);

  // Doğum tarihi seçildiğinde
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  /**
   * Kullanıcı bilgilerini kaydet:
   * - Re-authentication: E-posta veya şifre değişiyorsa mecbur
   * - E-posta (auth.updateEmail)
   * - Şifre (auth.updatePassword)
   * - DB -> name, birthDate
   */
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı!');
        setLoading(false);
        return;
      }

      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);

      // Mevcut e-posta
      const currentEmail = user.email;

      const wantsToUpdateEmail = email && email !== currentEmail;
      const wantsToUpdatePassword = newPassword.trim().length > 0;

      // E-posta veya şifre değişecekse re-authenticate ol
      if (wantsToUpdateEmail || wantsToUpdatePassword) {
        if (!currentPassword) {
          Alert.alert('Hata', 'Mevcut şifrenizi girmelisiniz!');
          setLoading(false);
          return;
        }

        // Re-authenticate
        const cred = EmailAuthProvider.credential(currentEmail, currentPassword);
        await user.reauthenticateWithCredential(cred);
      }

      // E-posta güncelle
      if (wantsToUpdateEmail) {
        await user.updateEmail(email);
      }

      // Şifre güncelle
      if (wantsToUpdatePassword) {
        await user.updatePassword(newPassword);
      }

      // DB'de name ve birthDate güncelle
      await update(userRef, {
        name: name || '',
        birthDate: birthDate.toISOString(),
        // email de DB'de tutuluyorsa güncelle:
        email: email || '',
      });

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi!');
      setNewPassword(''); // Yeni şifre alanını temizle
      setCurrentPassword(''); // Mevcut şifre alanını temizle
    } catch (error) {
      console.log('Profil güncelleme hatası:', error);
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hesabımı Yönet</Text>
      </View>

      <View style={styles.container}>
        {/* İsim */}
        <Text style={styles.label}>İsim Soyisim</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="İsim Soyisim"
          placeholderTextColor="#999"
        />

        {/* E-posta */}
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Yeni e-mail"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Doğum Tarihi */}
        <Text style={styles.label}>Doğum Tarihi</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <FontAwesome name="calendar" size={20} color="#f4511e" />
          <Text style={styles.datePickerButtonText}>
            {birthDate.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()} // Doğum tarihi bugünden ileri olmasın
          />
        )}

        {/* Mevcut Şifre (Re-auth için) */}
        <Text style={styles.label}>Mevcut Şifre (Zorunlu, e-posta veya şifre değiştirecekseniz)</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mevcut Şifre"
          placeholderTextColor="#999"
          secureTextEntry
        />

        {/* Yeni Şifre (Opsiyonel) */}
        <Text style={styles.label}>Yeni Şifre (Opsiyonel)</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Yeni Şifre"
          placeholderTextColor="#999"
          secureTextEntry
        />

        {/* Kaydet Butonu */}
        {loading ? (
          <ActivityIndicator size="large" color="#f4511e" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

// Stil tanımları
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F3',
  },
  header: {
    backgroundColor: '#f4511e',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4511e',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
  },
  datePickerButtonText: {
    color: '#333',
    marginLeft: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#f4511e',
    borderRadius: 10,
    height: 50,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
