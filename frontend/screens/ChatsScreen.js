import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Image
} from 'react-native';
import { API_URL } from '../config';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const { isDarkMode } = useTheme();

  const fetchChats = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error.response?.data || error.message);
      Alert.alert('Ошибка', 'Не удалось загрузить список чатов');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.chatItem, isDarkMode && styles.darkChatItem]}
      onPress={() => navigation.navigate('Chat', { chatId: item.id, recipientId: item.user2_id })}
    >
      <Image 
        source={{ uri: item.offer.image_url }} 
        style={styles.offerImage}
      />
      <View style={styles.chatInfo}>
        <Text style={[styles.chatTitle, isDarkMode && styles.darkText]}>
          {item.offer.title}
        </Text>
        <Text style={[styles.chatPreview, isDarkMode && styles.darkText]}>
          Нажмите, чтобы открыть чат
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateText, isDarkMode && styles.darkText]}>
            У вас пока нет активных чатов
          </Text>
        </View>
      )}
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
  chatList: {
    padding: 10,
  },
  chatItem: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  darkChatItem: {
    backgroundColor: '#2C2C2E',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  chatPreview: {
    fontSize: 14,
    color: '#666',
  },
  darkText: {
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkChatItem: {
    borderBottomColor: '#333',
  },
  offerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatPreview: {
    fontSize: 14,
    color: '#666',
  },
});