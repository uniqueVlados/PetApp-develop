import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function CreateModal({ visible, onClose, onCreateNew, onMyOffers }) {
  const { isDarkMode } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, isDarkMode && styles.darkModalView]}>
          <TouchableOpacity
            style={[styles.button, isDarkMode && styles.darkButton]}
            onPress={onMyOffers}
          >
            <Text style={[styles.textStyle, isDarkMode && styles.darkTextStyle]}>Мои объявления</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isDarkMode && styles.darkButton]}
            onPress={onCreateNew}
          >
            <Text style={[styles.textStyle, isDarkMode && styles.darkTextStyle]}>Создать</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose, isDarkMode && styles.darkButtonClose]}
            onPress={onClose}
          >
            <Text style={[styles.textStyle, isDarkMode && styles.darkTextStyle]}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  darkModalView: {
    backgroundColor: "#333",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
    marginBottom: 15,
    minWidth: 200,
  },
  darkButton: {
    backgroundColor: "#3a86ff",
  },
  buttonClose: {
    backgroundColor: "#FF6B6B",
  },
  darkButtonClose: {
    backgroundColor: "#d90429",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  darkTextStyle: {
    color: "#f1faee",
  },
});