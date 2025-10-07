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
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState({});
  const [loadingCountdown, setLoadingCountdown] = useState(true);
  const [events, setEvents] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const countdownScale = useState(new Animated.Value(0.8))[0];

  const navigation = useNavigation();

  // Efectos de animación al cargar
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de pulso para el contador
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animación del contador cuando cambia
  useEffect(() => {
    Animated.sequence([
      Animated.timing(countdownScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(countdownScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [timeLeft]);

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
          if (ev.start) {
            const date = ev.start.split("T")[0];
            marked[date] = { 
              marked: true, 
              dotColor: "#7e22ce",
              customContainer: {
                backgroundColor: '#f3e8ff',
                borderRadius: 12,
              }
            };
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER CON GRADIENTE */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#7e22ce', '#a855f7', '#c084fc']}
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Ionicons name="color-palette" size={32} color="#fff" />
                <Text style={styles.headerTitle}>Carnaval de Negros y Blancos</Text>
              </View>
              <Text style={styles.headerSubtitle}>Pasto 2025</Text>
              <Text style={styles.headerDescription}>
                La fiesta más colorida y alegre del sur de Colombia te espera con
                tradición, cultura y diversión.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* CONTADOR */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#7e22ce" />
            <Text style={styles.sectionTitle}>¡Faltan solo!</Text>
          </View>
          
          {loadingCountdown ? (
            <ActivityIndicator size="large" color="#7e22ce" />
          ) : (
            <Animated.View 
              style={[
                styles.countdownContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              {[
                { key: "days", label: "DÍAS", color: "#ec4899", icon: "calendar" },
                { key: "hours", label: "HORAS", color: "#3b82f6", icon: "time" },
                { key: "minutes", label: "MINUTOS", color: "#facc15", icon: "timer" },
                { key: "seconds", label: "SEGUNDOS", color: "#a855f7", icon: "stopwatch" },
              ].map((item, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.countdownItem, 
                    { 
                      backgroundColor: item.color,
                      transform: [{ scale: countdownScale }]
                    }
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color="#fff" />
                  <Text style={styles.countdownNumber}>
                    {String(timeLeft[item.key] ?? 0).padStart(2, '0')}
                  </Text>
                  <Text style={styles.countdownLabel}>{item.label}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}
        </Animated.View>

        {/* BOTONES PRINCIPALES */}
        <Animated.View 
          style={[
            styles.buttonsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Events")}
          >
            <LinearGradient
              colors={['#7e22ce', '#a855f7']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="musical-notes" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Ver Eventos</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Maps")}
          >
            <LinearGradient
              colors={['#3b82f6', '#60a5fa']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="map" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Ver Mapa</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* INFO CARDS */}
        <Animated.View 
          style={[
            styles.infoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>📋 Información General</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="calendar" size={24} color="#7e22ce" />
              </View>
              <Text style={styles.infoText}>2-7 Enero 2025</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="location" size={24} color="#ef4444" />
              </View>
              <Text style={styles.infoText}>Pasto, Nariño</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="musical-notes" size={24} color="#22c55e" />
              </View>
              <Text style={styles.infoText}>50+ Presentaciones</Text>
            </View>
          </View>
        </Animated.View>

        {/* CALENDARIO */}
        <Animated.View 
          style={[
            styles.calendarContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color="#7e22ce" />
            <Text style={styles.sectionTitle}>Calendario de Eventos</Text>
          </View>
          {loadingEvents ? (
            <ActivityIndicator size="large" color="#7e22ce" />
          ) : (
            <View style={styles.calendarWrapper}>
              <Calendar
                markedDates={events}
                onDayPress={handleDayPress}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#7e22ce',
                  selectedDayBackgroundColor: '#7e22ce',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#ef4444',
                  dayTextColor: '#1e293b',
                  textDisabledColor: '#d1d5db',
                  dotColor: '#7e22ce',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#7e22ce',
                  monthTextColor: '#7e22ce',
                  indicatorColor: '#7e22ce',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14,
                }}
                style={styles.calendar}
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* MODAL DE DETALLES */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }]
              }
            ]}
          >
            {selectedEvent ? (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="calendar" size={16} color="#7e22ce" />
                    <Text style={styles.modalText}>
                      {new Date(selectedEvent.start).toLocaleDateString("es-CO")}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="pricetag" size={16} color="#7e22ce" />
                    <Text style={styles.modalText}>
                      {selectedEvent.tipo || "Tipo no especificado"}
                    </Text>
                  </View>
                </View>

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
                    <Ionicons name="image" size={40} color="#7e22ce" />
                    <Text style={styles.noImageText}>Sin imagen disponible</Text>
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
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientHeader: {
    padding: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#fff", 
    marginLeft: 8,
    textAlign: 'center',
  },
  headerSubtitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#fbbf24",
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    textAlign: "center",
    color: "#e9d5ff",
    marginTop: 8,
    lineHeight: 20,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 8,
  },
  countdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  countdownItem: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  countdownNumber: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#fff",
    marginVertical: 4,
  },
  countdownLabel: { 
    fontSize: 10, 
    fontWeight: "600", 
    color: "#fff",
    textAlign: 'center',
  },
  buttonsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 30,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { 
    color: "#fff", 
    marginLeft: 8, 
    fontWeight: "bold",
    fontSize: 16,
  },
  infoContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  infoCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoText: { 
    fontSize: 12, 
    fontWeight: "600", 
    color: "#1e293b",
    textAlign: 'center',
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  calendar: {
    borderRadius: 16,
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#7e22ce",
    marginBottom: 16,
  },
  modalInfo: {
    marginBottom: 16,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: "#444",
    marginLeft: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: "#555",
    marginTop: 16,
    lineHeight: 22,
    textAlign: "justify",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginTop: 10,
  },
  noImageBox: {
    width: "100%",
    height: 150,
    backgroundColor: "#f3e8ff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  noImageText: {
    color: "#7e22ce",
    fontStyle: "italic",
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: "#7e22ce",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});