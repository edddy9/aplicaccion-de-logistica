import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function AddTripScreen() {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Inicialmente 'true'
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    console.log("useEffect: Suscribiendo al estado de autenticación...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("useEffect: Estado de autenticación cambiado. currentUser:", currentUser?.uid);
      setUser(currentUser);
      setLoading(false); // Una vez que se resuelve el estado de autenticación, loading debe ser false
      console.log("useEffect: loading establecido a false.");
    });
    return () => {
      unsubscribe();
      console.log("useEffect: Desuscribiendo del estado de autenticación.");
    };
  }, []);

  const handleSaveTrip = async () => {
    console.log("handleSaveTrip: Botón Guardar Viaje presionado.");
    console.log("handleSaveTrip: Estado actual del usuario:", user?.uid);
    console.log("handleSaveTrip: Valor de 'name':", name);
    console.log("handleSaveTrip: Valor de 'destination':", destination);

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para agregar un viaje.');
      console.log("handleSaveTrip: Error - Usuario no autenticado.");
      return;
    }

    if (name === '' || destination === '') {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      console.log("handleSaveTrip: Error - Campos incompletos.");
      return;
    }

    try {
      const tripsCollection = collection(db, 'viajes');
      console.log("handleSaveTrip: Intentando guardar en Firestore...");
      console.log("handleSaveTrip: DB conectado:", db); // Solo para verificar si db no es null/undefined

      await addDoc(tripsCollection, {
        name,
        destination,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });

      Alert.alert('Éxito', 'Viaje guardado correctamente.');
      console.log("handleSaveTrip: Viaje guardado con éxito. Navegando hacia atrás.");
      router.back();
    } catch (error: any) { // Usar 'any' para el tipo de error si no sabes la estructura exacta
      console.error("handleSaveTrip: Error al guardar el viaje: ", error);
      Alert.alert('Error', `No se pudo guardar el viaje: ${error.message || 'Error desconocido'}`); // Mensaje de error más específico
    }
  };

  const isDarkMode = colorScheme === 'dark';
  const containerBackgroundColor = isDarkMode ? '#1a1a1aff' : '#fcfcfcff';
  const inputBorderColor = isDarkMode ? '#666666' : 'gray';
  const inputTextColor = isDarkMode ? '#ffffff' : '#000000';
  const inputPlaceholderColor = isDarkMode ? '#aaaaaa' : 'gray';

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ThemedText
        style={[styles.title, { color: inputTextColor }]}
        type="title">Agregar Nuevo Viaje</ThemedText>

      <TextInput
        style={[styles.input, { borderColor: inputBorderColor, color: inputTextColor }]}
        placeholder="Nombre del viaje (ej. Entrega a Cliente)"
        placeholderTextColor={inputPlaceholderColor}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, { borderColor: inputBorderColor, color: inputTextColor }]}
        placeholder="Destino (ej. Monterrey, NL)"
        placeholderTextColor={inputPlaceholderColor}
        value={destination}
        onChangeText={setDestination}
      />

      <Button
        title={loading ? "Cargando..." : "Guardar Viaje"}
        onPress={handleSaveTrip}
        disabled={loading} // Deshabilitar el botón mientras se carga el estado de autenticación
        color={isDarkMode ? '#bb86fc' : '#007bff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Cambiado de 6 a 1 para que ocupe todo el espacio vertical disponible
    padding: 17,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});