import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, RefreshControl,
  TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Loading } from '../components';
import { TaskRow, FolderTag, parseDateBadge } from '../components/TaskRow';
import { useTasks } from '../context';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage, { UserCategory } from '../storage';

// ─── Calendar helpers (same as CreateTaskScreen) ────────────────────────────

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DAY_NAMES   = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

// ─── Date parsing ────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
};

function parseDisplayDate(str: string): Date | null {
  const m = str.match(/(\d{1,2})\s+(\w+)/);
  if (!m) return null;
  const day = parseInt(m[1]);
  const mo = MONTH_MAP[m[2].toLowerCase().replace('.', '')];
  if (mo === undefined) return null;
  const now = new Date();
  let year = now.getFullYear();
  const d = new Date(year, mo, day);
  if (now.getTime() - d.getTime() > 60 * 24 * 60 * 60 * 1000) year += 1;
  return new Date(year, mo, day);
}

function sectionLabel(dateStr: string): string {
  const d = parseDisplayDate(dateStr);
  if (!d) return dateStr;
  const today = new Date();
  const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
  if (isSameDay(d, today)) return `Hoy · ${dateStr}`;
  if (isSameDay(d, tmrw)) return `Mañana · ${dateStr}`;
  return dateStr;
}

// ─── Section type ─────────────────────────────────────────────────────────────

interface Section {
  title: string;
  sortKey: number;
  data: Task[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FechasScreen() {
  const { tasks, isLoading, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMode, setCalMode] = useState<'calendar' | 'picker'>('calendar');
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const YEARS = Array.from({ length: 12 }, (_, i) => today.getFullYear() - i);

  const loadData = useCallback(async () => {
    const [map, cats] = await Promise.all([
      storage.getTaskCategoryMap(),
      storage.getUserCategories(),
    ]);
    setCategoryMap(map);
    setUserCategories(cats);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchTasks({ limit: 100 });
    await loadData();
    setRefreshing(false);
  }, [fetchTasks, loadData]);

  const handleToggle = useCallback((task: Task) => {
    updateTaskStatus(task.id, task.status === 'pending' ? 'completed' : 'pending');
  }, [updateTaskStatus]);

  const handleDelete = useCallback(async (task: Task) => {
    await deleteTask(task.id);
    await storage.setTaskCategory(task.id, null);
  }, [deleteTask]);

  const getFolderTag = (task: Task): FolderTag | undefined => {
    const catId = categoryMap[task.id];
    if (!catId) return undefined;
    const cat = userCategories.find((c) => c.id === catId);
    return cat ? { label: cat.label, color: cat.color } : undefined;
  };

  // Calendar navigation
  const prevMonth = useCallback(() => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }, [calMonth]);

  const nextMonth = useCallback(() => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }, [calMonth]);

  const handleCalendarDay = useCallback((day: Date) => {
    setFilterDate(day);
    setShowCalendar(false);
  }, []);

  const clearFilter = useCallback(() => setFilterDate(null), []);

