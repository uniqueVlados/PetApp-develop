import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function OfferDetailsScreen({ route, navigation }) {
  const { offerId } = route.params;
  const [offer, setOffer] = useState(null);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isDarkMode } = useTheme();
  const [chatExists, setChatExists] = useState(false);

  useEffect(() => {
    fetchOfferDetails();
    checkExistingChat();
  }, []);

  const fetchOfferDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${API_URL}/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffer(response.data);
      setIsCurrentUserOwner(response.data.owner_id.toString() === userId);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error('Error fetching offer details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные объявления');
    }
  };

  const handleChat = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chats/start`, 
        { recipient_id: offer.owner_id, offer_id: offer.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.navigate('Chat', { chatId: response.data.id });
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Ошибка', 'Не удалось создать чат');
    }
  };

  const checkExistingChat = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingChat = response.data.find(chat => chat.offer_id === offerId);
      setChatExists(!!existingChat);
    } catch (error) {
      console.error('Error checking existing chat:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${offerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/favorites/`, { offer_id: offerId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Ошибка', 'Не удалось изменить статус избранного');
    }
  };

  const toggleActive = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/offers/${offerId}`, 
        { ...offer, is_active: !offer.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOffer({ ...offer, is_active: !offer.is_active });
    } catch (error) {
      console.error('Error toggling active status:', error);
      Alert.alert('Ошибка', 'Не удалось изменить статус активности');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (!offer) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>Загрузка...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Детали объявления</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView>
        <Image source={{ uri: offer.image_url || 'https://via.placeholder.com/400' }} style={styles.image} />
        <View style={styles.content}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>{offer.title}</Text>
          <Text style={[styles.price, isDarkMode && styles.darkText]}>{offer.price} ₽</Text>
          <Text style={[styles.description, isDarkMode && styles.darkText]}>{offer.description}</Text>
          <Text style={[styles.location, isDarkMode && styles.darkText]}>Местоположение: {offer.location}</Text>
          <Text style={[styles.date, isDarkMode && styles.darkText]}>
            Дата публикации: {new Date(offer.created_at).toLocaleDateString()}
          </Text>
          {isCurrentUserOwner && (
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, isDarkMode && styles.darkText]}>Активно</Text>
              <Switch
                value={offer.is_active}
                onValueChange={toggleActive}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={offer.is_active ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
         {isCurrentUserOwner ? (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.buttonText}>Редактировать</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.buttonText}>{chatExists ? 'Перейти в чат' : 'Написать продавцу'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#FF6B6B' : '#000'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  chatButton: {
    backgroundColor: '#4CD964',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  favoriteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  darkText: {
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
});