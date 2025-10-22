import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";

export default function TripsList() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeTrips: (() => void) | null = null;
    let active = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTrips([]);
        setLoading(false);
        return;
      }

      const q = query(collection(db, "viajes"), where("userId", "==", user.uid));

      unsubscribeTrips = onSnapshot(q, async (snapshot) => {
        if (!active) return;
        const viajes: any[] = [];

        for (const docSnap of snapshot.docs) {
          const viaje = { id: docSnap.id, total: 0, ...docSnap.data() }; // 🔹 total por defecto

          try {
            // 🔹 Calcular total de gastos
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
      });
    });

    return () => {
      active = false;
      if (unsubscribeTrips) unsubscribeTrips();
      unsubscribeAuth();
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
                {item.creadoEn?.toDate?.().toLocaleDateString("es-MX") ??
                  "Sin fecha"}
              </Text>

              {/* ✅ Corrección segura para el total */}
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
  tripTotal: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#28a745",
  },
  addContainer: {
    marginTop: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
