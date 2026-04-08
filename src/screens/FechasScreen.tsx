import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Loading } from '../components';
import { TaskRow, FolderTag, parseDateBadge } from '../components/TaskRow';
import { useTasks } from '../context';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage, { UserCategory } from '../storage';

const MONTH_MAP: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
};

function parseDisplayDate(str: string): Date | null {
  // format: "lun., 7 abr." or "mar., 8 abr."
  const m = str.match(/(\d{1,2})\s+(\w+)/);
  if (!m) return null;
  const day = parseInt(m[1]);
  const mo = MONTH_MAP[m[2].toLowerCase().replace('.', '')];
  if (mo === undefined) return null;
  const now = new Date();
  let year = now.getFullYear();
  const d = new Date(year, mo, day);
  // If that date is more than 60 days in the past, assume next year
  if (now.getTime() - d.getTime() > 60 * 24 * 60 * 60 * 1000) year += 1;
  return new Date(year, mo, day);
}

function isToday(dateStr: string): boolean {
  const d = parseDisplayDate(dateStr);
  if (!d) return false;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function isTomorrow(dateStr: string): boolean {
  const d = parseDisplayDate(dateStr);
  if (!d) return false;
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  return d.toDateString() === tmrw.toDateString();
}

function sectionLabel(dateStr: string): string {
  if (isToday(dateStr)) return `Hoy · ${dateStr}`;
  if (isTomorrow(dateStr)) return `Mañana · ${dateStr}`;
  return dateStr;
}

interface Section {
  title: string;
  sortKey: number;
  data: Task[];
}

export function FechasScreen() {
  const { tasks, isLoading, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    // Tasks already in context from HomeScreen fetch — only reload local storage
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

  // Group tasks by date string
  const grouped = new Map<string, { sortKey: number; tasks: Task[] }>();
  const noDate: Task[] = [];

  tasks.forEach((task) => {
    const { date } = parseDateBadge(task.description ?? null);
    if (!date) {
      noDate.push(task);
      return;
    }
    if (!grouped.has(date)) {
      const parsed = parseDisplayDate(date);
      grouped.set(date, { sortKey: parsed?.getTime() ?? Infinity, tasks: [] });
    }
    grouped.get(date)!.tasks.push(task);
  });

  const sections: Section[] = [...grouped.entries()]
    .sort(([, a], [, b]) => a.sortKey - b.sortKey)
    .map(([dateStr, { sortKey, tasks: t }]) => ({
      title: sectionLabel(dateStr),
      sortKey,
      data: [...t.filter((x) => x.status === 'pending'), ...t.filter((x) => x.status === 'completed')],
    }));

  if (noDate.length > 0) {
    sections.push({
      title: 'Sin fecha',
      sortKey: Infinity,
      data: [...noDate.filter((x) => x.status === 'pending'), ...noDate.filter((x) => x.status === 'completed')],
    });
  }

  if (isLoading === 'loading' && tasks.length === 0) {
    return <Loading message="Cargando..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Por fechas</Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin tareas</Text>
          <Text style={styles.emptyText}>Crea tareas con fecha para verlas aquí</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
          }
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted, textAlign: 'center' },
});
