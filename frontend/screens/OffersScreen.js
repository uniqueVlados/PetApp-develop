import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView, ActivityIndicator, TextInput, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { API_URL } from '../config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function OffersScreen({ navigation }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const searchHeight = useState(new Animated.Value(0))[0];
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState([]);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не найден');
      }
      const response = await axios.get(`${API_URL}/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          favorites_only: showFavorites, 
          exclude_own: true,
          search: searchQuery,
          ...filters
        }
      });
      setOffers(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке объявлений:', error.response || error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Ошибка авторизации', 'Пожалуйста, войдите в систему заново');
        navigation.navigate('Login');
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить объявления. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  }, [showFavorites, searchQuery, filters, navigation]);


  useFocusEffect(
  useCallback(() => {
    fetchOffers();
  }, [fetchOffers, filters])
);

  const toggleFavorite = async (offerId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не найден');
      }
      const offer = offers.find(o => o.id === offerId);
      const newFavoriteState = !offer.is_favorite;

      if (newFavoriteState) {
        await axios.post(`${API_URL}/favorites/`, { offer_id: offerId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.delete(`${API_URL}/favorites/${offerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setOffers(prevOffers => 
        prevOffers.map(o => 
          o.id === offerId ? { ...o, is_favorite: newFavoriteState } : o
        )
      );

    } catch (error) {
      console.error('Ошибка при изменении избранного:', error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Ошибка авторизации', 'Пожалуйста, войдите в систему заново');
        navigation.navigate('Login');
      } else {
        Alert.alert('Ошибка', 'Не удалось изменить статус избранного. Попробуйте позже.');
      }
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

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(searchHeight, {
      toValue: isSearchVisible ? 0 : 50,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchOffers();
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, isDarkMode && styles.darkContainer]} 
      edges={['top', 'right', 'left']}
    >
      <View style={[styles.headerContainer, isDarkMode && styles.darkHeaderContainer]}>
        <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              !showFavorites && styles.activeFilter,
              isDarkMode && styles.darkFilterButton,
              !showFavorites && isDarkMode && styles.darkActiveFilter
            ]}
            onPress={() => setShowFavorites(false)}
          >
            <Text style={[
              styles.filterText,
              !showFavorites && styles.activeFilterText,
              isDarkMode && styles.darkFilterText
            ]}>Все</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showFavorites && styles.activeFilter,
              isDarkMode && styles.darkFilterButton,
              showFavorites && isDarkMode && styles.darkActiveFilter
            ]}
            onPress={() => setShowFavorites(true)}
          >
            <Text style={[
              styles.filterText,
              showFavorites && styles.activeFilterText,
              isDarkMode && styles.darkFilterText
            ]}>Избранные</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Filter', { 
            filters, 
            availableFilters, 
            onApplyFilters: applyFilters 
          })}
        >
          <Ionicons name="filter" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>
      <Animated.View style={[
        styles.searchContainer,
        isDarkMode && styles.darkSearchContainer,
        { height: searchHeight }
      ]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder="Поиск объявлений"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmitEditing={fetchOffers}
        />
      </Animated.View>
      {loading ? (
        <ActivityIndicator size="large" color={isDarkMode ? "#FFFFFF" : "#007AFF"} style={styles.loader} />
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
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
    backgroundColor: '#1A1A1A',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  darkHeaderContainer: {
    backgroundColor: '#2A2A2A',
    borderBottomColor: '#444444',
  },
  searchButton: {
    padding: 5,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  darkFilterButton: {
    backgroundColor: '#444444',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  darkActiveFilter: {
    backgroundColor: '#0A84FF',
  },
  filterText: {
    color: '#000000',
    fontWeight: '600',
  },
  darkFilterText: {
    color: '#FFFFFF',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  darkSearchContainer: {
    backgroundColor: '#2A2A2A',
  },
  searchInput: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#000000',
    backgroundColor: '#F5F5F5',
  },
  darkSearchInput: {
    borderColor: '#444444',
    color: '#FFFFFF',
    backgroundColor: '#3A3A3A',
  },
  listContent: {
    padding: 5,
  },
  offerItem: {
    width: '48%',
    margin: '1%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  darkOfferItem: {
    backgroundColor: '#2A2A2A',
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
    marginBottom: 5,
  },
  offerPrice: {
    fontSize: 14,
    color: '#007AFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkText: {
    color: '#FFFFFF',
  },
  searchInput: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  darkSearchInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    borderColor: '#555555',
  },
  listContent: {
    padding: 10,
  },
  offerItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  darkOfferItem: {
    backgroundColor: '#2C2C2C',
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
    marginBottom: 5,
  },
  offerPrice: {
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
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});