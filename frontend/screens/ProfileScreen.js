import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, Alert, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { API_URL } from '../config';
import axios from 'axios';

export default function ProfileScreen({ navigation }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);
  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(response.data);
      setAvatarUrl(response.data.avatar || '');
      setName(response.data.name || '');
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о пользователе');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Ошибка', 'Не удалось выйти из профиля');
    }
  };

  const updateAvatar = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/users/me/avatar`, { avatar_url: avatarUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUserInfo();
      Alert.alert('Успех', 'Аватар успешно обновлен');
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Ошибка', 'Не удалось обновить аватар');
    }
  };

  const updateName = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/users/me/update`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUserInfo();
      Alert.alert('Успех', 'Имя успешно обновлено');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Ошибка', 'Не удалось обновить имя');
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните оба поля пароля');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/users/me/change-password`, 
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Успех', 'Пароль успешно изменен');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Ошибка', 'Не удалось изменить пароль');
    }
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, isDarkMode && styles.darkContainer]} 
      edges={['top', 'right', 'left']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {userInfo && (
          <View style={styles.userInfo}>
            <Image 
              source={avatarUrl ? { uri: avatarUrl } : require('../assets/default-avatar.png')} 
              style={styles.avatar} 
            />
            <Text style={[styles.userName, isDarkMode && styles.darkText]}>{userInfo.name}</Text>
            <Text style={[styles.userEmail, isDarkMode && styles.darkText]}>{userInfo.email}</Text>
          </View>
        )}
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Введите URL аватара"
          placeholderTextColor={isDarkMode ? "#777" : "#999"}
          value={avatarUrl}
          onChangeText={setAvatarUrl}
        />
        <TouchableOpacity style={styles.updateButton} onPress={updateAvatar}>
          <Text style={styles.updateButtonText}>Обновить аватар</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Введите новое имя"
          placeholderTextColor={isDarkMode ? "#777" : "#999"}
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.updateButton} onPress={updateName}>
          <Text style={styles.updateButtonText}>Обновить имя</Text>
        </TouchableOpacity>
        
        {/* Новые поля для изменения пароля */}
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Введите старый пароль"
          placeholderTextColor={isDarkMode ? "#777" : "#999"}
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Введите новый пароль"
          placeholderTextColor={isDarkMode ? "#777" : "#999"}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.updateButton} onPress={changePassword}>
          <Text style={styles.updateButtonText}>Изменить пароль</Text>
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Темная тема</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Выйти</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#000000',
  },
  darkInput: {
    borderColor: '#444444',
    color: '#FFFFFF',
    backgroundColor: '#333333',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 16,
    color: '#000000',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
});