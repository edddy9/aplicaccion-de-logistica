// app/trips/_layout.tsx
import { Stack } from "expo-router";

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007bff" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      
      <Stack.Screen name="[id]" options={{ title: "Detalle del viaje" }} />
   
    </Stack>
  );
}
