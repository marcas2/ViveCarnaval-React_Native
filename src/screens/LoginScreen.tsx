import React, { useState, useContext } from 'react';
import { 
  View, TextInput, TouchableOpacity, StyleSheet, Alert, Text, 
  ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions 
} from 'react-native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext'; // 👈 Importar el contexto

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenProp>();
  const { setToken } = useContext(AuthContext); // 👈 Usar el contexto
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://10.142.0.7:8464/api/loginApp', {
        correo,
        contrasena,
      });

      if (response.data?.token) {
        await setToken(response.data.token); // ✅ Guardamos el token
        navigation.replace('Home'); // ✅ Navegamos al Home
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../resources/img/ViveCarnaval.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>ViveCarnaval</Text>
            <Text style={styles.subtitle}>Disfruta la experiencia carnavalera</Text>
          </View>

          {/* Tabs Section */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, styles.tabActive]}
              onPress={() => {}}
            >
              <Ionicons name="log-in" size={20} color="#7e22ce" />
              <Text style={styles.tabTextActive}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => navigation.navigate('Register')}
            >
              <Ionicons name="person-add" size={20} color="#64748b" />
              <Text style={styles.tabText}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry={secureTextEntry}
              />
              <TouchableOpacity 
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={secureTextEntry ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberContainer}>
              <TouchableOpacity 
                style={styles.rememberCheckbox}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Ionicons 
                  name={rememberMe ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={rememberMe ? '#7e22ce' : '#64748b'} 
                />
                <Text style={styles.rememberText}>Recordarme</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Ionicons name="refresh" size={24} color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>

          

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Regístrate ahora</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al acceder, aceptas nuestras <Text style={styles.footerLink}>Condiciones</Text>, 
              {' '}<Text style={styles.footerLink}>Política de datos</Text> y 
              {' '}<Text style={styles.footerLink}>Política de cookies</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7e22ce',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#f3e8ff',
  },
  tabText: {
    color: '#64748b',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  tabTextActive: {
    color: '#7e22ce',
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    padding: 12,
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#1e293b',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  eyeIcon: {
    padding: 12,
    paddingRight: 16,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#64748b',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  forgotText: {
    color: '#7e22ce',
    fontFamily: 'Poppins-Medium',
  },
  loginButton: {
    backgroundColor: '#7e22ce',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  facebookButton: {
    backgroundColor: '#fff',
  },
  socialButtonText: {
    marginLeft: 8,
    color: '#475569',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#64748b',
    fontFamily: 'Poppins-Regular',
  },
  registerLink: {
    color: '#7e22ce',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  footer: {
    padding: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  footerLink: {
    color: '#7e22ce',
    fontFamily: 'Poppins-Medium',
  },
});