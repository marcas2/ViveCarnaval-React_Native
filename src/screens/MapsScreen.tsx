import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // 🔹 Coordenadas de Pasto, Colombia
  const pastoRegion = {
    latitude: 1.2136,
    longitude: -77.2811,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://10.142.0.7:8464/api/events");

        if (!response.ok) throw new Error("Error al obtener eventos del servidor");

        const data = await response.json();

        // ⚠️ Si tu API no tiene coordenadas, agregamos algunas de ejemplo (Pasto)
        const enrichedEvents = data.map((e: any, i: number) => ({
          ...e,
          latitude: 1.2136 + i * 0.002, // variación para no superponer marcadores
          longitude: -77.2811 + i * 0.002,
        }));

        setEvents(enrichedEvents);
      } catch (error) {
        console.error("Error cargando eventos:", error);
        Alert.alert("Error", "No se pudieron cargar los eventos.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7e22ce" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapView
        style={styles.map}
        initialRegion={pastoRegion}
        provider={PROVIDER_GOOGLE}
      >
        {events.map((event, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(event.latitude),
              longitude: parseFloat(event.longitude),
            }}
            title={event.title}
            description={event.tipo}
            onPress={() => setSelectedEvent(event)} // abre modal
          />
        ))}
      </MapView>

      {/* Modal del evento */}
      {selectedEvent && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={() => setSelectedEvent(null)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
              <Text style={styles.modalType}>Tipo: {selectedEvent.tipo}</Text>
              <Text style={styles.modalDate}>
                Fecha: {selectedEvent.start}
              </Text>
              <Text style={styles.modalDescription}>
                {selectedEvent.description}
              </Text>

              {selectedEvent.imagen && (
                <Image
                  source={{
                    uri: `http://10.142.0.7:8464${selectedEvent.imagen}`,
                  }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedEvent(null)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#7e22ce",
  },
  modalType: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  modalDate: {
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
  },
  modalDescription: {
    textAlign: "center",
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },
  modalImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#7e22ce",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
