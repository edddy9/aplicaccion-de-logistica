import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function AddGasto() {
  const { viajeId } = useLocalSearchParams();
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [location, setLocation] = useState<{ lat?: number; lng?: number } | null>(
    null
  );
  const router = useRouter();

  const categorias = [
    "Combustible",
    "Casetas",
    "Comida",
    "Hospedaje",
    "Reparaciones",
    "Otros",
  ];

  // 🧭 Detectar conexión
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // 📍 Obtener ubicación actual
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        } else {
          Alert.alert(
            "Permiso denegado",
            "No se pudo obtener la ubicación. El gasto se guardará sin coordenadas."
          );
        }
      } catch (e) {
        console.warn("No se pudo obtener ubicación:", e);
      }
    })();
  }, []);

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
      // 🔹 Obtener empresa desde el viaje
      let empresa = "Sin empresa";
      try {
        const viajeSnap = await getDoc(doc(db, "viajes", String(viajeId)));
        if (viajeSnap.exists()) {
          empresa = viajeSnap.data().empresa || "Sin empresa";
        }
      } catch (e) {
        console.warn("No se pudo obtener la empresa:", e);
      }

      // 🔹 Datos del gasto
      const gasto = {
        viajeId: String(viajeId),
        userId: user.uid,
        categoria,
        monto: parseFloat(monto),
        geo: location || null,
        empresa,
        estatus: "pendiente",
        creadoEn: serverTimestamp(),
      };

      if (!isConnected) {
        // 🔸 Guardar localmente si no hay conexión
        const pending = JSON.parse(
          (await AsyncStorage.getItem("pending_gastos")) || "[]"
        );
        pending.push({
          ...gasto,
          tempId: Date.now(),
          localTime: new Date().toISOString(),
        });
        await AsyncStorage.setItem("pending_gastos", JSON.stringify(pending));

        Alert.alert(
          "Sin conexión",
          "El gasto se guardará y se sincronizará cuando vuelva la red."
        );
        router.back();
        return;
      }

      // 🔹 Guardar normalmente si hay conexión
      await addDoc(collection(db, "gastos"), gasto);
      Alert.alert("Éxito", "Gasto guardado correctamente.");
      router.back();
    } catch (error: any) {
      console.error("Error al guardar gasto:", error);
      Alert.alert("Error", error.message ?? "No se pudo guardar el gasto.");
    } finally {
      setGuardando(false);
    }
  };

  // 🔄 Sincronizar gastos pendientes cuando vuelve la red
  useEffect(() => {
    const syncPending = async () => {
      if (isConnected) {
        const stored = await AsyncStorage.getItem("pending_gastos");
        if (stored) {
          const list = JSON.parse(stored);
          for (const gasto of list) {
            try {
              await addDoc(collection(db, "gastos"), {
                ...gasto,
                creadoEn: serverTimestamp(),
              });
              console.log("✅ Gasto sincronizado:", gasto.tempId);
            } catch (error) {
              console.warn("No se pudo sincronizar un gasto:", error);
            }
          }
          await AsyncStorage.removeItem("pending_gastos");
        }
      }
    };
    syncPending();
  }, [isConnected]);

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
      {!isConnected && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          ⚠️ Sin conexión. El gasto se guardará localmente.
        </Text>
      )}

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

      <View style={{ marginTop: 20 }}>
        <Button title="Guardar gasto" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
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
