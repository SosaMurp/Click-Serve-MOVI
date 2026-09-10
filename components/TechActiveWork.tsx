import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechActiveWork() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JP</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Juan Pérez</Text>
            <Text style={styles.headerSubtitle}>EN SITIO - SERVICIO ACTIVO</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/tech-client-chat' as any)}>
          <Feather name="message-circle" size={20} color="#7A8C9E" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Timer */}
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>TIEMPO TRANSCURRIDO</Text>
            <View style={styles.timerRow}>
              <Text style={styles.timerValueDark}>00:42:</Text>
              <Text style={styles.timerValueLight}>15</Text>
            </View>
          </View>

          {/* Tasks */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TAREAS REALIZADAS</Text>
            <Text style={styles.protocolText}>Protocolo Click&Serve</Text>
          </View>
          
          <View style={styles.tasksList}>
            {/* Task 1 - Checked and disabled */}
            <View style={styles.taskItem}>
              <View style={[styles.checkbox, { backgroundColor: '#0A192F', borderColor: '#0A192F' }]}>
                <Feather name="check" size={12} color="#FFFFFF" />
              </View>
              <Text style={[styles.taskText, { color: '#9CA8B6', textDecorationLine: 'line-through' }]}>
                Diagnóstico inicial del hardware
              </Text>
            </View>

            {/* Task 2 - Unchecked */}
            <View style={styles.taskItem}>
              <View style={styles.checkboxEmpty} />
              <Text style={styles.taskText}>
                Reparación de fuente de poder
              </Text>
            </View>

            {/* Task 3 - Checked and active */}
            <View style={styles.taskItemActive}>
              <View style={styles.activeIndicator} />
              <View style={styles.taskItemContent}>
                <View style={styles.checkboxSquareFilled}>
                  <View style={styles.innerSquare} />
                </View>
                <Text style={[styles.taskText, { flex: 1 }]}>
                  Sustitución de condensadores
                </Text>
                <Feather name="x" size={14} color="#D1D9E0" />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.addTaskButton}>
            <Feather name="plus" size={14} color="#9CA8B6" style={{ marginRight: 10 }} />
            <Text style={styles.addTaskText}>AGREGAR TAREA EXTRA / HALLAZGO</Text>
          </TouchableOpacity>

          {/* Notes */}
          <Text style={[styles.sectionTitle, { marginTop: 30 }]}>NOTAS DEL TÉCNICO</Text>
          
          <View style={styles.notesContainer}>
            <TextInput 
              style={styles.notesInput}
              multiline
              placeholder="Escribe tus observaciones..."
              placeholderTextColor="#9CA8B6"
              value="Se detectó sobrecalentamiento en el puente norte. Se aplicará pasta térmica premium."
            />
            <View style={styles.resizeHandle}>
              <Feather name="edit-2" size={10} color="#D1D9E0" />
            </View>
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={() => router.push('/tech-billing-summary' as any)}
          >
            <Text style={styles.finishButtonText}>FINALIZAR TRABAJO</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingBottom: 20, backgroundColor: '#0A192F' },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7A8C9E', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  headerTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 2 },
  headerSubtitle: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  chatButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#7A8C9E', justifyContent: 'center', alignItems: 'center' },

  scrollContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },
  
  timerSection: { alignItems: 'center', marginBottom: 40 },
  timerLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 2, marginBottom: 10 },
  timerRow: { flexDirection: 'row', alignItems: 'baseline' },
  timerValueDark: { fontSize: 48, fontWeight: '400', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  timerValueLight: { fontSize: 48, fontWeight: '400', color: '#C4CDD5', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15 },
  protocolText: { fontSize: 8, color: '#C4CDD5', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 15 },

  tasksList: { marginBottom: 20 },
  taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  checkboxEmpty: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#D1D9E0', marginRight: 15 },
  taskText: { fontSize: 13, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  taskItemActive: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 8, overflow: 'hidden', marginBottom: 15 },
  activeIndicator: { width: 3, backgroundColor: '#0A192F' },
  taskItemContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 },
  checkboxSquareFilled: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  innerSquare: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#0A192F' },

  addTaskButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 18 },
  addTaskText: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },

  notesContainer: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 15, position: 'relative' },
  notesInput: { fontSize: 13, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 22, minHeight: 80, textAlignVertical: 'top' },
  resizeHandle: { position: 'absolute', bottom: 10, right: 10 },

  footer: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 20, backgroundColor: '#FFFFFF' },
  finishButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center' },
  finishButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
});
