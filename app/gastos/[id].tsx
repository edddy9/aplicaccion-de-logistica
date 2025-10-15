import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "../../firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import MapView, { Marker } from "react-native-maps"; // 👈 Importamos mapas

export default function GastoDetalle() {
  const { id } = useLocalSearchParams();
  const [gasto, setGasto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchGasto = async () => {
      try {
        const docRef = doc(db, "gastos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setGasto({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert("Error", "No se encontró el gasto.");
          router.back();
        }
      } catch (error) {
        console.error("Error al obtener gasto:", error);
        Alert.alert("Error", "No se pudo cargar la información del gasto.");
      } finally {
        setLoading(false);
      }
    };

    fetchGasto();
  }, [id]);

  // 🔹 Eliminar gasto
  const handleDelete = async () => {
    if (!gasto) return;

    Alert.alert(
      "Confirmar eliminación",
      "¿Deseas eliminar este gasto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "gastos", gasto.id));
              Alert.alert("Éxito", "Gasto eliminado correctamente.");
              router.back();
            } catch (error) {
              console.error("Error al eliminar gasto:", error);
              Alert.alert("Error", "No se pudo eliminar el gasto.");
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
        <Text>Cargando gasto...</Text>
      </View>
    );
  }

  if (!gasto) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el gasto.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalle del Gasto</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Categoría:</Text>
        <Text style={styles.value}>{gasto.categoria}</Text>

        <Text style={styles.label}>Monto:</Text>
        <Text style={styles.value}>${gasto.monto?.toFixed(2)}</Text>

        <Text style={styles.label}>Estado:</Text>
        <Text
          style={[
            styles.value,
            gasto.estatus === "aprobado"
              ? styles.aprobado
              : gasto.estatus === "rechazado"
              ? styles.rechazado
              : styles.pendiente,
          ]}
        >
          {gasto.estatus ?? "pendiente"}
        </Text>

        <Text style={styles.label}>Fecha:</Text>
        <Text style={styles.value}>
          {gasto.creadoEn?.toDate?.().toLocaleString("es-MX") ?? "Sin fecha"}
        </Text>
      </View>

      {/* 📍 Mapa de ubicación */}
      {gasto.geo?.lat && gasto.geo?.lng && (
        <View style={styles.mapContainer}>
          <Text style={styles.label}>Ubicación registrada:</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: gasto.geo.lat,
              longitude: gasto.geo.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: gasto.geo.lat,
                longitude: gasto.geo.lng,
              }}
              title={gasto.categoria}
              description={`Monto: $${gasto.monto?.toFixed(2)}`}
            />
          </MapView>
        </View>
      )}

      <View style={styles.buttons}>
        <Button title="Eliminar gasto" color="red" onPress={handleDelete} />
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  label: { fontWeight: "bold", color: "#555", marginTop: 10 },
  value: { fontSize: 16, color: "#333" },
  aprobado: { color: "green" },
  rechazado: { color: "red" },
  pendiente: { color: "orange" },
  mapContainer: { marginVertical: 15 },
  map: { width: "100%", height: 200, borderRadius: 8 },
  buttons: { gap: 10, marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
