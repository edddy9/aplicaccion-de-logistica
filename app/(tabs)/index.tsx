import React, { useState, useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, FlatList, Button, Text, Pressable } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { db, auth } from '../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
// --- 1. IMPORTAR 'query' y 'where' ---
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export default function HomeScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const router = useRouter();

 useEffect(() => {
  const authSubscriber = onAuthStateChanged(auth, (user) => {
    if (user) {
      const tripsCollection = collection(db, 'viajes');

      // Consulta SIN filtro por usuario
      const q = query(
        tripsCollection,
        orderBy('createdAt', 'desc')
      );

      const dbSubscriber = onSnapshot(q, (snapshot) => {
        const tripsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Todos los viajes:", tripsList);
        setTrips(tripsList);
      });

      return dbSubscriber;
    } else {
      setTrips([]);
    }
  });

  return authSubscriber;
}, []);



  return (
    <ThemedView style={styles.container}>
      {/* ... El resto del código se queda igual ... */}
      <ThemedText type="title">Mis Viajes</ThemedText>
      
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/trips/${item.id}`} asChild>
            <Pressable>
              <ThemedView style={styles.tripItem}>
                <ThemedText style={styles.tripText}>{item.name}</ThemedText>
                <ThemedText>Destino: {item.destination}</ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no has registrado viajes.</Text>}
        style={styles.list}
      />

      <Button title="Agregar Viaje" onPress={() => router.push('/add-trip')} />
    </ThemedView>
  );
}

// ... Estilos sin cambios ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    marginTop: 16,
  },
  tripItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff', // Añadido para que Pressable funcione bien visualmente
  },
  tripText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});