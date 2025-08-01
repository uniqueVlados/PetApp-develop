import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, Dimensions, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const PopularScreen = () => {
  const { isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const videos = [
    { id: '1', url: 'https://v.ftcdn.net/05/21/50/62/700_F_521506209_gEXA0ykaiHHqormt7CNhghQpx0qZmXOj_ST.mp4', likes: 1234, comments: 56 },
    { id: '2', url: 'https://v.ftcdn.net/05/21/48/22/700_F_521482230_EucyOlDcam8lvShDsQ7J0roSfgmfPzzO_ST.mp4', likes: 5678, comments: 90 },
    // Добавьте больше видео по необходимости
  ];

  const renderItem = useCallback(({ item, index }) => {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: item.url }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={index === currentIndex}
          isLooping
          style={styles.video}
        />
      </View>
    );
  }, [currentIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        vertical
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  videoContainer: {
    width: width,
    height: height,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  iconButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: 'white',
    marginTop: 5,
  },
});

export default PopularScreen;