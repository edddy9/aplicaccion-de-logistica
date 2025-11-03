import React, { useEffect } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/icono.png")} // 👈 coloca aquí tu logo
        style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
      <Animated.Text
        style={[styles.text, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        SGT-Logística
      </Animated.Text>
      <Text style={styles.subText}>Cargando tu sesión y permisos...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  text: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  subText: {
    fontSize: 14,
    color: "#e0e0e0",
    marginTop: 10,
  },
});
