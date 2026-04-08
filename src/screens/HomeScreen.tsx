import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList,
  TouchableOpacity, RefreshControl, Modal,
  TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskCard, Loading, EmptyState, OfflineBanner } from '../components';
import { useTasks } from '../context';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage from '../storage';
import type { UserCategory } from '../storage';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const PALETTE = ['#4FC3F7', '#CE93D8', '#FFCC80', '#80CBC4', '#EF9A9A', '#A5D6A7', '#FFD54F', '#90CAF9'];

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { tasks, isLoading, fetchTasks, updateTaskStatus } = useTasks();
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Category manager modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatColor, setNewCatColor] = useState(PALETTE[0]);

  const loadData = useCallback(async () => {
    fetchTasks({ limit: 100 } as any);
    const [map, cats] = await Promise.all([
      storage.getTaskCategoryMap(),
      storage.getUserCategories(),
    ]);
    setCategoryMap(map);
    setUserCategories(cats);
  }, [fetchTasks]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleToggleStatus = useCallback((task: Task) => {
    updateTaskStatus(task.id, task.status === 'pending' ? 'completed' : 'pending');
  }, [updateTaskStatus]);

  // ── Category CRUD ───────────────────────────────────────────────────────────
  const handleAddCategory = useCallback(async () => {
    const label = newCatLabel.trim();
    if (!label) return;
    const newCat: UserCategory = {
      id: `cat_${Date.now()}`,
      label,
      color: newCatColor,
    };
    const updated = [...userCategories, newCat];
    await storage.setUserCategories(updated);
    setUserCategories(updated);
    setNewCatLabel('');
    setNewCatColor(PALETTE[0]);
  }, [newCatLabel, newCatColor, userCategories]);

  const handleDeleteCategory = useCallback((catId: string) => {
    Alert.alert('Eliminar categoría', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const updated = userCategories.filter((c) => c.id !== catId);
          await storage.setUserCategories(updated);
          setUserCategories(updated);
          if (categoryFilter === catId) setCategoryFilter('todas');
        },
      },
    ]);
  }, [userCategories, categoryFilter]);

  // ── Filtered + sectioned tasks ──────────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    if (categoryFilter === 'todas') return true;
    return categoryMap[t.id] === categoryFilter;
  });

  const todayTasks = filtered.filter((t) => isToday(t.createdAt));
  const olderTasks = filtered.filter((t) => !isToday(t.createdAt));

  const sections = [
    ...(todayTasks.length > 0 ? [{ title: 'Tareas de hoy', data: todayTasks }] : []),
    ...(olderTasks.length > 0 ? [{ title: 'Anteriores', data: olderTasks }] : []),
  ];

  const getCategoryById = (id: string) => userCategories.find((c) => c.id === id);

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

      {/* Category filter row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.pill, categoryFilter === 'todas' && styles.pillActive]}
          onPress={() => setCategoryFilter('todas')}
        >
          <Text style={[styles.pillText, categoryFilter === 'todas' && styles.pillTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>

        {userCategories.map((cat) => {
          const active = categoryFilter === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, active && { backgroundColor: cat.color + '30', borderColor: cat.color }]}
              onPress={() => setCategoryFilter(cat.id)}
              onLongPress={() => handleDeleteCategory(cat.id)}
            >
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.pillText, active && { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.pillAdd} onPress={() => setShowCatModal(true)}>
          <Text style={styles.pillAddText}>+ Carpeta</Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Sin tareas"
          message={categoryFilter === 'todas' ? 'Crea tu primera tarea' : 'No hay tareas en esta carpeta'}
          actionLabel="Crear Tarea"
          onAction={() => navigation.navigate('CreateTask')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
              onToggleStatus={() => handleToggleStatus(item)}
              category={getCategoryById(categoryMap[item.id])}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionLine} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
          }
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Category manager modal */}
      <Modal visible={showCatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Nueva carpeta</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la carpeta"
              placeholderTextColor={Colors.inputPlaceholder}
              value={newCatLabel}
              onChangeText={setNewCatLabel}
              autoFocus
            />

            <Text style={styles.modalSubtitle}>Color</Text>
            <View style={styles.paletteRow}>
              {PALETTE.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.paletteCircle, { backgroundColor: color }, newCatColor === color && styles.paletteCircleActive]}
                  onPress={() => setNewCatColor(color)}
                />
              ))}
            </View>

            {/* Existing categories */}
            {userCategories.length > 0 && (
              <>
                <Text style={styles.modalSubtitle}>Carpetas existentes</Text>
                {userCategories.map((cat) => (
                  <View key={cat.id} style={styles.catRow}>
                    <View style={[styles.catRowDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.catRowLabel}>{cat.label}</Text>
                    <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)}>
                      <Text style={styles.catRowDelete}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowCatModal(false)}>
                <Text style={styles.modalBtnSecondaryText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnPrimary, !newCatLabel.trim() && { opacity: 0.4 }]}
                onPress={handleAddCategory}
                disabled={!newCatLabel.trim()}
              >
                <Text style={styles.modalBtnPrimaryText}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl, fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary, letterSpacing: 0.5,
  },
  addButton: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.primary, fontSize: 24, fontFamily: FontFamily.headingBold, lineHeight: 27,
  },
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.xs,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
  },
  pillActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  pillText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
  pillTextActive: { color: Colors.secondary },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  pillAdd: {
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.secondary + '55', borderStyle: 'dashed',
  },
  pillAddText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.secondary },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: Spacing.sm, gap: Spacing.sm,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  sectionTitle: {
    fontSize: FontSize.xs, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.lg, paddingBottom: Spacing.xxl,
    borderTopWidth: 1, borderColor: Colors.divider,
  },
  modalTitle: {
    fontSize: FontSize.lg, fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.inputBackground, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSize.md, fontFamily: FontFamily.body,
    color: Colors.inputText, borderWidth: 1, borderColor: Colors.inputBorder,
    marginBottom: Spacing.md,
  },
  modalSubtitle: {
    fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: Spacing.sm,
  },
  paletteRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.md },
  paletteCircle: { width: 30, height: 30, borderRadius: 15 },
  paletteCircleActive: { borderWidth: 3, borderColor: Colors.textPrimary },
  catRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  catRowDot: { width: 10, height: 10, borderRadius: 5 },
  catRowLabel: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.body, color: Colors.textPrimary },
  catRowDelete: { fontSize: FontSize.md, color: Colors.error, paddingHorizontal: Spacing.xs },
  modalButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  modalBtnPrimary: {
    flex: 1, backgroundColor: Colors.secondary,
    borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: FontSize.md, fontFamily: FontFamily.headingSemiBold, color: Colors.primary,
  },
  modalBtnSecondary: {
    flex: 1, borderWidth: 1, borderColor: Colors.divider,
    borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontSize: FontSize.md, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted,
  },
});
