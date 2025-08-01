import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateAdScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async () => {
    if (!title || !description || !price || !location) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/offers`, {
        title,
        description,
        price: parseFloat(price),
        location
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Успех', 'Объявление успешно создано');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating ad:', error);
      Alert.alert('Ошибка', 'Не удалось создать объявление');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Название</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Введите название объявления"
      />

      <Text style={styles.label}>Описание</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Опишите ваш товар или услугу"
        multiline
      />

      <Text style={styles.label}>Цена</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Введите цену"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Местоположение</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Укажите местоположение"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Опубликовать объявление</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#00AAFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});