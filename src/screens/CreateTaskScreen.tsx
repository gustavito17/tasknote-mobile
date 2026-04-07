import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useTasks } from '../context';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage, { TaskCategory } from '../storage';

type CreateTaskScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type ScheduleOption = 'today' | 'tomorrow' | 'next_week' | 'next_month' | 'custom';

const CATEGORIES: { key: TaskCategory; label: string; color: string }[] = [
  { key: 'trabajo', label: 'Trabajo', color: '#4FC3F7' },
  { key: 'personal', label: 'Personal', color: '#CE93D8' },
  { key: 'urgente', label: 'Urgente', color: '#EF9A9A' },
];

const SCHEDULE_OPTIONS: { key: ScheduleOption; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'tomorrow', label: 'Mañana' },
  { key: 'next_week', label: 'Próx. semana' },
  { key: 'next_month', label: 'Próx. mes' },
];

function resolveScheduleDate(option: ScheduleOption): Date {
  const d = new Date();
  if (option === 'tomorrow') d.setDate(d.getDate() + 1);
  else if (option === 'next_week') d.setDate(d.getDate() + 7);
  else if (option === 'next_month') d.setMonth(d.getMonth() + 1);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function CreateTaskScreen({ navigation }: CreateTaskScreenProps) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [schedule, setSchedule] = useState<ScheduleOption>('today');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const scheduleDate = resolveScheduleDate(schedule);
      const dateLine = schedule !== 'today'
        ? `📅 ${formatDate(scheduleDate)}\n`
        : '';
      const fullDescription = dateLine + description.trim();

      const task = await createTask({
        title: title.trim(),
        description: fullDescription || undefined,
      });

      if (category) {
        await storage.setTaskCategory(task.id, category);
      }

      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  }, [title, description, category, schedule, createTask, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>

          {/* Title */}
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

          {/* Description */}
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Agrega más detalles..."
            placeholderTextColor={Colors.inputPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Category */}
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.pillRow}>
            {CATEGORIES.map(({ key, label, color }) => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.pill, active && { backgroundColor: color + '33', borderColor: color }]}
                  onPress={() => setCategory(active ? null : key)}
                >
                  <Text style={[styles.pillText, active && { color }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

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

          {/* Date preview */}
          <View style={styles.datePreview}>
            <Text style={styles.datePreviewText}>
              📅 {formatDate(resolveScheduleDate(schedule))}
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.button}
            />
            <Button
              title="Crear"
              onPress={handleCreate}
              loading={isLoading}
              disabled={!title.trim()}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    color: Colors.inputText,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 14,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
  },
  pillActive: {
    backgroundColor: Colors.secondary + '22',
    borderColor: Colors.secondary,
  },
  pillTextActive: {
    color: Colors.secondary,
  },
  datePreview: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.warning + '18',
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  datePreviewText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    color: Colors.warning,
  },
  error: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  button: {
    flex: 1,
  },
});
