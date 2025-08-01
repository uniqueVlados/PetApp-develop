import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { API_URL } from '../config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const itemWidth = (width - 30) / 2;

export default function OffersScreen({ navigation }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const { isDarkMode } = useTheme();

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { favorites_only: showFavorites }
      });
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  }, [showFavorites]);

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [fetchOffers])
  );

  const toggleFavorite = async (offerId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const offer = offers.find(o => o.id === offerId);
      if (offer.is_favorite) {
        await axios.delete(`${API_URL}/favorites/${offerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/favorites/`, { offer_id: offerId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Обновляем состояние локально
      setOffers(offers.map(o => o.id === offerId ? {...o, is_favorite: !o.is_favorite} : o));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderOfferItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.offerItem, isDarkMode && styles.darkOfferItem]}
      onPress={() => navigation.navigate('OfferDetails', { offerId: item.id })}
    >
      <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.offerImage} />
      <View style={styles.offerInfo}>
        <Text style={[styles.offerTitle, isDarkMode && styles.darkText]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.offerPrice, isDarkMode && styles.darkText]}>{item.price} ₽</Text>
      </View>
      <TouchableOpacity 
        style={styles.favoriteButton} 
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons 
          name={item.is_favorite ? 'heart' : 'heart-outline'} 
          size={24} 
          color={item.is_favorite ? '#FF6B6B' : (isDarkMode ? '#FFFFFF' : '#000000')} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView 
      style={[styles.safeArea, isDarkMode && styles.darkContainer]} 
      edges={['top', 'right', 'left']}
    >
      <View style={[styles.filterContainer, isDarkMode && styles.darkFilterContainer]}>
        <TouchableOpacity
          style={[styles.filterButton, !showFavorites && styles.activeFilter]}
          onPress={() => setShowFavorites(false)}
        >
          <Text style={[styles.filterText, !showFavorites && styles.activeFilterText, isDarkMode && styles.darkText]}>Все</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showFavorites && styles.activeFilter]}
          onPress={() => setShowFavorites(true)}
        >
          <Text style={[styles.filterText, showFavorites && styles.activeFilterText, isDarkMode && styles.darkText]}>Избранные</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          extraData={[offers, showFavorites]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkFilterContainer: {
    backgroundColor: '#333333',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 5,
  },
  offerItem: {
    width: itemWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  darkOfferItem: {
    backgroundColor: '#333333',
  },
  offerImage: {
    width: '100%',
    height: itemWidth,
    resizeMode: 'cover',
  },
  offerInfo: {
    padding: 10,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  darkText: {
    color: '#FFFFFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});