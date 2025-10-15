import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Button,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function TripsList() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "viajes"), where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const viajes = [];

          for (const docSnap of snapshot.docs) {
            const viaje = { id: docSnap.id, ...docSnap.data() };

            // 🔹 Calcular total de gastos
            const gastosQuery = query(
              collection(db, "gastos"),
              where("viajeId", "==", docSnap.id)
            );
            const gastosSnapshot = await getDocs(gastosQuery);
            const total = gastosSnapshot.docs.reduce(
              (sum, g) => sum + (g.data().monto || 0),
              0
            );

            viajes.push({ ...viaje, total });
          }

          setTrips(viajes);
          setLoading(false);
        });

        return () => unsubscribe();
      } else {
        setTrips([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 🔹 Cerrar sesión
 

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando viajes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔹 Encabezado superior con Logout */}
      <View style={styles.header}>
        
        
      </View>

      {trips.length === 0 ? (
        <Text style={styles.emptyText}>No tienes viajes registrados.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.tripCard}
              onPress={() =>
                router.push({ pathname: "/trips/[id]", params: { id: item.id } })
              }
            >
              <Text style={styles.tripTitle}>
                {item.origen} → {item.destino}
              </Text>
              <Text style={styles.tripLabel}>Empresa: {item.empresa ?? "N/A"}</Text>
              <Text style={styles.tripLabel}>
                Fecha:{" "}
                {item.creadoEn?.toDate?.().toLocaleDateString("es-MX") ?? "Sin fecha"}
              </Text>
              <Text style={styles.tripTotal}>
                💰 Total: ${item.total?.toFixed(2) ?? "0.00"}
              </Text>
            </Pressable>
          )}
        />
      )}

      {/* 🔹 Botón para agregar viaje */}
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logoutText: {
    color: "#d9534f",
    fontWeight: "bold",
    fontSize: 14,
  },

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
