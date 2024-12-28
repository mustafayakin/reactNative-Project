import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,Image } from 'react-native';
import { auth } from './firebase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre boş olamaz!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Başarılı', 'Giriş yapıldı!');
      auth.signInWithEmailAndPassword(email,password)
      .then((userCredentials)=>{
        const user = userCredentials.user;
        console.log("kullanici giris yapti : ", user.email);

      }).catch((error) => alert(error.message));
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>eTahlil'e Hoşgeldiniz!</Text>
      <TextInput
        style={styles.input}
        placeholder="e-Mail"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Hesabınız yok mu? Kayıt Olun</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Stil kodları
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  logo: {
    width: 150, // Genişlik ve yükseklik eşit olmalı
    height: 150,
    borderRadius: 75, // Yüksekliğin yarısı kadar
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 15,
  },
  registerText: {
    color: '#6200ee',
    fontSize: 14,
  },
});

export default LoginScreen;
