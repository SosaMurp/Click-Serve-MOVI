import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>Expo + React Native</Text>
          <Text style={styles.title}>Click & Serve</Text>
          <Text style={styles.subtitle}>Proyecto base listo con pnpm</Text>
        </View>

        {/* Counter Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Prueba Interactiva</Text>
          <Text style={styles.counterValue}>{count}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setCount(count + 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>¡Haz clic aquí!</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🚀 Cómo probarlo:</Text>
          <Text style={styles.infoText}>• En navegador (Web): <Text style={styles.code}>pnpm web</Text></Text>
          <Text style={styles.infoText}>• En celular (Expo Go): <Text style={styles.code}>pnpm start</Text></Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    color: '#38BDF8',
    backgroundColor: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counterValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#1E293B40',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  code: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});

