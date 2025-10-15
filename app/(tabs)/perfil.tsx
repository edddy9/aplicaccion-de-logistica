// app/(tabs)/perfil.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { auth, db } from "../../firebaseConfig";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function PerfilScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("");
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
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
      Alert.alert(
        "📧 Correo enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña."
      );
    } catch (error) {
      console.error("Error al enviar correo:", error);
      Alert.alert("Error", "No se pudo enviar el correo de recuperación.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
