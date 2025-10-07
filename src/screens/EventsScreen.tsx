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
import { Card, Button, Text as PaperText } from "react-native-paper";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

const API_URL = "http://10.142.0.7:8464/api/eventos";

export default function EventsScreen() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const cargarEventos = async () => {
    try {
      const res = await axios.get(API_URL);
      setEventos(res.data);
      setFiltered(res.data);

      // Animaciones al cargar
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
      console.error("Error al cargar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    const f = eventos.filter(
      (e) =>
        e.titulo.toLowerCase().includes(filter.toLowerCase()) ||
        e.tipo.toLowerCase().includes(filter.toLowerCase())
    );
    setFiltered(f);
  }, [filter]);

  const getEventTypeIcon = (tipo: string) => {
    const type = tipo.toLowerCase();
    if (type.includes("música") || type.includes("concierto"))
      return "music-note";
    if (type.includes("baile") || type.includes("danza")) return "accessibility";
    if (type.includes("comida") || type.includes("gastronomía"))
      return "restaurant";
    if (type.includes("teatro") || type.includes("obra"))
      return "theater-comedy";
    if (type.includes("desfile") || type.includes("comparsa")) return "groups";
    return "celebration";
  };

  const getEventColor = (tipo: string) => {
    const type = tipo.toLowerCase();
    if (type.includes("música")) return ["#ec4899", "#d946ef"];
    if (type.includes("baile")) return ["#f59e0b", "#eab308"];
    if (type.includes("comida")) return ["#22c55e", "#16a34a"];
    if (type.includes("teatro")) return ["#3b82f6", "#2563eb"];
    if (type.includes("desfile")) return ["#ef4444", "#dc2626"];
    return ["#7e22ce", "#9333ea"];
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <View style={styles.loadingAnimation}>
            <MaterialIcons name="celebration" size={64} color="#7e22ce" />
            <View style={styles.pulse} />
          </View>
          <Text style={styles.loadingTitle}>Cargando eventos</Text>
          <Text style={styles.loadingSubtitle}>Preparando la fiesta...</Text>
        </Animated.View>
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
        <LinearGradient
          colors={["#7e22ce", "#c084fc"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <MaterialIcons name="celebration" size={32} color="white" />
              <Text style={styles.title}>Eventos del Carnaval</Text>
            </View>
            <Text style={styles.subtitle}>
              Descubre la magia, colores y alegría de nuestra tradición
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Contenido */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6b7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.search}
            placeholder="Buscar por nombre, tipo de evento..."
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

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filtered.length}</Text>
            <Text style={styles.statLabel}>Eventos encontrados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{eventos.length}</Text>
            <Text style={styles.statLabel}>Total de eventos</Text>
          </View>
        </View>

        {/* Lista */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50 * (index + 1), 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Card style={styles.card}>
                {item.imagen && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.imagen }}
                      style={styles.image}
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)"]}
                      style={styles.imageGradient}
                    />
                    <View style={styles.eventTypeBadge}>
                      <MaterialIcons
                        name={getEventTypeIcon(item.tipo)}
                        size={16}
                        color="white"
                      />
                      <Text style={styles.eventTypeText}>{item.tipo}</Text>
                    </View>
                  </View>
                )}

                <LinearGradient
                  colors={getEventColor(item.tipo)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardHeader}
                >
                  <Text style={styles.eventTitle}>{item.titulo}</Text>
                </LinearGradient>

                <View style={styles.cardContent}>
                  <Text style={styles.eventDescription}>
                    {item.descripcion}
                  </Text>

                  <View style={styles.eventMeta}>
                    <View style={styles.metaItem}>
                      <FontAwesome5 name="calendar" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{item.fecha}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="category" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{item.tipo}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No se encontraron eventos</Text>
              <Text style={styles.emptyText}>
                Intenta con otros términos de búsqueda
              </Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingContainer: { alignItems: "center" },
  loadingAnimation: { position: "relative", marginBottom: 20 },
  pulse: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: "#7e22ce",
    borderRadius: 50,
    opacity: 0.2,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  loadingSubtitle: { fontSize: 16, color: "#64748b" },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    elevation: 8,
  },
  headerGradient: { paddingVertical: 30, paddingHorizontal: 20 },
  headerContent: { alignItems: "center" },
  titleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "bold", color: "white", marginLeft: 12 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.9)", textAlign: "center" },
  content: { flex: 1, padding: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 4,
  },
  searchIcon: { marginRight: 12 },
  clearIcon: { marginLeft: 12 },
  search: { flex: 1, paddingVertical: 16, fontSize: 16, color: "#1f2937" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    flex: 0.48,
    alignItems: "center",
    elevation: 2,
  },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#7e22ce", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  cardWrapper: { marginBottom: 16 },
  card: { borderRadius: 20, overflow: "hidden" },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 200 },
  imageGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 100 },
  eventTypeBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventTypeText: { color: "white", fontSize: 12, fontWeight: "600", marginLeft: 6 },
  cardHeader: { paddingVertical: 12, paddingHorizontal: 20 },
  eventTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
  cardContent: { padding: 20 },
  eventDescription: { fontSize: 15, color: "#475569", marginBottom: 16 },
  eventMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 14, color: "#6b7280", marginLeft: 8, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#6b7280", marginTop: 16 },
  emptyText: { fontSize: 16, color: "#9ca3af", textAlign: "center" },
});
