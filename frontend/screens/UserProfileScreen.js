import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../ThemeContext';

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить профиль пользователя');
    }
  };

  const startChat = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chats`, 
        { recipient_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.navigate('Chat', { 
        chatId: response.data.id, 
        recipientId: userId,
        offerTitle: 'Новый чат'
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Ошибка', 'Не удалось начать чат');
    }
  };

  if (!user) {
    return <View style={styles.container}><Text>Загрузка...</Text></View>;
  }

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <Image 
          source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} 
          style={styles.avatar}
        />
        <Text style={[styles.name, isDarkMode && styles.darkText]}>{user.name}</Text>
        <Text style={[styles.email, isDarkMode && styles.darkText]}>{user.email}</Text>
        <TouchableOpacity style={styles.chatButton} onPress={startChat}>
          <Text style={styles.chatButtonText}>Начать чат</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  darkText: {
    color: '#FFFFFF',
  },
  chatButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});