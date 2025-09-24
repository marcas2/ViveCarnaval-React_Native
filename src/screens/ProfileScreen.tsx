import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Animatable from "react-native-animatable";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { token } = useContext(AuthContext);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [biografia, setBiografia] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const API_URL = "http://10.0.2.2:8000/api";

  // ✅ Cargar datos del usuario
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNombre(data.nombre || "");
        setCorreo(data.correo || "");
        setBiografia(data.biografia || "");
        if (data.foto) {
          setFoto(`${API_URL.replace("/api", "")}${data.foto}`);
        }
      })
      .catch(() => Alert.alert("Error", "No se pudo cargar el perfil"));
  }, [token]);

  // ✅ Seleccionar nueva imagen
  const pickImage = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos necesarios", "Se necesita acceso a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  // ✅ Tomar foto con cámara
  const takePhoto = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos necesarios", "Se necesita acceso a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  // ✅ Guardar cambios
  const saveProfile = async () => {
    if (!token) {
      Alert.alert("Error", "No hay sesión activa");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("biografia", biografia);
      if (newPassword) {
        formData.append("contrasena", newPassword);
      }
      if (foto && !foto.startsWith("http")) {
        const filename = foto.split("/").pop();
        const match = /\.(\w+)$/.exec(filename!);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("foto", { uri: foto, name: filename, type } as any);
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
        setIsEditing(false);
        setNewPassword("");
      } else {
        Alert.alert("❌ Error", data.message || "No se pudo actualizar el perfil");
      }
    } catch (error) {
      Alert.alert("❌ Error", "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Cancelar edición
  const cancelEdit = () => {
    setIsEditing(false);
    setNewPassword("");
    // Recargar datos originales
    fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNombre(data.nombre || "");
        setBiografia(data.biografia || "");
        if (data.foto) {
          setFoto(`${API_URL.replace("/api", "")}${data.foto}`);
        }
      });
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER CON GRADIENTE */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu información personal</Text>
      </View>

      {/* SECCIÓN DE FOTO DE PERFIL */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={1000}
        style={styles.profileSection}
      >
        <View style={styles.photoContainer}>
          <TouchableOpacity 
            onPress={pickImage} 
            disabled={!isEditing}
            style={styles.photoWrapper}
          >
            <Image
              source={
                foto
                  ? { uri: foto }
                  : require("../assets/default-profile.png")
              }
              style={styles.profileImage}
            />
            {isEditing && (
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.photoText}>
            {isEditing ? "Toca la foto para cambiarla" : "Perfil"}
          </Text>

          {isEditing && (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Ionicons name="image" size={16} color="#7e22ce" />
                <Text style={styles.photoButtonText}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Ionicons name="camera" size={16} color="#7e22ce" />
                <Text style={styles.photoButtonText}>Cámara</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animatable.View>

      {/* BOTÓN EDITAR/CANCELAR */}
      <View style={styles.editToggleContainer}>
        {!isEditing ? (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={cancelEdit}
            >
              <Ionicons name="close" size={20} color="#64748b" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <Ionicons name="refresh" size={20} color="#fff" />
              ) : (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
              <Text style={styles.saveButtonText}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* FORMULARIO DE INFORMACIÓN */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={1200}
        delay={200}
        style={styles.formContainer}
      >
        {/* TARJETA DE INFORMACIÓN PERSONAL */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#7e22ce" />
            <Text style={styles.cardTitle}>Información Personal</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#94a3b8"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={correo}
              editable={false}
              placeholder="tu@email.com"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.helpText}>El correo no se puede modificar</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biografía</Text>
            <TextInput
              style={[
                styles.textArea,
                !isEditing && styles.inputDisabled
              ]}
              value={biografia}
              onChangeText={setBiografia}
              placeholder="Cuéntanos sobre ti..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={isEditing}
            />
          </View>
        </View>

        {/* TARJETA DE SEGURIDAD */}
        {isEditing && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="lock-closed" size={24} color="#ef4444" />
              <Text style={styles.cardTitle}>Seguridad</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Ingresa nueva contraseña"
                placeholderTextColor="#94a3b8"
                secureTextEntry
              />
              <Text style={styles.helpText}>
                Deja en blanco si no quieres cambiar la contraseña
              </Text>
            </View>
          </Animatable.View>
        )}

        {/* ESTADÍSTICAS DEL PERFIL */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Actividad del Perfil</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={20} color="#7e22ce" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Eventos guardados</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color="#10b981" />
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
          </View>
        </View>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: "#f8fafc" 
  },
  
  // Header
  header: {
    padding: 32,
    paddingBottom: 20,
    backgroundColor: "linear-gradient(135deg, #7e22ce 0%, #3b82f6 100%)",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000ff",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
  },

  // Profile Section
  profileSection: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  photoContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: "100%",
  },
  photoWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#f3e8ff",
  },
  editOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(126, 34, 206, 0.7)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  photoActions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  photoButtonText: {
    color: "#7e22ce",
    fontSize: 12,
    fontWeight: "600",
  },

  // Edit Toggle
  editToggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#7e22ce",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#7e22ce",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#f8fafc",
    borderColor: "#f1f5f9",
    color: "#64748b",
  },
  textArea: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
  },
  helpText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
    fontStyle: "italic",
  },

  // Stats Card
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
});