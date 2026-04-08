import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useTasks } from '../context';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage from '../storage';
import type { UserCategory } from '../storage';

type CreateTaskScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type ScheduleOption = 'today' | 'tomorrow' | 'next_week' | 'next_month';

const SCHEDULE_OPTIONS: { key: ScheduleOption; label: string }[] = [
  { key: 'today',      label: 'Hoy' },
  { key: 'tomorrow',   label: 'Mañana' },
  { key: 'next_week',  label: 'Próx. semana' },
  { key: 'next_month', label: 'Próx. mes' },
];

function resolveDate(option: ScheduleOption): Date {
  const d = new Date();
  if (option === 'tomorrow')  d.setDate(d.getDate() + 1);
  if (option === 'next_week') d.setDate(d.getDate() + 7);
  if (option === 'next_month') d.setMonth(d.getMonth() + 1);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function CreateTaskScreen({ navigation }: CreateTaskScreenProps) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<ScheduleOption>('today');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storage.getUserCategories().then(setUserCategories);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) { setError('El título es requerido'); return; }
    try {
      setIsLoading(true);
      setError(null);
      const dateLine = schedule !== 'today' ? `📅 ${formatDate(resolveDate(schedule))}\n` : '';
      const fullDescription = (dateLine + description.trim()) || undefined;
      const task = await createTask({ title: title.trim(), description: fullDescription });
      if (selectedCategory) await storage.setTaskCategory(task.id, selectedCategory);
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  }, [title, description, schedule, selectedCategory, createTask, navigation]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>

          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor={Colors.inputPlaceholder}
            value={title}
            onChangeText={setTitle}
            maxLength={255}
            autoFocus
          />

          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Agrega detalles..."
            placeholderTextColor={Colors.inputPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Schedule */}
          <Text style={styles.label}>Programar para</Text>
          <View style={styles.pillRow}>
            {SCHEDULE_OPTIONS.map(({ key, label }) => {
              const active = schedule === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSchedule(key)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {schedule !== 'today' && (
            <View style={styles.datePreview}>
              <Text style={styles.datePreviewText}>📅 {formatDate(resolveDate(schedule))}</Text>
            </View>
          )}

          {/* Category */}
          {userCategories.length > 0 && (
            <>
              <Text style={styles.label}>Carpeta</Text>
              <View style={styles.pillRow}>
                {userCategories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.pill, active && { backgroundColor: cat.color + '30', borderColor: cat.color }]}
                      onPress={() => setSelectedCategory(active ? null : cat.id)}
                    >
                      <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.pillText, active && { color: cat.color }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <Button title="Cancelar" onPress={() => navigation.goBack()} variant="secondary" style={styles.btn} />
            <Button title="Crear" onPress={handleCreate} loading={isLoading} disabled={!title.trim()} style={styles.btn} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },
  content: { padding: Spacing.lg },
  label: {
    fontSize: FontSize.xs, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase',
    marginBottom: Spacing.xs, marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.inputBackground, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, fontFamily: FontFamily.body,
    color: Colors.inputText, borderWidth: 1, borderColor: Colors.inputBorder,
  },
  textArea: { minHeight: 88, paddingTop: 14 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm + 4, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
  },
  pillActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  pillText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
  pillTextActive: { color: Colors.secondary },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  datePreview: {
    marginTop: Spacing.sm, alignSelf: 'flex-start',
    backgroundColor: Colors.warning + '18', borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  datePreviewText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.warning },
  error: {
    color: Colors.error, fontSize: FontSize.sm, fontFamily: FontFamily.body,
    textAlign: 'center', marginTop: Spacing.md,
  },
  buttons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  btn: { flex: 1 },
});
