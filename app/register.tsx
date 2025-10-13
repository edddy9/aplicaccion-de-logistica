import { useState } from "react";
import { View, TextInput, Button, Text, ActivityIndicator, StyleSheet } from "react-native"; // Importar ActivityIndicator
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "../firebaseConfig";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Nuevo estado para la carga
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña.");
      return;
    }

    setLoading(true); // Iniciar la carga
    setError(""); // Limpiar errores previos

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Si el registro es exitoso, puedes redirigir al usuario
      router.replace("/"); // Redirige a la página principal o a donde desees
    } catch (err: any) {
      // Manejo de errores de Firebase
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("El correo electrónico ya está registrado.");
          break;
        case "auth/invalid-email":
          setError("El formato del correo electrónico es inválido.");
          break;
        case "auth/weak-password":
          setError("La contraseña debe tener al menos 6 caracteres.");
          break;
        default:
          setError("Error al registrar: " + err.message);

          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  console.log("Usuario creado:", userCredential.user);
  router.replace("/");
      }
    } finally {
      setLoading(false); // Finalizar la carga
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address" // Buena práctica para emails
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

      {loading ? ( // Mostrar indicador de carga si está cargando
        <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
      ) : (
        <Button
          title="Registrarse"
          onPress={handleRegister} // ¡AQUÍ SE LLAMA LA FUNCIÓN!
        />
      )}
      <View style={{ height: 10 }} />
      <Button
        title="Volver al Login"
        onPress={() => router.back()} // Opción para volver al login
        color="gray"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: "red", marginBottom: 10 },
});