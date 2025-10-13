// app/_layout.tsx (Este es tu RootLayout)
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, Button, StyleSheet } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Stack, useRouter, Slot, useSegments } from "expo-router"; // Asegúrate de importar useSegments

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments(); // Nuevo hook para obtener los segmentos de la URL

  // Función auxiliar para verificar si la ruta actual es pública (login, register)
  const isAuthRoute = () => {
    // Los segmentos serán ['login'] o ['register'] si estás en esas rutas.
    // O pueden ser más complejos, por eso verificamos si el primer segmento es 'login' o 'register'
    return segments[0] === 'login' || segments[0] === 'register';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        // Control de redirección basado en la autenticación
        const protectedRoutes = ['add-trip', 'trips/[id]']; // rutas que requieren usuario autenticado

if (currentUser) {
  // Solo redirigir al index si estamos en la raíz o en una ruta pública
  if (!protectedRoutes.includes(segments[0]) && segments[0] !== '(tabs)') {
    router.replace("/"); 
  }

        } else {
          // Si NO hay usuario autenticado
          // Y la ruta actual NO es una ruta de autenticación (login o register)
          if (!isAuthRoute()) {
            router.replace("/login"); // Redirige al login
          }
        }
      },
      (err) => {
        console.error("Error verificando usuario:", err);
        setError(err.message);
        setLoading(false);
        if (!isAuthRoute()) { // Si el error ocurre y no estamos en una ruta auth, ir al login
          router.replace("/login");
        }
      }
    );

    return () => unsubscribe();
  }, [user, segments]); // Dependencias: user para cambios de auth, segments para cambios de ruta


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Verificando sesión...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", marginBottom: 10 }}>Error: {error}</Text>
        <Button title="Reintentar" onPress={() => {
          setLoading(true);
          setError(null);
        }} />
      </View>
    );
  }

  return (
    <Stack>
      {/* Oculta el header para el grupo de tabs si lo tienes definido en su propio _layout */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Define tus pantallas de autenticación */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      {/* Añade otras pantallas que estén directamente en 'app/' si las hay,
          como 'add-trip' o 'modal', y configura sus opciones de header */}
      <Stack.Screen name="add-trip" options={{ presentation: 'modal', headerShown: false }} /> {/* Agregué headerShown: false */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} /> {/* Agregué headerShown: false */}
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