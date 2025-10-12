import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, useColorScheme, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text'; // Asegúrate de que esta ruta sea correcta
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig'; // Importa la instancia de auth
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado para controlar el spinner de carga
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true); // Inicia el spinner
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Éxito', '¡Has iniciado sesión correctamente!');
      router.replace('/add-trip'); // Reemplaza la pantalla de login con la de añadir viaje o tu pantalla principal
    } catch (error: any) {
      console.error("Error al iniciar sesión: ", error);
      Alert.alert('Error', `Fallo al iniciar sesión: ${error.message}`);
    } finally {
      setLoading(false); // Detiene el spinner
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
      <ThemedText style={[styles.title, { color: inputTextColor }]} type="title">Iniciar Sesión</ThemedText>

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
        placeholder="Contraseña"
        placeholderTextColor={inputPlaceholderColor}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color={linkTextColor} />
      ) : (
        <Button
          title="Iniciar Sesión"
          onPress={handleLogin}
          color={isDarkMode ? '#bb86fc' : '#007bff'}
        />
      )}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('../register')} // Navega a la pantalla de registro
      >
        <ThemedText style={[styles.linkText, { color: linkTextColor }]}>
          ¿No tienes una cuenta? Regístrate
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
    height: 50, // Ligeramente más altos para mejor toque
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15, // Espacio entre inputs
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