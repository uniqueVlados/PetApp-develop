import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function MyOffersScreen({ navigation }) {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useTheme();

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/offers/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(response.data);
      filterOffers(response.data, activeFilter, searchQuery);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [fetchOffers])
  );

  const filterOffers = (offersToFilter, filter, query) => {
    let result = offersToFilter.filter(offer => {
      if (filter === 'active') return offer.is_active;
      if (filter === 'inactive') return !offer.is_active;
      return true;
    });

    if (query) {
      result = result.filter(offer =>
        offer.title.toLowerCase().includes(query.toLowerCase()) ||
        offer.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredOffers(result);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterOffers(offers, activeFilter, text);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterOffers(offers, filter, searchQuery);
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
        style={styles.editButton} 
        onPress={() => navigation.navigate('EditOffer', { offerId: item.id })}
      >
        <Ionicons 
          name="create-outline"
          size={24} 
          color={isDarkMode ? '#FFFFFF' : '#000000'} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkContainer]} edges={['top', 'right', 'left']}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder="Поиск объявлений"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'active' && styles.activeFilter,
            isDarkMode && styles.darkFilterButton,
            activeFilter === 'active' && isDarkMode && styles.darkActiveFilter
          ]}
          onPress={() => handleFilterChange('active')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'active' && styles.activeFilterText,
            isDarkMode && styles.darkFilterText,
            activeFilter === 'active' && isDarkMode && styles.darkActiveFilterText
          ]}>
            Активные
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'inactive' && styles.activeFilter,
            isDarkMode && styles.darkFilterButton,
            activeFilter === 'inactive' && isDarkMode && styles.darkActiveFilter
          ]}
          onPress={() => handleFilterChange('inactive')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'inactive' && styles.activeFilterText,
            isDarkMode && styles.darkFilterText,
            activeFilter === 'inactive' && isDarkMode && styles.darkActiveFilterText
          ]}>
            Неактивные
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={isDarkMode ? "#FFFFFF" : "#007AFF"} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredOffers}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
        />
      )}
      <TouchableOpacity 
        style={[styles.addButton, isDarkMode && styles.darkAddButton]}
        onPress={() => navigation.navigate('CreateOffer')}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  darkFilterButton: {
    backgroundColor: '#333333',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  darkActiveFilter: {
    backgroundColor: '#0A84FF',
  },
  filterText: {
    color: '#333333',
  },
  darkFilterText: {
    color: '#FFFFFF',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  darkActiveFilterText: {
    color: '#FFFFFF',
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
  editButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  darkAddButton: {
    backgroundColor: '#0A84FF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    searchContainer: {
    padding: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 20,
    fontSize: 16,
  },
  darkSearchInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
  },
});