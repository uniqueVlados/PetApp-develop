import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useTheme } from '../ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function CreateOfferScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { isDarkMode } = useTheme();

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
      image_url: imageUrl
    };

    const response = await axios.post(`${API_URL}/offers`, offerData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Закрываем экран создания объявления
    navigation.goBack();

    // Показываем уведомление об успешном создании
    Alert.alert('Успех', 'Объявление успешно создано');

    // Обновляем список объявлений на предыдущем экране (если это необходимо)
    // Это зависит от того, как реализован ваш список объявлений
    // Например, вы можете использовать событие focus для обновления списка

  } catch (error) {
    console.error('Error creating offer:', error);
    Alert.alert('Ошибка', 'Не удалось создать объявление');
  }
};

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkContainer]} edges={['top', 'left', 'right']}>
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Опубликовать объявление</Text>
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
    padding: 20,
    paddingTop: 10, // Уменьшенный отступ сверху
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
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 15,
    borderRadius: 5,
  },
});