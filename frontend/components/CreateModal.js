import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const CreateModal = ({ visible, onClose, onMyOffers, onCreateOffer }) => {
  const { isDarkMode } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalView, isDarkMode && styles.darkModalView]}>
          <TouchableOpacity style={styles.option} onPress={onMyOffers}>
            <Ionicons name="list" size={24} color={isDarkMode ? '#FFFFFF' : '#007AFF'} />
            <Text style={[styles.optionText, isDarkMode && styles.darkText]}>Мои предложения</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onCreateOffer}>
            <Ionicons name="add-circle" size={24} color={isDarkMode ? '#FFFFFF' : '#007AFF'} />
            <Text style={[styles.optionText, isDarkMode && styles.darkText]}>Создать предложение</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  darkModalView: {
    backgroundColor: '#333',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 10,
  },
  darkText: {
    color: '#fff',
  },
});

export default CreateModal;