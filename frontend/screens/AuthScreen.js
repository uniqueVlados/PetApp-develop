import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import axios from 'axios';
import { API_URL } from '../config';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

   const handleAuth = async () => {
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/auth/register`, { email, password });
        Alert.alert("Успех", "Регистрация прошла успешно!");
        setIsRegister(false);
      } else {
        const response = await axios.post(`${API_URL}/auth/token`, 
          `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
          {
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        await AsyncStorage.setItem('token', response.data.access_token);
        await AsyncStorage.setItem('email', email);
        
        // Получаем информацию о пользователе и сохраняем userId
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${response.data.access_token}` }
        });
        await AsyncStorage.setItem('userId', userResponse.data.id.toString());
        
        navigation.replace('Main');
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Ошибка", err.response?.data?.detail || "Произошла ошибка");
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Image
        source={require('../assets/avito-logo.png')}
        style={styles.logo}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholderTextColor={isDarkMode ? "#777" : "#999"}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholderTextColor={isDarkMode ? "#777" : "#999"}
      />
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isRegister ? "Зарегистрироваться" : "Войти"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={[styles.switchText, isDarkMode && styles.darkSwitchText]}>
          {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
        <Text style={styles.themeButtonText}>
          {isDarkMode ? "Светлая тема" : "Темная тема"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
    color: '#000',
  },
  darkInput: {
    borderColor: '#555',
    color: '#fff',
    backgroundColor: '#333',
  },
  button: {
    backgroundColor: '#00AAFF',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#00AAFF',
    fontSize: 16,
  },
  darkSwitchText: {
    color: '#4DB8FF',
  },
  themeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  themeButtonText: {
    textAlign: 'center',
    color: '#000',
  },
});