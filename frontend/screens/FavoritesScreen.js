
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (offerId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_URL}/favorites/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favorites.filter(fav => fav.id !== offerId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderFavorite = ({ item }) => (
    <TouchableOpacity 
      style={[styles.favoriteItem, isDarkMode && styles.darkFavoriteItem]}
      onPress={() => navigation.navigate('OfferDetails', { offerId: item.id })}
    >
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.favoriteImage} />}
      <View style={styles.favoriteInfo}>
        <Text style={[styles.favoriteTitle, isDarkMode && styles.darkText]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.favoritePrice, isDarkMode && styles.darkText]}>{item.price} ₽</Text>
      </View>
      <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
        <Ionicons name="heart" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode && styles.darkText]}>У вас пока нет избранных объявлений</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  favoriteItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
  },
  darkFavoriteItem: {
    backgroundColor: '#333333',
  },
  favoriteImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
    marginBottom: 5,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  favoritePrice: {
    fontSize: 14,
    color: '#007AFF',
  },
  darkText: {
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#000000',
  },
});