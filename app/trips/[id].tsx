import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // No necesitas 'auth' aquí

export default function TripDetail() {
  const { id } = useLocalSearchParams(); // Obtiene el ID de la URL
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof id !== "string") {
      Alert.alert("Error", "ID de viaje no válido.");
      router.back();
      return;
    }

    const fetchTrip = async () => {
      try {
        // CORRECCIÓN: La colección se llama 'viajes', no 'trips'
        const docRef = doc(db, "viajes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrip({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert("Error", "No se encontró el viaje.");
          router.back();
        }
      } catch (error) {
        console.error("Error al obtener el viaje:", error);
        Alert.alert("Error", "No se pudo obtener la información del viaje.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleDelete = () => {
    if (!trip) return;

    // Confirmación antes de eliminar
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este viaje?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // CORRECCIÓN: La colección es 'viajes'
              await deleteDoc(doc(db, "viajes", trip.id));
              Alert.alert("Éxito", "Viaje eliminado correctamente.");
              router.back();
            } catch (error) {
              console.error("Error al eliminar viaje:", error);
              Alert.alert("Error", "No se pudo eliminar el viaje.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando viaje...</Text>
      </View>
    );
  }

  if (!trip) {
    // Este estado se maneja en el useEffect, pero es una buena práctica mantenerlo
    return (
      <View style={styles.center}>
        <Text>No se encontró el viaje.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CORRECCIÓN: Usa los nombres de campo correctos de tu base de datos */}
      <Text style={styles.title}>{trip.origen} → {trip.destino}</Text>
      <Text style={styles.label}>Conductor: {trip.conductor}</Text>
      <Text style={styles.label}>
        {/* CORRECCIÓN: Usa 'creadoEn' en lugar de 'createdAt' */}
        Creado: {trip.creadoEn?.toDate?.().toLocaleString('es-MX') ?? "Fecha no disponible"}
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Eliminar viaje" color="red" onPress={handleDelete} />
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    </View>
  );
}

// Estilos mejorados para la presentación
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'column',
    gap: 10, // Espacio entre botones
  },
});