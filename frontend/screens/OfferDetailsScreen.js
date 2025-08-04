import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image, Dimensions, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { API_URL } from '../config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OfferDetailsScreen({ route, navigation }) {
  const { offerId } = route.params;
  const [offer, setOffer] = useState(null);
  const [message, setMessage] = useState('');
  const [existingChat, setExistingChat] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { isDarkMode } = useTheme();
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchOfferDetails = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
      console.log('Fetching offer details for offerId:', offerId);

      const offerResponse = await axios.get(`${API_URL}/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Offer details response:', offerResponse.data);
      setOffer(offerResponse.data);
      setIsCurrentUserOwner(offerResponse.data.owner_id === parseInt(userId));
      setIsFavorite(offerResponse.data.is_favorite);

    } catch (error) {
      console.error('Error fetching offer details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить детали объявления');
    }
  }, [offerId]);

  const checkExistingChat = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingChat = response.data.find(chat => chat.offer_id === offerId);
      setExistingChat(existingChat);
    } catch (error) {
      console.error('Error checking existing chat:', error);
    }
  }, [offerId]);

  useFocusEffect(
    useCallback(() => {
      fetchOfferDetails();
      checkExistingChat();
    }, [fetchOfferDetails, checkExistingChat])
  );

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState); // Оптимистичное обновление UI

      if (newFavoriteState) {
        await axios.post(`${API_URL}/favorites/`, { offer_id: offerId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.delete(`${API_URL}/favorites/${offerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      console.log(`Offer ${offerId} favorite status updated to ${newFavoriteState}`);
      
      // Обновляем данные с сервера после изменения
      fetchOfferDetails();

    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(!newFavoriteState); // Откатываем изменение в случае ошибки
      Alert.alert('Ошибка', 'Не удалось изменить статус избранного');
    }
  };

  const startOrOpenChat = async () => {
    if (existingChat) {
      navigation.navigate('Chat', { 
        chatId: existingChat.id,
        recipientId: offer.owner_id
      });
    } else {
      if (!message.trim()) {
        Alert.alert('Ошибка', 'Введите сообщение');
        return;
      }

      try {
        const token = await AsyncStorage.getItem('token');
        const chatData = {
          message: message,
          offer_id: offerId
        };
        const response = await axios.post(`${API_URL}/chats/start`, chatData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExistingChat(response.data);
        navigation.navigate('Chat', { 
          chatId: response.data.id,
          recipientId: offer.owner_id
        });
      } catch (error) {
        console.error('Error starting chat:', error.response?.data || error.message);
        Alert.alert('Ошибка', error.response?.data?.detail || 'Не удалось начать чат');
      }
    }
  };

  const handleExit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Детали объявления</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView}>
        {offer && (
          <>
            <Image
              source={{ uri: offer.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.detailsContainer}>
              <Text style={[styles.title, isDarkMode && styles.darkText]}>{offer.title}</Text>
              <Text style={[styles.price, isDarkMode && styles.darkText]}>{offer.price} ₽</Text>
              <Text style={[styles.description, isDarkMode && styles.darkText]}>{offer.description}</Text>
              {!isCurrentUserOwner && (
                <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
                  <Text style={styles.favoriteButtonText}>
                    {isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                  </Text>
                </TouchableOpacity>
              )}
              {!isCurrentUserOwner && (
                <View style={styles.messageContainer}>
                  {!existingChat ? (
                    <>
                      <TextInput
                        style={[styles.input, isDarkMode && styles.darkInput]}
                        placeholder="Введите сообщение"
                        placeholderTextColor={isDarkMode ? "#888" : "#666"}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                      />
                      <TouchableOpacity style={styles.button} onPress={startOrOpenChat}>
                        <Text style={styles.buttonText}>Написать сообщение</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.button} onPress={startOrOpenChat}>
                      <Text style={styles.buttonText}>Перейти в чат</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  exitButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  favoriteButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  favoriteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageContainer: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
  },
  darkInput: {
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    borderColor: '#444444',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  darkText: {
    color: '#FFFFFF',
  },
});