import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Switch,
  KeyboardAvoidingView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LinkCard() {
  const router = useRouter();
  const [isMainCard, setIsMainCard] = useState(true);

  // Estados locales para los campos y errores
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState('');

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

  const handleSave = () => {
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

    // Si todo es válido, regresa
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Feather name="x" size={24} color="#0A192F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vincular Tarjeta</Text>
        </View>
        <View style={styles.secureBadge}>
          <Feather name="lock" size={10} color="#0A192F" />
          <Text style={styles.secureText}>SECURE</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Card Mockup (Faint) */}
          <View style={styles.cardMockup}>
            <View style={styles.mockupTopRow}>
              <View style={styles.mockupChip} />
              <View style={styles.mockupChip} />
            </View>
            <View style={styles.mockupMiddle}>
              <Text style={styles.mockupText}>Click&Serve</Text>
            </View>
            <View style={styles.mockupBottomRow}>
              <View style={styles.mockupLine} />
              <View style={styles.mockupLine} />
            </View>
          </View>
          
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTextSmall}>ENCRIPTADO SSL DE 256 BITS</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE DEL TITULAR</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Como aparece en la tarjeta"
                placeholderTextColor="#C4CDD5"
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
                  style={[styles.input, { flex: 1, borderBottomWidth: 0 }]} 
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#C4CDD5"
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
                <Feather name="credit-card" size={20} color="#C4CDD5" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.label}>VENCIMIENTO</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="MM / YY"
                  placeholderTextColor="#C4CDD5"
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
                  placeholderTextColor="#C4CDD5"
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
              <View>
                <Text style={styles.switchTitle}>TARJETA PRINCIPAL</Text>
                <Text style={styles.switchSubtitle}>Usar para cobros rápidos</Text>
              </View>
              <Switch
                trackColor={{ false: '#D1D9E0', true: '#0A192F' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#D1D9E0"
                onValueChange={() => setIsMainCard(!isMainCard)}
                value={isMainCard}
              />
            </View>
          </View>

        </ScrollView>
        
        {/* Update Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
            <Text style={styles.confirmButtonText}>CONFIRMAR Y GUARDAR</Text>
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  closeButton: { padding: 5, marginLeft: -5, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  secureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  secureText: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginLeft: 4 },
  scrollContainer: { paddingBottom: 20 },
  
  cardMockup: { margin: 25, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, height: 180, justifyContent: 'space-between', borderWidth: 1, borderColor: '#F0F4F8' },
  mockupTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mockupChip: { width: 30, height: 20, borderRadius: 4, backgroundColor: '#E1E8ED' },
  mockupMiddle: { alignItems: 'center' },
  mockupText: { fontSize: 32, fontWeight: '800', color: '#E1E8ED', fontStyle: 'italic', opacity: 0.5 },
  mockupBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mockupLine: { width: 60, height: 8, borderRadius: 4, backgroundColor: '#E1E8ED' },
  
  securityTextContainer: { alignItems: 'center', marginBottom: 15 },
  securityTextSmall: { fontSize: 8, fontWeight: '700', color: '#C4CDD5', letterSpacing: 1.5 },

  formContainer: { paddingHorizontal: 25 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { fontSize: 16, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', paddingVertical: 8 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  switchTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginBottom: 4 },
  switchSubtitle: { fontSize: 11, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  footer: { paddingHorizontal: 25, paddingVertical: 20, backgroundColor: '#FFFFFF' },
  confirmButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 15 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  termsText: { fontSize: 8, color: '#9CA8B6', textAlign: 'center', fontWeight: '700', letterSpacing: 1, lineHeight: 12 },
  errorText: { color: '#FF6B6B', fontSize: 11, fontWeight: '700', marginTop: -5, marginBottom: 15, textAlign: 'center' },
});
