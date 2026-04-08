import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useTasks } from '../context';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage from '../storage';

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
  const categoryId = route?.params?.categoryId ?? null;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [folderLabel, setFolderLabel] = useState<string | null>(null);
  const [folderColor, setFolderColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMode, setCalMode] = useState<'calendar' | 'picker'>('calendar');

  // Calendar month navigation
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const YEARS = Array.from({ length: 12 }, (_, i) => today.getFullYear() - 2 + i);

  useEffect(() => {
    if (categoryId) {
      storage.getUserCategories().then((cats) => {
        const cat = cats.find((c) => c.id === categoryId);
        if (cat) { setFolderLabel(cat.label); setFolderColor(cat.color); }
      });
    }
  }, [categoryId]);

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
      if (categoryId) await storage.setTaskCategory(task.id, categoryId);
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  }, [title, description, scheduledDate, categoryId, createTask, navigation]);

  const calDays = buildCalendarDays(calYear, calMonth);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Header custom — igual a FolderDetailScreen */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {folderColor && <View style={[styles.headerDot, { backgroundColor: folderColor }]} />}
          <Text style={styles.headerTitle}>Nueva Tarea</Text>
        </View>
        {/* Carpeta identificada automáticamente */}
        {folderLabel && folderColor && (
          <View style={[styles.folderBadge, { backgroundColor: folderColor + '25', borderColor: folderColor + '60' }]}>
            <Text style={[styles.folderBadgeText, { color: folderColor }]}>{folderLabel}</Text>
          </View>
        )}
      </View>

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
          {(() => {
            const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
            const isTodayActive   = !!scheduledDate && isSameDay(scheduledDate, today);
            const isTmrwActive    = !!scheduledDate && isSameDay(scheduledDate, tmrw);
            const isCalActive     = !!scheduledDate && !isTodayActive && !isTmrwActive;
            return (
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.dateBtn, isTodayActive && styles.dateBtnActive]}
                  onPress={selectToday}
                >
                  <Text style={[styles.dateBtnText, isTodayActive && styles.dateBtnTextActive]}>Hoy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateBtn, isTmrwActive && styles.dateBtnActive]}
                  onPress={selectTomorrow}
                >
                  <Text style={[styles.dateBtnText, isTmrwActive && styles.dateBtnTextActive]}>Mañana</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateBtn, isCalActive && styles.dateBtnActive]}
                  onPress={() => setShowCalendar(true)}
                >
                  <Text style={[styles.dateBtnText, isCalActive && styles.dateBtnTextActive]}>
                    {isCalActive
                      ? scheduledDate!.toLocaleDateString('es', { day: 'numeric', month: 'short' })
                      : 'Fecha'}
                  </Text>
                </TouchableOpacity>
                {scheduledDate && (
                  <TouchableOpacity style={styles.dateClear} onPress={() => setScheduledDate(null)}>
                    <Text style={styles.dateClearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}

          {scheduledDate && (
            <View style={styles.datePreview}>
              <Text style={styles.datePreviewText}>{formatDisplayDate(scheduledDate)}</Text>
            </View>
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
        <TouchableOpacity
          style={styles.calOverlay}
          activeOpacity={1}
          onPress={() => { setShowCalendar(false); setCalMode('calendar'); }}
        >
          <TouchableOpacity style={styles.calSheet} activeOpacity={1}>

            {/* Header: flechas + toque en mes/año abre picker */}
            <View style={styles.calHeader}>
              {calMode === 'calendar' && (
                <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                  <Text style={styles.calNavText}>‹</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.calMonthBtn}
                onPress={() => setCalMode(m => m === 'picker' ? 'calendar' : 'picker')}
              >
                <Text style={styles.calMonthLabel}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                <Text style={styles.calMonthCaret}>{calMode === 'picker' ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {calMode === 'calendar' && (
                <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                  <Text style={styles.calNavText}>›</Text>
                </TouchableOpacity>
              )}
            </View>

            {calMode === 'picker' ? (
              <>
                {/* Años */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.yearRow}
                >
                  {YEARS.map(y => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearChip, calYear === y && styles.yearChipActive]}
                      onPress={() => setCalYear(y)}
                    >
                      <Text style={[styles.yearChipText, calYear === y && styles.yearChipTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Meses 3×4 */}
                <View style={styles.monthGrid}>
                  {MONTH_NAMES.map((name, idx) => (
                    <TouchableOpacity
                      key={name}
                      style={styles.monthChip}
                      onPress={() => { setCalMonth(idx); setCalMode('calendar'); }}
                    >
                      <Text style={[styles.monthChipText, calMonth === idx && styles.monthChipTextActive]}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                {/* Nombres de día */}
                <View style={styles.calRow}>
                  {DAY_NAMES.map((d) => (
                    <View key={d} style={styles.calCell}>
                      <Text style={styles.calDayName}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Días: fila por fila */}
                {Array.from({ length: Math.ceil(calDays.length / 7) }).map((_, rowIdx) => (
                  <View key={rowIdx} style={styles.calRow}>
                    {calDays.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, ci) => {
                      if (!day) return <View key={`e-${rowIdx}-${ci}`} style={styles.calCell} />;
                      const past     = isBeforeToday(day);
                      const selected = scheduledDate && isSameDay(day, scheduledDate);
                      const isToday  = isSameDay(day, today);
                      return (
                        <TouchableOpacity
                          key={day.toISOString()}
                          style={[styles.calCell, isToday && styles.calCellToday, selected && styles.calCellSelected, past && styles.calCellPast]}
                          onPress={() => !past && handleCalendarDay(day)}
                          disabled={past}
                        >
                          <Text style={[
                            styles.calCellText,
                            isToday && styles.calCellTodayText,
                            selected && styles.calCellSelectedText,
                            past && styles.calCellPastText,
                          ]}>
                            {day.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity
              style={styles.calClose}
              onPress={() => { setShowCalendar(false); setCalMode('calendar'); }}
            >
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

  // Header — mismo patrón que FolderDetailScreen
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.xxl, paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.xs,
  },
  backText: {
    fontSize: 22, color: Colors.secondary, fontFamily: FontFamily.headingBold,
    includeFontPadding: false, textAlignVertical: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
  folderBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1,
  },
  folderBadgeText: { fontSize: FontSize.xs, fontFamily: FontFamily.headingSemiBold },

  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
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

  // Date buttons — igual ancho, centrados
  dateRow: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
  dateBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  dateBtnActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  dateBtnText: {
    fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, textAlign: 'center',
    includeFontPadding: false,
  },
  dateBtnTextActive: { color: Colors.secondary },
  dateClear: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.error + '18', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dateClearText: { color: Colors.error, fontSize: 13, includeFontPadding: false },
  datePreview: {
    marginTop: Spacing.sm, alignSelf: 'flex-start',
    backgroundColor: Colors.secondary + '18', borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  datePreviewText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.secondary },

  error: {
    color: Colors.error, fontSize: FontSize.sm, fontFamily: FontFamily.body,
    textAlign: 'center', marginTop: Spacing.md,
  },
  buttons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  btn: { flex: 1 },

  // ── Calendar modal (igual a FechasScreen) ────────────────────────────────
  calOverlay: {
    flex: 1, backgroundColor: Colors.overlay,
    justifyContent: 'center', alignItems: 'center',
  },
  calSheet: {
    width: '90%', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md, paddingBottom: Spacing.xs,
    borderWidth: 1, borderColor: Colors.divider,
  },
  calHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.sm,
  },
  calNavBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  calNavText: { fontSize: 24, color: Colors.secondary, fontFamily: FontFamily.headingBold },
  calMonthBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: Spacing.xs,
  },
  calMonthLabel: { fontSize: FontSize.md, fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
  calMonthCaret: { fontSize: 10, color: Colors.secondary, lineHeight: 16 },
  calRow: { flexDirection: 'row' },
  calCell: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
  calDayName: {
    fontSize: 11, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, textAlign: 'center', letterSpacing: 0.3,
  },
  calCellText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textPrimary },
  calCellToday: { borderWidth: 1.5, borderColor: Colors.secondary, borderRadius: 20, width: 34, height: 34 },
  calCellTodayText: { color: Colors.secondary, fontFamily: FontFamily.headingSemiBold },
  calCellSelected: { backgroundColor: Colors.secondary, borderRadius: 20, width: 34, height: 34 },
  calCellSelectedText: { color: Colors.primary, fontFamily: FontFamily.headingBold },
  calCellPast: { opacity: 0.2 },
  calCellPastText: { color: Colors.textMuted },

  // Picker
  yearRow: { flexDirection: 'row', gap: Spacing.xs, paddingVertical: Spacing.sm, paddingHorizontal: 2 },
  yearChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  yearChipActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  yearChipText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
  yearChipTextActive: { color: Colors.secondary },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm, marginBottom: Spacing.xs },
  monthChip: { width: '33.33%', alignItems: 'center', paddingVertical: Spacing.sm },
  monthChipText: {
    fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, overflow: 'hidden',
  },
  monthChipTextActive: { color: Colors.primary, backgroundColor: Colors.secondary },

  calClose: {
    marginTop: Spacing.sm, paddingVertical: Spacing.sm,
    alignItems: 'center', borderTopWidth: 1, borderColor: Colors.divider,
  },
  calCloseText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
});
