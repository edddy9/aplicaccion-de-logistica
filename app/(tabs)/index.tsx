import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { app, auth } from "../../firebaseConfig";

// 🧩 Firestore con caché local persistente
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export default function TripsList() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeTrips: (() => void) | null = null;
    let active = true;

    // 🔹 Detectar conexión
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    // 🔹 Autenticación
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTrips([]);
        setLoading(false);
        return;
      }

      const q = query(collection(db, "viajes"), where("userId", "==", user.uid));

      // 🔹 Escuchar viajes (modo offline incluido)
      unsubscribeTrips = onSnapshot(
        q,
        async (snapshot) => {
          if (!active) return;
          const viajes: any[] = [];

          for (const docSnap of snapshot.docs) {
            const viaje = { id: docSnap.id, total: 0, ...docSnap.data() };

            try {
              const gastosSnapshot = await getDocs(
                query(collection(db, "gastos"), where("viajeId", "==", docSnap.id))
              );
              const total = gastosSnapshot.docs.reduce(
                (sum, g) => sum + (g.data().monto || 0),
                0
              );
              viaje.total = total;
            } catch (error) {
              console.warn("Error al calcular total:", error);
            }

            viajes.push(viaje);
          }

          setTrips(viajes);
          setLoading(false);

          // 💾 Guardar copia local
          await AsyncStorage.setItem("viajes_cache", JSON.stringify(viajes));
        },
        async (error) => {
          console.warn("⚠️ Sin conexión. Cargando viajes locales...");
          const cached = await AsyncStorage.getItem("viajes_cache");
          if (cached) setTrips(JSON.parse(cached));
          setLoading(false);
        }
      );
    });

    return () => {
      active = false;
      if (unsubscribeTrips) unsubscribeTrips();
      unsubscribeAuth();
      unsubscribeNet();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando viajes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isConnected && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 5 }}>
          ⚠️ Estás sin conexión. Mostrando datos guardados.
        </Text>
      )}

      {trips.length === 0 ? (
        <Text style={styles.emptyText}>No tienes viajes registrados.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.tripCard}
              onPress={() => router.push(`/trips/${item.id}`)}
            >
              <Text style={styles.tripTitle}>
                {item.origen} → {item.destino}
              </Text>
              <Text style={styles.tripLabel}>
                Empresa: {item.empresa ?? "N/A"}
              </Text>
              <Text style={styles.tripLabel}>
                Fecha:{" "}
                {item.creadoEn?.toDate?.().toLocaleDateString("es-MX") ?? "Sin fecha"}
              </Text>
              <Text style={styles.tripTotal}>
                💰 Total: ${Number(item.total || 0).toFixed(2)}
              </Text>
            </Pressable>
          )}
        />
      )}

      <View style={styles.addContainer}>
        <Button
          title="Agregar viaje"
          onPress={() => router.push("/add-trip")}
          color="#007bff"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginTop: 30,
    fontSize: 16,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  tripTitle: { fontSize: 18, fontWeight: "bold", color: "#007bff" },
  tripLabel: { color: "#555", marginTop: 3 },
  tripTotal: { marginTop: 8, fontWeight: "bold", color: "#28a745" },
  addContainer: { marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
