import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useTasks } from '../context';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage from '../storage';
import type { UserCategory } from '../storage';

type CreateTaskScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: { params?: { categoryId?: string } };
};

// Builds a simple calendar grid for current/next month
function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DAY_NAMES   = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function isBeforeToday(d: Date) {
  const today = new Date(); today.setHours(0,0,0,0);
  return d < today;
}

export function CreateTaskScreen({ navigation, route }: CreateTaskScreenProps) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    route?.params?.categoryId ?? null
  );
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Calendar month navigation
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => {
    storage.getUserCategories().then(setUserCategories);
  }, []);

  const selectToday = useCallback(() => {
    setScheduledDate(new Date());
  }, []);

  const selectTomorrow = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setScheduledDate(d);
  }, []);

  const handleCalendarDay = useCallback((day: Date) => {
    setScheduledDate(day);
    setShowCalendar(false);
  }, []);

  const prevMonth = useCallback(() => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }, [calMonth]);

  const nextMonth = useCallback(() => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }, [calMonth]);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) { setError('El título es requerido'); return; }
    try {
      setIsLoading(true);
      setError(null);
      const dateLine = scheduledDate ? `📅 ${formatDisplayDate(scheduledDate)}\n` : '';
      const fullDescription = (dateLine + description.trim()) || undefined;
      const task = await createTask({ title: title.trim(), description: fullDescription });
      if (selectedCategory) await storage.setTaskCategory(task.id, selectedCategory);
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  }, [title, description, scheduledDate, selectedCategory, createTask, navigation]);

  const calDays = buildCalendarDays(calYear, calMonth);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
            placeholder="Agrega detalles..."
            placeholderTextColor={Colors.inputPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Date selection — manual only, no default */}
          <Text style={styles.label}>Fecha (opcional)</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateBtn, scheduledDate && isSameDay(scheduledDate, today) && styles.dateBtnActive]}
              onPress={selectToday}
            >
              <Text style={[styles.dateBtnText, scheduledDate && isSameDay(scheduledDate, today) && styles.dateBtnTextActive]}>
                Hoy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateBtn, (() => {
                const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                return scheduledDate && isSameDay(scheduledDate, tmrw) ? styles.dateBtnActive : null;
              })()]}
              onPress={selectTomorrow}
            >
              <Text style={[styles.dateBtnText, (() => {
                const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                return scheduledDate && isSameDay(scheduledDate, tmrw) ? styles.dateBtnTextActive : null;
              })()]}>
                Mañana
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowCalendar(true)}>
              <Text style={styles.dateBtnText}>📅 Calendario</Text>
            </TouchableOpacity>

            {scheduledDate && (
              <TouchableOpacity style={styles.dateClear} onPress={() => setScheduledDate(null)}>
                <Text style={styles.dateClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {scheduledDate && (
            <View style={styles.datePreview}>
              <Text style={styles.datePreviewText}>📅 {formatDisplayDate(scheduledDate)}</Text>
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

      {/* Calendar modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity style={styles.calOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <TouchableOpacity style={styles.calSheet} activeOpacity={1}>
            {/* Month nav */}
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                <Text style={styles.calNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonthLabel}>{MONTH_NAMES[calMonth]} {calYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                <Text style={styles.calNavText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day labels */}
            <View style={styles.calDayNames}>
              {DAY_NAMES.map((d) => (
                <Text key={d} style={styles.calDayName}>{d}</Text>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.calGrid}>
              {calDays.map((day, i) => {
                if (!day) return <View key={`empty-${i}`} style={styles.calCell} />;
                const past = isBeforeToday(day);
                const selected = scheduledDate && isSameDay(day, scheduledDate);
                const todayCell = isSameDay(day, today);
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.calCell,
                      todayCell && styles.calCellToday,
                      selected && styles.calCellSelected,
                      past && styles.calCellPast,
                    ]}
                    onPress={() => !past && handleCalendarDay(day)}
                    disabled={past}
                  >
                    <Text style={[
                      styles.calCellText,
                      todayCell && styles.calCellTodayText,
                      selected && styles.calCellSelectedText,
                      past && styles.calCellPastText,
                    ]}>
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.calClose} onPress={() => setShowCalendar(false)}>
              <Text style={styles.calCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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

  // Date buttons
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, alignItems: 'center' },
  dateBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 9,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
  },
  dateBtnActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  dateBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
  dateBtnTextActive: { color: Colors.secondary },
  dateClear: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.error + '20', alignItems: 'center', justifyContent: 'center',
  },
  dateClearText: { color: Colors.error, fontSize: 13 },
  datePreview: {
    marginTop: Spacing.sm, alignSelf: 'flex-start',
    backgroundColor: Colors.warning + '18', borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  datePreviewText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.warning },

  // Category pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm + 4, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
  },
  pillText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
  catDot: { width: 7, height: 7, borderRadius: 4 },

  error: {
    color: Colors.error, fontSize: FontSize.sm, fontFamily: FontFamily.body,
    textAlign: 'center', marginTop: Spacing.md,
  },
  buttons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  btn: { flex: 1 },

  // Calendar modal
  calOverlay: {
    flex: 1, backgroundColor: Colors.overlay,
    justifyContent: 'center', alignItems: 'center',
  },
  calSheet: {
    width: '88%', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.divider,
  },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  calNavBtn: { padding: Spacing.sm },
  calNavText: { fontSize: 22, color: Colors.secondary, fontFamily: FontFamily.headingBold },
  calMonthLabel: { fontSize: FontSize.md, fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
  calDayNames: { flexDirection: 'row', marginBottom: Spacing.xs },
  calDayName: {
    flex: 1, textAlign: 'center',
    fontSize: FontSize.xs, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, letterSpacing: 0.5,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calCellText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textPrimary },
  calCellToday: {
    borderWidth: 1, borderColor: Colors.secondary,
    borderRadius: Radius.full,
  },
  calCellTodayText: { color: Colors.secondary, fontFamily: FontFamily.headingSemiBold },
  calCellSelected: { backgroundColor: Colors.secondary, borderRadius: Radius.full },
  calCellSelectedText: { color: Colors.primary, fontFamily: FontFamily.headingBold },
  calCellPast: { opacity: 0.25 },
  calCellPastText: { color: Colors.textMuted },
  calClose: {
    marginTop: Spacing.md, paddingVertical: Spacing.sm,
    alignItems: 'center', borderTopWidth: 1, borderColor: Colors.divider,
  },
  calCloseText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
});
