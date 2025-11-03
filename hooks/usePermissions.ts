import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export default function usePermissions() {
  const [isGranted, setIsGranted] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // 🧭 Solicitar permiso de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permiso requerido",
            "La aplicación necesita acceso a la ubicación para registrar los gastos correctamente."
          );
          setIsGranted(false);
          return;
        }

        setIsGranted(true);
      } catch (error) {
        console.error("Error al solicitar permisos:", error);
        setIsGranted(false);
      }
    };

    requestPermissions();
  }, []);

  return isGranted;
}
