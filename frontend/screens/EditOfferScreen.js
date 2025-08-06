import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { useTheme } from '../ThemeContext';

export default function EditOfferScreen({ route, navigation }) {
  const { offerId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchOfferDetails();
  }, []);

  const fetchOfferDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const offer = response.data;
      setTitle(offer.title);
      setDescription(offer.description);
      setPrice(offer.price.toString());
      setLocation(offer.location);
      setImageUrl(offer.image_url);
      setIsActive(offer.is_active);
    } catch (error) {
      console.error('Error fetching offer details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные объявления');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !price || !location) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const offerData = {
        title,
        description,
        price: parseFloat(price),
        location,
        image_url: imageUrl,
        is_active: isActive
      };

      await axios.put(`${API_URL}/offers/${offerId}`, offerData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert('Успех', 'Объявление успешно обновлено', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating offer:', error);
      Alert.alert('Ошибка', 'Не удалось обновить объявление');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить это объявление?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${API_URL}/offers/${offerId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Успех', 'Объявление успешно удалено', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting offer:', error);
              Alert.alert('Ошибка', 'Не удалось удалить объявление');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, isDarkMode && styles.darkText]}>Отмена</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Редактировать</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={[styles.headerButton, isDarkMode && styles.darkText]}>Сохранить</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.label, isDarkMode && styles.darkText]}>Название*</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={title}
          onChangeText={setTitle}
          placeholder="Введите название объявления"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
        />

        <Text style={[styles.label, isDarkMode && styles.darkText]}>Описание*</Text>
        <TextInput
          style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Опишите ваш товар или услугу"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          multiline
        />

        <Text style={[styles.label, isDarkMode && styles.darkText]}>Цена*</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={price}
          onChangeText={setPrice}
          placeholder="Введите цену"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          keyboardType="numeric"
        />

        <Text style={[styles.label, isDarkMode && styles.darkText]}>Местоположение*</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={location}
          onChangeText={setLocation}
          placeholder="Укажите местоположение"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
        />

        <Text style={[styles.label, isDarkMode && styles.darkText]}>URL изображения (необязательно)</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="Введите URL изображения"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.imagePreview} />}

        <View style={styles.switchContainer}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>Активно</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isActive ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Удалить объявление</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  darkInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    borderColor: '#555555',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 15,
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});