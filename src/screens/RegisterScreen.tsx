import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type RegisterScreenProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenProp>();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://192.168.20.50:8000/api/register', {
        nombre,
        correo,
        contrasena,
        rol: 'ROLE_USER',
      });
      Alert.alert('Registro exitoso', JSON.stringify(response.data));
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al registrar');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
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
      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});
