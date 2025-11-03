// app/(tabs)/perfil.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  initializeFirestore,
  persistentLocalCache,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from "react-native";
import { app, auth } from "../../firebaseConfig";

// 🧩 Firestore con caché persistente
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export default function PerfilScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(auth.currentUser);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("");
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // 🔹 Detectar conexión
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    // 🔹 Detectar usuario activo
    const unsubscribeAuth = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });

    return () => {
      unsubscribeNet();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "usuarios"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setNombre(data.nombre || "");
          setApellido(data.apellido || "");
          setTelefono(data.telefono || "");
          setRol(data.rol || "Transportista");

          // 💾 Guardar copia local
          await AsyncStorage.setItem("perfil_cache", JSON.stringify(data));
        }
      } catch (error) {
        console.warn("⚠️ No se pudo cargar desde Firestore. Cargando copia local...");
        const cached = await AsyncStorage.getItem("perfil_cache");
        if (cached) {
          const data = JSON.parse(cached);
          setNombre(data.nombre || "");
          setApellido(data.apellido || "");
          setTelefono(data.telefono || "");
          setRol(data.rol || "Transportista");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("📧 Correo enviado", "Revisa tu bandeja de entrada para restablecer tu contraseña.");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el correo de recuperación.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isConnected && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          ⚠️ Sin conexión — mostrando datos almacenados localmente.
        </Text>
      )}

      <Text style={styles.title}>👤 Mi Perfil</Text>

      {user ? (
        <>
          <Text style={styles.label}>Nombre completo:</Text>
          <Text style={styles.value}>{`${nombre} ${apellido}`}</Text>

          <Text style={styles.label}>Correo:</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{telefono}</Text>

          <Text style={styles.label}>Rol:</Text>
          <Text style={styles.value}>{rol}</Text>

          <View style={{ marginTop: 25 }}>
            <Button title="Cambiar contraseña" color="#17a2b8" onPress={handleResetPassword} />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button title="Cerrar sesión" color="#d9534f" onPress={handleLogout} />
          </View>
        </>
      ) : (
        <Text>No hay usuario activo.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9f9f9" },
  title: { fontSize: 26, fontWeight: "bold", color: "#007bff", marginBottom: 30 },
  label: { fontSize: 18, fontWeight: "600", color: "#555", marginTop: 10 },
  value: { fontSize: 16, color: "#333" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
