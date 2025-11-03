import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function AddTripScreen() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();

  // 📶 Detectar conexión
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // 📍 Lista de estados de México
  const estados = [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Ciudad de México",
    "Coahuila",
    "Colima",
    "Durango",
    "Estado de México",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas",
  ];

  // 💾 Guardar viaje
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

    setGuardando(true);

    const nuevoViaje = {
      origen,
      destino,
      empresa,
      userId: user.uid,
      estado: "en curso",
      creadoEn: new Date().toISOString(),
      pendiente: !isConnected, // 👈 marca si se creó sin conexión
    };

    try {
      if (!isConnected) {
        // 🔹 Guardar localmente si no hay red
        const viajesPendientes =
          JSON.parse((await AsyncStorage.getItem("viajes_pendientes")) || "[]");
        viajesPendientes.push(nuevoViaje);
        await AsyncStorage.setItem(
          "viajes_pendientes",
          JSON.stringify(viajesPendientes)
        );
        Alert.alert(
          "📴 Sin conexión",
          "El viaje se guardó localmente y se subirá cuando haya conexión."
        );
      } else {
        // 🔹 Guardar directamente en Firestore
        await addDoc(collection(db, "viajes"), {
          ...nuevoViaje,
          creadoEn: serverTimestamp(),
          pendiente: false,
        });
        Alert.alert("✅ Éxito", "Viaje guardado correctamente.");
      }

      setTimeout(() => {
        router.push("../trips");
      }, 1000);
    } catch (error) {
      console.error("Error al guardar viaje:", error);
      Alert.alert("Error", "No se pudo guardar el viaje.");
    } finally {
      setGuardando(false);
    }
  };

  // 🔁 Sincronizar viajes pendientes cuando haya conexión
  useEffect(() => {
    const syncViajesPendientes = async () => {
      if (isConnected) {
        const pendientes = JSON.parse(
          (await AsyncStorage.getItem("viajes_pendientes")) || "[]"
        );
        if (pendientes.length > 0) {
          console.log("🔄 Sincronizando viajes pendientes:", pendientes.length);
          for (const viaje of pendientes) {
            await addDoc(collection(db, "viajes"), {
              ...viaje,
              pendiente: false,
              creadoEn: serverTimestamp(),
            });
          }
          await AsyncStorage.removeItem("viajes_pendientes");
          Alert.alert("🌐 Conectado", "Viajes pendientes sincronizados correctamente.");
        }
      }
    };

    syncViajesPendientes();
  }, [isConnected]);

  if (guardando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Guardando viaje...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isConnected && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          ⚠️ Estás sin conexión. Los viajes se guardarán localmente.
        </Text>
      )}

      <Text style={styles.label}>Origen</Text>
      <Picker selectedValue={origen} onValueChange={setOrigen} style={styles.picker}>
        <Picker.Item label="Selecciona el estado de origen" value="" />
        {estados.map((estado) => (
          <Picker.Item key={estado} label={estado} value={estado} />
        ))}
      </Picker>

      <Text style={styles.label}>Destino</Text>
      <Picker selectedValue={destino} onValueChange={setDestino} style={styles.picker}>
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
  label: { fontSize: 15, fontWeight: "bold", marginBottom: 5 },
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
