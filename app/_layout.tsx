// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View
} from "react-native";
import SplashScreen from "../components/SplashScreen"; // 👈 Pantalla de bienvenida
import { auth } from "../firebaseConfig";
import usePermissions from "../hooks/usePermissions";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const hasPermission = usePermissions(); // 📍 Permiso de ubicación

  // 🔐 Control de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        // Si hay usuario logueado → entrar al tabs
        if (currentUser) {
          if (isAuthRoute()) router.replace("/(tabs)");
        } else {
          // Si no hay sesión → redirigir a login
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

  // ✅ Detecta si es ruta pública (login o registro)
  const isAuthRoute = () => {
    const route = segments[0];
    return route === "login" || route === "register";
  };

  // 🌀 Mostrar pantalla de bienvenida mientras carga sesión o permisos
  if (loading || !hasPermission) {
    return <SplashScreen />;
  }

  // ⚠️ Pantalla de error
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

  // ✅ Stack principal (rutas)
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007bff" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      {/* 🟢 Rutas públicas */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />

      {/* 🔵 Rutas privadas */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="trips" options={{ headerShown: false }} />
      <Stack.Screen name="gastos" options={{ headerShown: false }} />

      {/* 🟣 Modales */}
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
