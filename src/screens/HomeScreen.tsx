import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState({});
  const [loadingCountdown, setLoadingCountdown] = useState(true);
  const [events, setEvents] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  // === API COUNTDOWN ===
  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const res = await fetch("http://10.142.0.7:8464/api/countdown");
        const data = await res.json();

        if (data.fechaInicio) {
          const carnivalDate = new Date(data.fechaInicio);
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
      const res = await fetch("http://10.142.0.7:8464/api/events");
      const data = await res.json();

      const marked = {};
      data.forEach((ev) => {
        if (ev.start) { // ✅ corregido: era ev.starts
          const date = ev.start.split("T")[0];
          marked[date] = { marked: true, dotColor: "#7e22ce" };
        }
      });

      setEvents(marked);
      setAllEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  fetchEvents();
}, []);


  // === CLICK EN FECHA DEL CALENDARIO ===
  const handleDayPress = (day) => {
    const event = allEvents.find(
      (ev) => ev.start && ev.start.startsWith(day.dateString)
    );

    if (event) {
      setSelectedEvent(event);
      setModalVisible(true);
    } else {
      setSelectedEvent(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* HEADER */}
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



        {/* INFO */}
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
            onDayPress={handleDayPress}
            theme={{
              todayTextColor: "#ef4444",
              selectedDayBackgroundColor: "#7e22ce",
              arrowColor: "#7e22ce",
            }}
          />
        )}
      </ScrollView>
    {/* MODAL DE DETALLES */}
<Modal
  visible={modalVisible}
  animationType="fade"
  transparent={true}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      {selectedEvent ? (
        <>
          <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

          <Text style={styles.modalText}>
            📅 {new Date(selectedEvent.start).toLocaleDateString("es-CO")}
          </Text>
          <Text style={styles.modalText}>
            🎭 {selectedEvent.tipo || "Tipo no especificado"}
          </Text>

          {selectedEvent.imagen ? (
            <Image
              source={{
                uri: `http://10.142.0.7:8464${selectedEvent.imagen.replace(/\\/g, "")}`,
              }}
              style={styles.modalImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={styles.noImageText}>Sin imagen</Text>
            </View>
          )}

          {selectedEvent.description ? (
            <Text style={styles.modalDescription}>
              {selectedEvent.description}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.modalText}>No hay evento para esta fecha</Text>
      )}
    </View>
  </View>
</Modal>


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

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#7e22ce" },
  modalText: { fontSize: 14, color: "#1e293b", marginTop: 6 },
  modalDescription: {
    textAlign: "center",
    color: "#475569",
    marginTop: 10,
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: "#7e22ce",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" }, modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#7e22ce",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 15,
    color: "#555",
    marginTop: 10,
    lineHeight: 20,
    textAlign: "justify",
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    marginTop: 10,
  },
  noImageBox: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3e8ff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  noImageText: {
    color: "#7e22ce",
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#7e22ce",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
