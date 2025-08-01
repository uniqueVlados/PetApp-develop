
import React from 'react';
import { StatusBar, View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthScreen from './screens/AuthScreen';
import OffersScreen from './screens/OffersScreen';
import CreateOfferScreen from './screens/CreateOfferScreen';
import ChatsScreen from './screens/ChatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import OfferDetailsScreen from './screens/OfferDetailsScreen';
import ChatScreen from './screens/ChatScreen';
import MyOffersScreen from './screens/MyOffersScreen';
import PopularScreen from './screens/PopularScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Offers') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Popular') iconName = focused ? 'star' : 'star-outline';
          else if (route.name === 'MyOffers') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Chats') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { 
          backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        },
        tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: '#888888',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Offers" component={OffersScreen} options={{ title: 'Предложения' }} />
      <Tab.Screen name="Popular" component={PopularScreen} options={{ title: 'Популярное' }} />
      <Tab.Screen name="MyOffers" component={MyOffersScreen} options={{ title: 'Мои объявления' }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: 'Сообщения' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isDarkMode } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Профиль пользователя' }} />
        <Stack.Screen 
          name="CreateOffer" 
          component={CreateOfferScreen}
          options={({ navigation }) => ({
            presentation: 'modal',
            headerShown: true,
            title: 'Создать предложение',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ color: isDarkMode ? '#FFFFFF' : '#007AFF', marginLeft: 10 }}>Вернуться</Text>
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            },
            headerTintColor: isDarkMode ? '#FFFFFF' : '#000000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        />
      </Stack.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}