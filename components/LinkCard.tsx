import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from './context/AuthContext';

export default function LinkCard() {
  const router = useRouter();
  const [isMainCard, setIsMainCard] = useState(true);

  // Estados locales para los campos y errores
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [saving, setSaving] = useState(false);

  // Algoritmo de Luhn para validación de tarjetas
  const validateLuhn = (num: string): boolean => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleSave = async () => {
    setCardError('');

    if (!cardHolder.trim()) {
      setCardError('Ingrese el nombre del titular');
      return;
    }

    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      setCardError('El número de tarjeta debe tener entre 13 y 19 dígitos');
      return;
    }

    if (!validateLuhn(cleanNumber)) {
      setCardError('Número de tarjeta inválido (Fallo de suma de verificación)');
      return;
    }

    if (!expiry.trim() || !/^\d{2}\/\d{2}$/.test(expiry)) {
      setCardError('Formato de vencimiento inválido (MM / YY)');
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      setCardError('El CVV debe tener 3 o 4 dígitos');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/api/metodos-pago', {
        titular: cardHolder.trim(),
        numero_tarjeta: cleanNumber,
        expiracion: expiry.trim(),
        cvv: cvv.trim(),
        es_principal: isMainCard,
      });

      if (res && res.status >= 400) {
        throw new Error(res.data?.error || `Error HTTP ${res.status}`);
      }

      Alert.alert('Éxito', 'Tarjeta vinculada correctamente.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de conexión al vincular la tarjeta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton} activeOpacity={0.8}>
            <Feather name="x" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vincular Tarjeta</Text>
        </View>
        <View style={styles.secureBadge}>
          <Feather name="shield" size={12} color="#10B981" />
          <Text style={styles.secureText}>SECURE</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Card Mockup (Elegante Dark Slate #1E293B sobre fondo claro) */}
          <View style={styles.cardMockup}>
            <View style={styles.mockupTopRow}>
              <View style={styles.mockupChip} />
              <Text style={styles.mockupBrand}>Click&Serve</Text>
            </View>
            <View style={styles.mockupMiddle}>
              <Text style={styles.mockupNumber}>
                {cardNumber.trim() ? cardNumber : '•••• •••• •••• ••••'}
              </Text>
            </View>
            <View style={styles.mockupBottomRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.mockupLabel}>TITULAR</Text>
                <Text style={styles.mockupValue} numberOfLines={1}>
                  {cardHolder.trim() ? cardHolder.toUpperCase() : 'NOMBRE DEL TITULAR'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.mockupLabel}>VENCE</Text>
                <Text style={styles.mockupValue}>{expiry.trim() ? expiry : 'MM/YY'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.securityTextContainer}>
            <Feather name="lock" size={11} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.securityTextSmall}>ENCRIPTADO SSL DE 256 BITS</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE DEL TITULAR</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Como aparece en la tarjeta"
                placeholderTextColor="#94A3B8"
                value={cardHolder}
                onChangeText={(text) => {
                  setCardHolder(text);
                  setCardError('');
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NÚMERO DE TARJETA</Text>
              <View style={styles.inputWithIcon}>
                <TextInput 
                  style={[styles.input, { flex: 1, borderWidth: 0 }]} 
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '');
                    let formatted = '';
                    for (let i = 0; i < cleaned.length; i++) {
                      if (i > 0 && i % 4 === 0) formatted += ' ';
                      formatted += cleaned[i];
                    }
                    setCardNumber(formatted);
                    setCardError('');
                  }}
                  maxLength={23}
                />
                <Feather name="credit-card" size={20} color="#94A3B8" style={{ marginRight: 14 }} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>VENCIMIENTO</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="MM / YY"
                  placeholderTextColor="#94A3B8"
                  value={expiry}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '');
                    let formatted = cleaned;
                    if (cleaned.length > 2) {
                      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
                    }
                    setExpiry(formatted);
                    setCardError('');
                  }}
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="***"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  secureTextEntry
                  value={cvv}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '');
                    setCvv(cleaned);
                    setCardError('');
                  }}
                  maxLength={4}
                />
              </View>
            </View>

            {/* Error Message */}
            {cardError ? <Text style={styles.errorText}>{cardError}</Text> : null}

            {/* Toggle Switch */}
            <View style={styles.switchContainer}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.switchTitle}>TARJETA PRINCIPAL</Text>
                <Text style={styles.switchSubtitle}>Usar para cobros y servicios rápidos</Text>
              </View>
              <Switch
                trackColor={{ false: '#E2E8F0', true: '#FF6B1A' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#E2E8F0"
                onValueChange={() => setIsMainCard(!isMainCard)}
                value={isMainCard}
              />
            </View>
          </View>

        </ScrollView>
        
        {/* Footer con Botón Oficial */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmButton, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>CONFIRMAR Y GUARDAR</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            AL GUARDAR, ACEPTAS EL PROCESAMIENTO DE DATOS BAJO LOS TÉRMINOS DE CLICK&SERVE PLATAFORMA
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  closeButton: { padding: 4, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  secureBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E6F8F0', 
    borderWidth: 1, 
    borderColor: '#A7F3D0', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 14 
  },
  secureText: { fontSize: 10, fontWeight: '800', color: '#10B981', letterSpacing: 1, marginLeft: 4 },
  scrollContainer: { paddingBottom: 20 },
  
  cardMockup: { 
    margin: 20, 
    backgroundColor: '#1E293B', 
    borderRadius: 16, 
    padding: 22, 
    height: 190, 
    justifyContent: 'space-between', 
    borderWidth: 1, 
    borderColor: '#334155',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  mockupTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mockupChip: { 
    width: 38, 
    height: 26, 
    borderRadius: 5, 
    backgroundColor: '#CBD5E1', 
    borderWidth: 1, 
    borderColor: '#94A3B8' 
  },
  mockupBrand: { fontSize: 15, fontWeight: '800', color: '#FF6B1A', fontStyle: 'italic', letterSpacing: 0.5 },
  mockupMiddle: { marginVertical: 8 },
  mockupNumber: { 
    fontSize: 20, 
    color: '#FFFFFF', 
    letterSpacing: 2.5, 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    fontWeight: '700' 
  },
  mockupBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  mockupLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 4 },
  mockupValue: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },

  securityTextContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  securityTextSmall: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 1.2 },

  formContainer: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  input: { 
    fontSize: 14, 
    color: '#0F172A', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 13,
    minHeight: 48,
  },
  inputWithIcon: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12,
  },
  row: { flexDirection: 'row' },
  
  switchContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 6, 
    paddingVertical: 14, 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0' 
  },
  switchTitle: { fontSize: 11, fontWeight: '800', color: '#0F172A', letterSpacing: 0.8, marginBottom: 4 },
  switchSubtitle: { fontSize: 12, color: '#64748B' },
  
  footer: { 
    paddingHorizontal: 20, 
    paddingVertical: 18, 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0' 
  },
  confirmButton: { 
    backgroundColor: '#FF6B1A', 
    height: 52, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12,
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  termsText: { fontSize: 9, color: '#64748B', textAlign: 'center', fontWeight: '600', letterSpacing: 0.5, lineHeight: 14 },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '700', marginTop: -6, marginBottom: 14, textAlign: 'center' },
});
