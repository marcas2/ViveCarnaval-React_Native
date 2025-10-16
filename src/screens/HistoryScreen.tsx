import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
} from "react-native";
import { Card } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const API_URL = "http://10.142.0.7:8464/api/history"; 

export default function HistoriaScreen() {
  const [historias, setHistorias] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const cargarHistorias = async () => {
    try {
      const res = await axios.get(API_URL);
      setHistorias(res.data);
      setFiltered(res.data);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error al cargar historias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorias();
  }, []);

  useEffect(() => {
    const f = historias.filter((h) =>
      h.titulo.toLowerCase().includes(filter.toLowerCase())
    );
    setFiltered(f);
  }, [filter, historias]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7e22ce" />
        <Text style={styles.loadingText}>Cargando historias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <LinearGradient colors={["#7e22ce", "#c084fc"]} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <MaterialIcons name="history-edu" size={32} color="white" />
            <Text style={styles.headerTitle}>Historias del Carnaval</Text>
            <Text style={styles.headerSubtitle}>
              Revive los momentos y leyendas que nos inspiran cada año
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título..."
          placeholderTextColor="#9ca3af"
          value={filter}
          onChangeText={setFilter}
        />
        {filter ? (
          <Ionicons
            name="close-circle"
            size={20}
            color="#6b7280"
            style={styles.clearIcon}
            onPress={() => setFilter("")}
          />
        ) : null}
      </View>

      {/* Lista de historias */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50 * (index + 1), 0],
                  }),
                },
              ],
              marginBottom: 20,
            }}
          >
            <Card style={styles.card}>
              {item.imagen && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.imagen }} style={styles.image} />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    style={styles.imageOverlay}
                  />
                  <Text style={styles.imageTitle}>{item.titulo}</Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.storyText}>{item.contenido}</Text>
                {item.contenido2 ? (
                  <Text style={styles.storyText}>{item.contenido2}</Text>
                ) : null}
                {item.contenido3 ? (
                  <Text style={styles.storyText}>{item.contenido3}</Text>
                ) : null}
              </View>
            </Card>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No se encontraron historias</Text>
            <Text style={styles.emptySubtitle}>
              Intenta buscar con otros términos
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#6b7280" },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    elevation: 8,
  },
  headerGradient: { paddingVertical: 30, paddingHorizontal: 20 },
  headerContent: { alignItems: "center" },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "white", marginTop: 8 },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    margin: 16,
    elevation: 3,
  },
  searchIcon: { marginRight: 8 },
  clearIcon: { marginLeft: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#1f2937" },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 3,
  },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 200 },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  imageTitle: {
    position: "absolute",
    bottom: 16,
    left: 16,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  cardContent: { padding: 16 },
  storyText: { fontSize: 15, color: "#475569", marginBottom: 10 },
  emptyContainer: { alignItems: "center", paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#6b7280", marginTop: 16 },
  emptySubtitle: { fontSize: 16, color: "#9ca3af", textAlign: "center" },
});
