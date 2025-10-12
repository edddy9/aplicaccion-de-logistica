import React from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TripDetailScreen() {
  // Obtenemos los parámetros de la URL, en este caso el 'id'
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Detalles del Viaje</ThemedText>
      <ThemedText style={styles.idText}>
        Mostrando información para el viaje con ID: {id}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  idText: {
    marginTop: 16,
    fontSize: 16,
  }
});