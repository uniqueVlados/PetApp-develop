import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import axios from 'axios';
import { API_URL } from '../config';

export default function FilterScreen({ navigation, route }) {
  const { isDarkMode } = useTheme();
  const [filters, setFilters] = useState(route.params?.filters || {});
  const [availableFilters, setAvailableFilters] = useState({});

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  const fetchAvailableFilters = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не найден');
      }
      const response = await axios.get(`${API_URL}/offers/filters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Проверяем, что response.data существует и является объектом
      if (response.data && typeof response.data === 'object') {
        setAvailableFilters(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        Alert.alert('Ошибка', 'Неожиданный формат данных фильтров');
      }
    } catch (error) {
      console.error('Error fetching filters:', error.response || error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Ошибка авторизации', 'Пожалуйста, войдите в систему заново');
        navigation.navigate('Login');
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить фильтры. Попробуйте позже.');
      }
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    route.params?.onApplyFilters(filters);
    navigation.goBack();
  };

  const renderFilterInput = (filterName, filterValue) => {
    if (Array.isArray(filterValue)) {
      // Для массивов (например, категории или местоположения) можно использовать выпадающий список
      return (
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={filters[filterName] || ''}
          onChangeText={(value) => handleFilterChange(filterName, value)}
          placeholder={`Выберите ${filterName}`}
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
        />
      );
    } else if (typeof filterValue === 'object' && filterValue !== null) {
      // Для объектов (например, диапазон цен)
      return (
        <View>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={filters[`${filterName}_min`] || ''}
            onChangeText={(value) => handleFilterChange(`${filterName}_min`, value)}
            placeholder={`Мин ${filterName}`}
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={filters[`${filterName}_max`] || ''}
            onChangeText={(value) => handleFilterChange(`${filterName}_max`, value)}
            placeholder={`Макс ${filterName}`}
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            keyboardType="numeric"
          />
        </View>
      );
    } else if (typeof filterValue === 'boolean') {
      return (
        <Switch
          value={filters[filterName] || false}
          onValueChange={(value) => handleFilterChange(filterName, value)}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView>
        {Object.entries(availableFilters).map(([filterName, filterValue]) => (
          <View key={filterName} style={styles.filterItem}>
            <Text style={[styles.filterName, isDarkMode && styles.darkText]}>{filterName}</Text>
            {renderFilterInput(filterName, filterValue)}
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
        <Text style={styles.applyButtonText}>Применить фильтры</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  filterItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#000000',
    marginTop: 5,
  },
  darkInput: {
    borderColor: '#444444',
    color: '#FFFFFF',
    backgroundColor: '#333333',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    margin: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#FFFFFF',
  },
});