import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Button,
  Pressable,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import MapView, { Marker } from "react-native-maps"; // 👈 Importamos mapas

export default function TripDetail() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState<any>(null);
  const [gastos, setGastos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    // 🔹 Obtener detalles del viaje
    const fetchTrip = async () => {
      try {
        const docRef = doc(db, "viajes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setTrip({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        console.error("Error al cargar viaje:", error);
      }
    };

    // 🔹 Escuchar gastos relacionados
    const q = query(collection(db, "gastos"), where("viajeId", "==", String(id)));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGastos(lista);
      setLoading(false);
    });

    fetchTrip();
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando detalles...</Text>
      </View>
    );
  }

  // 📍 Calcular centro del mapa
  const defaultRegion =
    gastos.length > 0
      ? {
          latitude: gastos[0].geo?.lat || 19.4326, // Ciudad de México por defecto
          longitude: gastos[0].geo?.lng || -99.1332,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }
      : {
          latitude: 19.4326,
          longitude: -99.1332,
          latitudeDelta: 5,
          longitudeDelta: 5,
        };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {trip?.origen} → {trip?.destino}
      </Text>
      <Text style={styles.label}>
        Empresa: <Text style={styles.bold}>{trip?.empresa ?? "Sin especificar"}</Text>
      </Text>
      <Text style={styles.label}>
        Fecha: {trip?.creadoEn?.toDate?.().toLocaleString("es-MX") ?? "Sin fecha"}
      </Text>

      {/* 📍 Mapa con todos los gastos */}
      {gastos.length > 0 && (
        <View style={styles.mapContainer}>
          <Text style={styles.subtitle}>Ubicaciones de gastos</Text>
          <MapView style={styles.map} initialRegion={defaultRegion}>
            {gastos.map((gasto) =>
              gasto.geo?.lat && gasto.geo?.lng ? (
                <Marker
                  key={gasto.id}
                  coordinate={{
                    latitude: gasto.geo.lat,
                    longitude: gasto.geo.lng,
                  }}
                  title={gasto.categoria}
                  description={`$${gasto.monto?.toFixed(2)} - ${
                    gasto.creadoEn?.toDate?.().toLocaleDateString("es-MX") ?? ""
                  }`}
                />
              ) : null
            )}
          </MapView>
        </View>
      )}

      {/* Botón para agregar gasto */}
      <View style={{ marginVertical: 10 }}>
        <Button
          title="Agregar Gasto"
          onPress={() => router.push({ pathname: "/gastos/add", params: { viajeId: id } })}
        />
      </View>

      {/* Lista de gastos */}
      <Text style={styles.subtitle}>Gastos registrados</Text>

      {gastos.length === 0 ? (
        <Text style={styles.emptyText}>Aún no hay gastos registrados para este viaje.</Text>
      ) : (
        <FlatList
          data={gastos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/gastos/[id]", params: { id: item.id } })}
              style={styles.gastoCard}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.gastoCat}>{item.categoria}</Text>
                <Text style={styles.gastoMonto}>${item.monto?.toFixed(2)}</Text>
                <Text style={styles.gastoFecha}>
                  {item.creadoEn?.toDate?.().toLocaleString("es-MX") ?? "Sin fecha"}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  label: { color: "#555", marginBottom: 5 },
  bold: { fontWeight: "bold", color: "#333" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "gray", marginTop: 20, textAlign: "center" },
  gastoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  gastoCat: { fontWeight: "bold" },
  gastoMonto: { color: "#007bff" },
  gastoFecha: { fontSize: 12, color: "#777" },
  mapContainer: { marginVertical: 15 },
  map: {
    width: Dimensions.get("window").width - 40,
    height: 250,
    borderRadius: 10,
  },
});
