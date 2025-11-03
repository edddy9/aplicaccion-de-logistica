import { Stack } from "expo-router";

export default function GastosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007bff" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      {/* Detalle del gasto */}
      <Stack.Screen
        name="[id]"
        options={{
          title: "Detalle del Gasto",
        }}
      />

      {/* Agregar nuevo gasto */}
      <Stack.Screen
        name="add"
        options={{
          title: "Registrar Gasto",
        }}
      />
    </Stack>
  );
}
