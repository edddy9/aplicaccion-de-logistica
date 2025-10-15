// app/register.tsx
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

import * as Yup from "yup";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();


const validarDatos = (email: string, telefono: string, password: string) => {
  // Validar email con expresión regular
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Alert.alert("Error", "Por favor ingresa un correo electrónico válido.");
    return false;
  }

  // Validar teléfono de 10 dígitos
  const telRegex = /^\d{10}$/;
  if (!telRegex.test(telefono)) {
    Alert.alert("Error", "El teléfono debe tener exactamente 10 dígitos.");
    return false;
  }

  // Validar contraseña (mínimo 6 caracteres)
  if (password.length < 6) {
    Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
    return false;
  }

  return true;
};

  // ✅ Esquema de validación con Yup
  const schema = Yup.object().shape({
    nombre: Yup.string().required("El nombre es requerido"),
    apellido: Yup.string().required("El apellido es requerido"),
    telefono: Yup.string()
      .matches(/^\d{10}$/, "Debe tener 10 dígitos")
      .required("El teléfono es requerido"),
    email: Yup.string().email("Correo inválido").required("El correo es requerido"),
    password: Yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es requerida"),
  });

  const handleRegister = async () => {
    try {
      // ✅ Validar todos los campos con Yup
      await schema.validate({ nombre, apellido, telefono, email, password });

      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar datos adicionales en Firestore
      await addDoc(collection(db, "usuarios"), {
        uid: user.uid,
        nombre,
        apellido,
        telefono,
        email: user.email,
        rol: "Transportista",
      });

      Alert.alert("✅ Registro exitoso", "Tu cuenta ha sido creada correctamente.");
      router.replace("/login");
    } catch (error: any) {
      if (error.name === "ValidationError") {
        // ⚠️ Mostrar mensajes de validación de Yup
        Alert.alert("Error de validación", error.message);
      } else {
        console.error("Error al registrar usuario:", error);
        Alert.alert("Error", error.message || "No se pudo registrar el usuario.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <TextInput
        placeholder="Nombre"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        placeholder="Apellido"
        style={styles.input}
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        placeholder="Teléfono (10 dígitos)"
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ marginTop: 10 }}>
        <Button title="Registrarse" onPress={handleRegister} color="#007bff" />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text>
          ¿Ya tienes cuenta?{" "}
          <Text style={{ color: "#007bff" }} onPress={() => router.replace("/login")}>
            Inicia sesión
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});
