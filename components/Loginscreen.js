import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { auth } from './firebase';
import { getDatabase, ref, get } from 'firebase/database';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre boş olamaz!');
      return;
    }
    setLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Firebase Database'den kullanıcı bilgisi çekme
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.yetki_id === 1) {
          navigation.navigate('Doctor'); // Doktor sayfasına yönlendirme
        } else if (userData.yetki_id === 0) {
          navigation.navigate('Patient'); // Hasta sayfasına yönlendirme
        } else {
          Alert.alert('Hata', 'Geçersiz yetki!');
        }
      } else {
        Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı!');
      }
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo veya Uygulama Görseli */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Hoşgeldiniz Yazısı */}
      <Text style={styles.title}>eTahlil'e Hoşgeldiniz!</Text>

      {/* E-posta Girişi */}
      <TextInput
        style={styles.input}
        placeholder="e-Mail"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Şifre Girişi */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Yükleniyor Göstergesi veya Giriş Butonu */}
      {loading ? (
        <ActivityIndicator size="large" color="#f4511e" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
      )}

      {/* Kayıt Ol Butonu */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Hesabınız yok mu? Kayıt Olun</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F3', // Turuncumsu açık arka plan
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#f4511e', // Turuncu çerçeve
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f4511e',
    marginBottom: 30,
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
  registerButton: {
    marginTop: 15,
  },
  registerText: {
    color: '#f4511e',
    fontSize: 16,
    fontWeight: '500',
  },
});
