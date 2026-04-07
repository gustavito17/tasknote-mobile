import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, Switch,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskCard, Loading, EmptyState, OfflineBanner } from '../components';
import { useTasks } from '../context';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage, { TaskCategory } from '../storage';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type CategoryFilter = 'todas' | TaskCategory;

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'trabajo', label: 'Trabajo' },
  { key: 'personal', label: 'Personal' },
  { key: 'urgente', label: 'Urgente' },
];

const CATEGORY_ACCENT: Record<string, string> = {
  trabajo: '#4FC3F7',
  personal: '#CE93D8',
  urgente: '#EF9A9A',
};

const isToday = (dateStr: string) =>
  new Date(dateStr).toDateString() === new Date().toDateString();

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { tasks, isLoading, fetchTasks, updateTaskStatus } = useTasks();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('todas');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<number, TaskCategory>>({});

  useFocusEffect(
    useCallback(() => {
      fetchTasks({ limit: 100 } as any);
      storage.getTaskCategories().then(setCategoryMap);
    }, [fetchTasks])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks({ limit: 100 } as any);
    const map = await storage.getTaskCategories();
    setCategoryMap(map);
    setRefreshing(false);
  }, [fetchTasks]);

  const handleToggleStatus = useCallback((task: Task) => {
    updateTaskStatus(task.id, task.status === 'pending' ? 'completed' : 'pending');
  }, [updateTaskStatus]);

  const handleTaskPress = useCallback((task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  }, [navigation]);

  // Apply category filter locally
  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter === 'todas') return true;
    return categoryMap[t.id] === categoryFilter;
  });

  // Split into sections
  const todayTasks = filteredTasks.filter((t) => isToday(t.createdAt));
  const olderTasks = filteredTasks.filter((t) => !isToday(t.createdAt));

  const sections = [
    ...(todayTasks.length > 0 ? [{ title: 'Tareas de hoy', data: todayTasks }] : []),
    ...(olderTasks.length > 0 ? [{ title: 'Anteriores', data: olderTasks }] : []),
  ];

  if (isLoading === 'loading' && tasks.length === 0) {
    return <Loading message="Cargando tareas..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tareas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateTask')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Scroll toggle */}
      <View style={styles.scrollToggleRow}>
        <Text style={styles.scrollToggleLabel}>Scroll</Text>
        <Switch
          value={scrollEnabled}
          onValueChange={setScrollEnabled}
          trackColor={{ false: Colors.divider, true: Colors.secondary + '66' }}
          thumbColor={scrollEnabled ? Colors.secondary : Colors.textMuted}
        />
        <Text style={styles.scrollToggleValue}>{scrollEnabled ? 'Activo' : 'Inactivo'}</Text>
      </View>

      {/* Category pills */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map(({ key, label }) => {
          const isActive = categoryFilter === key;
          const accent = key !== 'todas' ? CATEGORY_ACCENT[key] : Colors.secondary;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryPill,
                isActive && { backgroundColor: accent + '33', borderColor: accent },
              ]}
              onPress={() => setCategoryFilter(key)}
            >
              <Text style={[styles.categoryPillText, isActive && { color: accent }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="Sin tareas"
          message={
            categoryFilter === 'todas'
              ? 'Crea tu primera tarea'
              : `No hay tareas en "${categoryFilter}"`
          }
          actionLabel="Crear Tarea"
          onAction={() => navigation.navigate('CreateTask')}
        />
      ) : (
        <SectionList
          sections={sections}
          scrollEnabled={scrollEnabled}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => handleTaskPress(item)}
              onToggleStatus={() => handleToggleStatus(item)}
              category={categoryMap[item.id]}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionDivider} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.secondary}
            />
          }
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 24,
    fontFamily: FontFamily.headingBold,
    lineHeight: 27,
  },
  scrollToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  scrollToggleLabel: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
  },
  scrollToggleValue: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  categoryPillText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
