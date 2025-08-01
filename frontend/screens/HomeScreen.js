
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [offers, setOffers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOffers();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchOffers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/offers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

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
      setOffers(offers.map(o => o.id === offerId ? {...o, is_favorite: !o.is_favorite} : o));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderOffer = ({ item }) => (
    <TouchableOpacity 
      style={[styles.offerCard, isDarkMode && styles.darkOfferCard]}
      onPress={() => navigation.navigate('OfferDetails', { offerId: item.id })}
    >
      <View style={styles.offerInfo}>
        <Text style={[styles.offerTitle, isDarkMode && styles.darkText]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.offerPrice, isDarkMode && styles.darkText]}>{item.price} ₽</Text>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
          <Ionicons name={item.is_favorite ? 'heart' : 'heart-outline'} size={24} color={item.is_favorite ? '#FF6B6B' : (isDarkMode ? '#FFFFFF' : '#000000')} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateOffer')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  offerCard: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  darkOfferCard: {
    backgroundColor: '#2E2E2E',
  },
  leftCard: {
    marginRight: 2.5,
  },
  rightCard: {
    marginLeft: 2.5,
  },
  offerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  offerInfo: {
    padding: 10,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  offerPrice: {
    fontSize: 14,
    color: 'green',
    marginTop: 5,
  },
  darkText: {
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
  },
   addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
  },
});