import { useState } from "react";
import { View, TextInput, Button, Text, ActivityIndicator, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No es necesario router.push, RootLayout detectará el cambio automáticamente
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-email":
          setError("Correo inválido.");
          break;
        case "auth/user-not-found":
          setError("Usuario no encontrado.");
          break;
        case "auth/wrong-password":
          setError("Contraseña incorrecta.");
          break;
        default:
          setError("Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
      ) : (
        <>
          <Button title="Iniciar sesión" onPress={handleLogin} />
          <View style={{ height: 10 }} />
          {/* CAMBIO AQUÍ: La ruta correcta es "/trips/register" */}
          <Button title="Registrarse" onPress={() => router.push("../register")} />
          <View style={{ height: 10 }} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});