import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenProp>();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.20.50:8000/api/login', {
        correo,
        contrasena,
      });
      Alert.alert('Login exitoso', JSON.stringify(response.data));
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={contrasena}
        secureTextEntry
        onChangeText={setContrasena}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Registrarse" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});
