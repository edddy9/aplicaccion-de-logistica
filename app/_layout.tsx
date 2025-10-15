// app/_layout.tsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, Button, StyleSheet, AppState } from "react-native";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Stack, useRouter, useSegments } from "expo-router";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // 🔒 Cerrar sesión automáticamente al salir o minimizar la app
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        try {
          await signOut(auth);
          console.log("🔒 Sesión cerrada automáticamente por seguridad");
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  // 🔐 Control de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        // Si hay usuario autenticado
        if (currentUser) {
          // Si está en login o register → redirige al tabs principal
          if (isAuthRoute()) router.replace("/(tabs)");
        } else {
          // Si no hay usuario y no está en login/register → redirige al login
          if (!isAuthRoute()) router.replace("/login");
        }
      },
      (err) => {
        console.error("Error verificando usuario:", err);
        setError(err.message);
        setLoading(false);
        if (!isAuthRoute()) router.replace("/login");
      }
    );

    return () => unsubscribe();
  }, [segments]);

  // Verifica si es login o registro
  const isAuthRoute = () => {
    const route = segments[0];
    return route === "login" || route === "register";
  };

  // 🌀 Pantalla de carga
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Verificando sesión...</Text>
      </View>
    );
  }

  // ⚠️ Pantalla de error si falla autenticación
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", marginBottom: 10 }}>Error: {error}</Text>
        <Button
          title="Reintentar"
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        />
      </View>
    );
  }

  // ✅ Stack principal
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007bff" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      {/* Rutas públicas */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />

      {/* Rutas privadas */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="trips" options={{ headerShown: false }} />
      <Stack.Screen name="gastos" options={{ headerShown: false }} /> 
     
      
    
      {/* Fuera del tabs */}
      <Stack.Screen
        name="add-trip"
        options={{ title: "Agregar viaje", presentation: "modal" }}
      />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
