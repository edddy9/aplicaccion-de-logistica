import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, useColorScheme, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleRegister = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Por favor, ingresa un correo y una contraseña.');
      return;
    }
    if (password.length < 6) { // Firebase requiere un mínimo de 6 caracteres para la contraseña
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Éxito', '¡Cuenta creada correctamente! Por favor, inicia sesión.');
      router.replace('/login'); // Después del registro, redirige al usuario a la pantalla de login
    } catch (error: any) {
      console.error("Error al registrar usuario: ", error);
      Alert.alert('Error', `Fallo al registrar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isDarkMode = colorScheme === 'dark';
  const containerBackgroundColor = isDarkMode ? '#1a1a1aff' : '#fcfcfcff';
  const inputBorderColor = isDarkMode ? '#666666' : 'gray';
  const inputTextColor = isDarkMode ? '#ffffff' : '#000000';
  const inputPlaceholderColor = isDarkMode ? '#aaaaaa' : 'gray';
  const linkTextColor = isDarkMode ? '#bb86fc' : '#007bff';

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ThemedText style={[styles.title, { color: inputTextColor }]} type="title">Registrarse</ThemedText>

      <TextInput
        style={[styles.input, { borderColor: inputBorderColor, color: inputTextColor }]}
        placeholder="Correo Electrónico"
        placeholderTextColor={inputPlaceholderColor}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, { borderColor: inputBorderColor, color: inputTextColor }]}
        placeholder="Contraseña (mínimo 6 caracteres)"
        placeholderTextColor={inputPlaceholderColor}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color={linkTextColor} />
      ) : (
        <Button
          title="Crear Cuenta"
          onPress={handleRegister}
          color={isDarkMode ? '#bb86fc' : '#007bff'}
        />
      )}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.replace('/login')} // Vuelve a la pantalla de login
      >
        <ThemedText style={[styles.linkText, { color: linkTextColor }]}>
          ¿Ya tienes una cuenta? Inicia Sesión
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
  },
});