// styles/globalStyles.js
import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2E7D32',      // Темно-зеленый
  primaryLight: '#4CAF50', // Зеленый
  primaryDark: '#1B5E20',  // Очень темно-зеленый
  secondary: '#1565C0',    // Синий
  secondaryLight: '#2196F3', // Голубой
  secondaryDark: '#0D47A1', // Темно-синий
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const SIZES = {
  padding: 20,
  margin: 20,
  borderRadius: 12,
  fontSize: 16,
  fontSizeSmall: 14,
  fontSizeLarge: 18,
  fontSizeXLarge: 24,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.margin,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  text: {
    fontSize: SIZES.fontSize,
    color: COLORS.text,
  },
  textSecondary: {
    fontSize: SIZES.fontSize,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.margin / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.margin / 2,
  },
  buttonText: {
    color: 'white',
    fontSize: SIZES.fontSize,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding / 2,
    marginBottom: SIZES.margin / 2,
    backgroundColor: COLORS.cardBackground,
    fontSize: SIZES.fontSize,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSizeSmall,
    marginBottom: SIZES.margin / 2,
    fontWeight: '500',
  },
  successText: {
    color: COLORS.success,
    fontSize: SIZES.fontSizeSmall,
    marginBottom: SIZES.margin / 2,
  },
});