  const selectToday = useCallback(() => setFilterDate(new Date()), []);
  const selectTomorrow = useCallback(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    setFilterDate(d);
  }, []);

  // Build sections from tasks
  const grouped = new Map<string, { sortKey: number; tasks: Task[] }>();
  const noDate: Task[] = [];

  tasks.forEach((task) => {
    const { date } = parseDateBadge(task.description ?? null);
    if (!date) { noDate.push(task); return; }
    if (!grouped.has(date)) {
      const parsed = parseDisplayDate(date);
      grouped.set(date, { sortKey: parsed?.getTime() ?? Infinity, tasks: [] });
    }
    grouped.get(date)!.tasks.push(task);
  });

  const allSections: Section[] = [...grouped.entries()]
    .sort(([, a], [, b]) => a.sortKey - b.sortKey)
    .map(([dateStr, { sortKey, tasks: t }]) => ({
      title: sectionLabel(dateStr),
      sortKey,
      data: [...t.filter(x => x.status === 'pending'), ...t.filter(x => x.status === 'completed')],
    }));

  if (noDate.length > 0) {
    allSections.push({
      title: 'Sin fecha',
      sortKey: Infinity,
      data: [...noDate.filter(x => x.status === 'pending'), ...noDate.filter(x => x.status === 'completed')],
    });
  }

  // Apply date filter
  const sections = filterDate
    ? allSections.filter(s => {
        if (s.sortKey === Infinity) return false;
        const d = new Date(s.sortKey);
        return isSameDay(d, filterDate);
      })
    : allSections;

  const calDays = buildCalendarDays(calYear, calMonth);
  const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
  const isTodayFilter = filterDate && isSameDay(filterDate, today);
  const isTmrwFilter  = filterDate && isSameDay(filterDate, tmrw);

  if (isLoading === 'loading' && tasks.length === 0) {
    return <Loading message="Cargando..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GusPad</Text>
        {filterDate && (
          <TouchableOpacity onPress={clearFilter} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Mostrar todo ✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips — igual ancho, centrados */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, !filterDate && styles.chipActive]}
          onPress={clearFilter}
        >
          <Text style={[styles.chipText, !filterDate && styles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, isTodayFilter && styles.chipActive]}
          onPress={selectToday}
        >
          <Text style={[styles.chipText, isTodayFilter && styles.chipTextActive]}>Hoy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, isTmrwFilter && styles.chipActive]}
          onPress={selectTomorrow}
        >
          <Text style={[styles.chipText, isTmrwFilter && styles.chipTextActive]}>Mañana</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, filterDate && !isTodayFilter && !isTmrwFilter && styles.chipActive]}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={[styles.chipText, filterDate && !isTodayFilter && !isTmrwFilter && styles.chipTextActive]}>
            {filterDate && !isTodayFilter && !isTmrwFilter
              ? filterDate.toLocaleDateString('es', { day: 'numeric', month: 'short' })
              : 'Fecha'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {filterDate ? 'Sin tareas para este día' : 'Sin tareas con fecha'}
          </Text>
          <Text style={styles.emptyText}>
            {filterDate
              ? 'Probá otro día o limpiá el filtro'
              : 'Crea tareas con fecha para verlas aquí'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TaskRow
              task={item}
              onToggle={() => handleToggle(item)}
              onDelete={() => handleDelete(item)}
              folderTag={getFolderTag(item)}
            />
          )}
        />
      )}

      {/* Calendar modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity
          style={styles.calOverlay}
          activeOpacity={1}
          onPress={() => { setShowCalendar(false); setCalMode('calendar'); }}
        >
          <TouchableOpacity style={styles.calSheet} activeOpacity={1}>

            {/* ── Header: flechas + toque en mes/año abre picker ── */}
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
              /* ── Picker de mes y año ── */
              <>
                {/* Años: scroll horizontal */}
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
                      <Text style={[styles.yearChipText, calYear === y && styles.yearChipTextActive]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Meses: cuadrícula 3×4 — al tocar mes vuelve al calendario */}
                <View style={styles.monthGrid}>
                  {MONTH_NAMES.map((name, idx) => (
                    <TouchableOpacity
                      key={name}
                      style={[styles.monthChip, calMonth === idx && styles.monthChipActive]}
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
              /* ── Vista de días ── */
              <>
                {/* Nombres de día */}
                <View style={[styles.calRow, styles.calDayNamesRow]}>
                  {DAY_NAMES.map((d) => (
                    <View key={d} style={styles.calCell}>
                      <Text style={styles.calDayName}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Cuadrícula de días */}
                {Array.from({ length: Math.ceil(calDays.length / 7) }).map((_, rowIdx) => (
                  <View key={rowIdx} style={styles.calRow}>
                    {calDays.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, ci) => {
                      if (!day) return <View key={`e-${rowIdx}-${ci}`} style={styles.calCell} />;
                      const selected = filterDate && isSameDay(day, filterDate);
                      const isToday  = isSameDay(day, today);
                      return (
                        <TouchableOpacity
                          key={day.toISOString()}
                          style={[styles.calCell, isToday && styles.calCellToday, selected && styles.calCellSelected]}
                          onPress={() => handleCalendarDay(day)}
                        >
                          <Text style={[
                            styles.calCellText,
                            isToday && styles.calCellTodayText,
                            selected && styles.calCellSelectedText,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  clearBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.error + '18',
  },
  clearBtnText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.error,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.secondary + '22',
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  chipTextActive: { color: Colors.secondary },

  // List
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  sectionTitle: {
    flex: 1,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
  },
  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // ── Calendar modal ────────────────────────────────────────────────────────
  calOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calSheet: {
    width: '90%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.divider,
  },

  // Header
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  calNavBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  calNavText: { fontSize: 24, color: Colors.secondary, fontFamily: FontFamily.headingBold },
  calMonthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  calMonthLabel: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
  },
  calMonthCaret: {
    fontSize: 10,
    color: Colors.secondary,
    lineHeight: 16,
  },

  // Day names + grid rows
  calDayNamesRow: { marginBottom: 2 },
  calRow: {
    flexDirection: 'row',
  },
  calCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayName: {
    fontSize: 11,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  calCellText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    color: Colors.textPrimary,
  },
  calCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 20,
    width: 34,
    height: 34,
  },
  calCellTodayText: { color: Colors.secondary, fontFamily: FontFamily.headingSemiBold },
  calCellSelected: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    width: 34,
    height: 34,
  },
  calCellSelectedText: { color: Colors.primary, fontFamily: FontFamily.headingBold },

  // ── Month/year picker ──────────────────────────────────────────────────────
  yearRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
  },
  yearChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  yearChipActive: {
    backgroundColor: Colors.secondary + '22',
    borderColor: Colors.secondary,
  },
  yearChipText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
  },
  yearChipTextActive: { color: Colors.secondary },

  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  monthChip: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  monthChipActive: {},
  monthChipText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  monthChipTextActive: {
    color: Colors.primary,
    backgroundColor: Colors.secondary,
  },

  // Close button
  calClose: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Colors.divider,
  },
  calCloseText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
  },
});
