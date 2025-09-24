import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState({});
  const [loadingCountdown, setLoadingCountdown] = useState(true);
  const [events, setEvents] = useState({});
  const [loadingEvents, setLoadingEvents] = useState(true);

  const navigation = useNavigation();

  // === API COUNTDOWN ===
  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const res = await fetch("http://10.0.2.2:8000/api/countdown");
        const data = await res.json();

        if (data.start) {
          const carnivalDate = new Date(data.start);

          const updateCountdown = () => {
            const now = new Date().getTime();
            const target = carnivalDate.getTime();
            const difference = target - now;

            if (difference > 0) {
              setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
              });
            } else {
              setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
          };

          updateCountdown();
          const interval = setInterval(updateCountdown, 1000);
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching countdown:", error);
      } finally {
        setLoadingCountdown(false);
      }
    };

    fetchCountdown();
  }, []);

  // === API EVENTS ===
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://10.0.2.2:8000/api/events");
        const data = await res.json();

        const marked = {};
        data.forEach((ev) => {
          if (ev.fecha) {
            const date = ev.fecha.split("T")[0];
            marked[date] = { marked: true, dotColor: "#7e22ce" };
          }
        });

        setEvents(marked);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* HEADER COLORIDO */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎭 Carnaval de Negros y Blancos</Text>
          <Text style={styles.headerSubtitle}>Pasto 2025</Text>
          <Text style={styles.headerDescription}>
            La fiesta más colorida y alegre del sur de Colombia te espera con
            tradición, cultura y diversión.
          </Text>
        </View>

        {/* CONTADOR */}
        <Text style={styles.sectionTitle}>¡Faltan solo!</Text>
        {loadingCountdown ? (
          <ActivityIndicator size="large" color="#7e22ce" />
        ) : (
          <View style={styles.countdownContainer}>
            {[
              { key: "days", label: "DÍAS", color: "#ec4899" },
              { key: "hours", label: "HORAS", color: "#3b82f6" },
              { key: "minutes", label: "MINUTOS", color: "#facc15" },
              { key: "seconds", label: "SEGUNDOS", color: "#a855f7" },
            ].map((item, i) => (
              <View
                key={i}
                style={[styles.countdownItem, { backgroundColor: item.color }]}
              >
                <Text style={styles.countdownNumber}>
                  {timeLeft[item.key] ?? 0}
                </Text>
                <Text style={styles.countdownLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* BOTÓN DE EVENTOS */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Events")}
        >
          <Ionicons name="musical-notes" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Ver Eventos</Text>
        </TouchableOpacity>

        {/* SECCIÓN DE INFORMACIÓN */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="calendar" size={22} color="#7e22ce" />
            <Text style={styles.infoText}>2-7 Enero 2025</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={22} color="#ef4444" />
            <Text style={styles.infoText}>Pasto, Nariño</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="musical-notes" size={22} color="#22c55e" />
            <Text style={styles.infoText}>50+ Presentaciones</Text>
          </View>
        </View>

        {/* CALENDARIO */}
        <Text style={styles.sectionTitle}>📅 Calendario</Text>
        {loadingEvents ? (
          <ActivityIndicator size="large" color="#7e22ce" />
        ) : (
          <Calendar
            markedDates={events}
            theme={{
              todayTextColor: "#ef4444",
              selectedDayBackgroundColor: "#7e22ce",
              arrowColor: "#7e22ce",
            }}
          />
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f3e8ff",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#7e22ce" },
  headerSubtitle: { fontSize: 18, fontWeight: "600", color: "#a855f7" },
  headerDescription: {
    fontSize: 14,
    textAlign: "center",
    color: "#475569",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginVertical: 16,
  },
  countdownContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  countdownItem: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
  },
  countdownNumber: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  countdownLabel: { fontSize: 12, fontWeight: "600", color: "#fff" },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#7e22ce",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
  infoContainer: { paddingHorizontal: 20, marginBottom: 24 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
  },
  infoText: { marginLeft: 10, fontWeight: "600", color: "#1e293b" },

  editProfileButton: {
    flexDirection: "row",
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  editProfileText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
});
