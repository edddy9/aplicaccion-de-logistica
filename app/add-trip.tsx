import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function AddTripScreen() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [empresa, setEmpresa] = useState("");
  const router = useRouter();

  //📍 Lista de estados de México
  const estados = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
    "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero",
    "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
    "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
    "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
  ];

  const handleSaveTrip = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para guardar un viaje.");
      return;
    }

    if (!origen || !destino || !empresa) {
      Alert.alert("Campos incompletos", "Por favor, llena todos los campos.");
      return;
    }

    try {
  await addDoc(collection(db, "viajes"), {
    origen,
    destino,
    empresa,
    userId: user.uid,
    estado: "en curso",
    creadoEn: serverTimestamp(),
  });

  Alert.alert("Éxito", "Viaje guardado correctamente.");

  // 👇 Espera 1 segundo antes de navegar (evita el cierre en Android)
  setTimeout(() => {
    router.push("../trips");
  }, 1000);

} catch (error) {
  console.error("Error al guardar viaje:", error);
  Alert.alert("Error", "No se pudo guardar el viaje.");
}

     };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Origen</Text>
      <Picker
        selectedValue={origen}
        onValueChange={setOrigen}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona el estado de origen" value="" />
        {estados.map((estado) => (
          <Picker.Item key={estado} label={estado} value={estado} />
        ))}
      </Picker>

      <Text style={styles.label}>Destino</Text>
      <Picker
        selectedValue={destino}
        onValueChange={setDestino}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona el estado de destino" value="" />
        {estados.map((estado) => (
          <Picker.Item key={estado} label={estado} value={estado} />
        ))}
      </Picker>
      <Text style={styles.label}>Empresa</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe el nombre de la empresa"
        value={empresa}
        onChangeText={setEmpresa}
      />
      <Button title="Guardar viaje" onPress={handleSaveTrip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "flex-start" },
  label: { fontSize: 15, fontWeight: "bold", marginBottom: 1 },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
});
