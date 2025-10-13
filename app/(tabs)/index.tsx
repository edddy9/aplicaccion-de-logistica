import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Button, Text, Pressable, ActivityIndicator, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export default function HomeScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Estado para mostrar carga inicial
  const router = useRouter();

  useEffect(() => {
    // Escucha cambios en la autenticación del usuario
    const authSubscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si el usuario está autenticado, busca sus viajes
        const tripsCollection = collection(db, 'viajes');
        const q = query(
          tripsCollection,
          where("userId", "==", user.uid), // Filtra solo los viajes del usuario actual
          orderBy('creadoEn', 'desc')      // CORRECCIÓN: Usa 'creadoEn' como en tu macro
        );

        // Escucha cambios en la base de datos en tiempo real
        const dbSubscriber = onSnapshot(q, (snapshot) => {
          const tripsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTrips(tripsList);
          setLoading(false); // Deja de cargar cuando se reciben los datos
        }, (error) => {
            console.error("Error al obtener viajes:", error); // Manejo de errores de Firestore
            setLoading(false);
        });
        
        // Retorna la función para dejar de escuchar cuando el componente se desmonte
        return () => dbSubscriber();
      } else {
        // Si no hay usuario, limpia la lista y redirige al login
        setTrips([]);
        setLoading(false);
        router.replace("/login");
      }
    });

    // Retorna la función para dejar de escuchar los cambios de autenticación
    return () => authSubscriber();
  }, [router]); // Se añade router a las dependencias

  if (loading) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text>Cargando viajes...</Text>
        </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Mis Viajes</ThemedText>
      
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // CORRECCIÓN: Pasa el ID del viaje correctamente en los parámetros
          <Link href={{ pathname: '/trips/[id]', params: { id: item.id } }} asChild>
            <Pressable>
              <ThemedView style={styles.tripItem}>
                {/* CORRECCIÓN: Usa los nombres de campo que guardas en Firebase */}
                <ThemedText style={styles.tripText}>{item.origen} → {item.destino}</ThemedText>
                <ThemedText>Conductor: {item.conductor}</ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no has registrado viajes.</Text>}
        style={styles.list}
      />

      {/* CORRECCIÓN: Usa ruta relativa para evitar conflictos de navegación */}
      <Button title="Agregar Viaje" onPress={() => router.push('/add-trip')} />
    </ThemedView>
  );
}

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
