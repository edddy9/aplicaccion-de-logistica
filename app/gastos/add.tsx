import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";

export default function AddGasto() {
  const { viajeId } = useLocalSearchParams(); // ID del viaje recibido por parámetro
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  // Categorías disponibles
  const categorias = [
    "Combustible",
    "Casetas",
    "Comida",
    "Hospedaje",
    "Reparaciones",
    "Otros",
  ];

  // Guardar gasto en Firestore
  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión.");
      router.replace("/login");
      return;
    }

    if (!viajeId || !categoria || !monto) {
      Alert.alert("Campos incompletos", "Completa todos los campos requeridos.");
      return;
    }

    setGuardando(true);

    try {
      // 1️⃣ Obtener ubicación (opcional)
      let coords: { lat?: number; lng?: number } = {};
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        }
      } catch (e) {
        console.warn("No se pudo obtener ubicación:", e);
      }

      // 2️⃣ Obtener empresa desde el viaje
      const viajeRef = doc(db, "viajes", String(viajeId));
      const viajeSnap = await getDoc(viajeRef);
      let empresa = "Sin empresa";

      if (viajeSnap.exists()) {
        empresa = viajeSnap.data().empresa || "Sin empresa";
      }

      // 3️⃣ Guardar gasto con empresa incluida
      await addDoc(collection(db, "gastos"), {
        viajeId: String(viajeId),
        userId: user.uid,
        categoria,
        monto: parseFloat(monto),
        geo: coords,
        empresa, // 👈 se agrega aquí
        estatus: "pendiente",
        creadoEn: serverTimestamp(),
      });

      Alert.alert("Éxito", "Gasto guardado correctamente.");
      router.back();
    } catch (error: any) {
      console.error("Error al guardar gasto:", error);
      Alert.alert("Error", error.message ?? "No se pudo guardar el gasto.");
    } finally {
      setGuardando(false);
    }
  };

  if (guardando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Guardando gasto...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Gasto</Text>

      {/* Categoría */}
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoria}
          onValueChange={(value) => setCategoria(value)}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona una categoría" value="" />
          {categorias.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {/* Monto */}
      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 500.00"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
      />

      {/* Botón Guardar */}
      <View style={{ marginTop: 20 }}>
        <Button title="Guardar gasto" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  picker: { height: 50, width: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
