import React from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext"; // ✅ ADD THIS

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EventsScreen from "../screens/EventsScreen";
import MapsScreen from "../screens/MapsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token } = React.useContext(AuthContext);

  return (
    <Stack.Navigator
      initialRouteName={token ? "Home" : "Login"}
      screenOptions={{
        headerStyle: { backgroundColor: "#7e22ce" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerShadowVisible: false,
      }}
    >
      {/* Screens */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Crear Cuenta",
          headerStyle: { backgroundColor: "#10b981" },
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "ViveCarnaval",
          headerBackVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="person-circle" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Mi Perfil",
          headerStyle: { backgroundColor: "#ec4899" },
        }}
      />
      <Stack.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: "Eventos",
          headerStyle: { backgroundColor: "#7e22ce" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="Maps"
        component={MapsScreen}
        options={{
          title: "Maps",
          headerStyle: { backgroundColor: "#7e22ce" },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}
