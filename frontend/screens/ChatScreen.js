
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  SafeAreaView,
  Alert,
  Image,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { API_URL } from '../config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ route, navigation }) {
  const { chatId, recipientId, offerTitle } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const { isDarkMode } = useTheme();
  const [userId, setUserId] = useState(null);
  const [offerName, setOfferName] = useState(offerTitle || 'Загрузка...');

  useEffect(() => {
    const setup = async () => {
      if (!chatId) {
        Alert.alert('Ошибка', 'Не удалось загрузить чат');
        navigation.goBack();
        return;
      }
      await Promise.all([fetchMessages(), fetchRecipient(), getUserId(), fetchOfferDetails()]);
    };
    setup();
  }, [chatId, recipientId]);

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setUserId(parseInt(id));
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
  };

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
    }
  };

  const fetchRecipient = useCallback(async () => {
    if (!recipientId) {
      setRecipient({ name: 'Пользователь', avatar: null });
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipient(response.data);
    } catch (error) {
      console.error('Error fetching recipient:', error);
      setRecipient({ name: 'Пользователь', avatar: null });
    }
  }, [recipientId]);

  const fetchOfferDetails = async () => {
    if (!chatId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOfferName(response.data.offer.title);
      const currentUserId = await AsyncStorage.getItem('userId');
      const recipientUser = response.data.user1.id.toString() === currentUserId ? response.data.user2 : response.data.user1;
      setRecipient({
        id: recipientUser.id,
        name: recipientUser.name || 'Пользователь',
        avatar: recipientUser.avatar
      });
    } catch (error) {
      console.error('Error fetching offer details:', error);
      setOfferName('Объявление');
      setRecipient({ name: 'Пользователь', avatar: null });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, 
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prevMessages => [response.data, ...prevMessages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender_id === userId ? styles.sentMessage : styles.receivedMessage,
      isDarkMode && styles.darkMessageContainer
    ]}>
      <Text style={[styles.messageText, isDarkMode && styles.darkText]}>{item.content}</Text>
      <Text style={[styles.timestamp, isDarkMode && styles.darkTimestamp]}>
        {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </Text>
    </View>
  );

  const goToUserProfile = useCallback(() => {
    if (recipient && recipient.id) {
      navigation.navigate('UserProfile', { userId: recipient.id });
    }
  }, [recipient, navigation]);

  const recipientHeader = useMemo(() => (
    <TouchableOpacity style={styles.recipientHeader} onPress={goToUserProfile}>
      <Image 
        source={recipient?.avatar ? { uri: recipient.avatar } : require('../assets/default-avatar.png')} 
        style={styles.recipientAvatar} 
      />
      <View style={styles.recipientInfo}>
        <Text style={[styles.recipientName, isDarkMode && styles.darkText]}>
          {recipient?.name || 'Загрузка...'}
        </Text>
        <Text style={[styles.offerTitle, isDarkMode && styles.darkText]} numberOfLines={1}>
          {offerName}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={isDarkMode ? "#FFFFFF" : "#000000"} />
    </TouchableOpacity>
  ), [recipient, offerName, isDarkMode, goToUserProfile]);

  const handleExit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        {recipientHeader}
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          inverted
          contentContainerStyle={styles.messageList}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Введите сообщение..."
            placeholderTextColor={isDarkMode ? "#666" : "#999"}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  offerTitle: {
    fontSize: 14,
    color: '#666',
  },
  exitButton: {
    padding: 5,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  darkMessageContainer: {
    backgroundColor: '#2C2C2E',
  },
  messageText: {
    color: '#FFFFFF',
  },
  darkText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  darkTimestamp: {
    color: '#8E8E93',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  darkInput: {
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});