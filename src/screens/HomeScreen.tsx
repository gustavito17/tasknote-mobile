import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Modal, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OfflineBanner } from '../components';
import { useTasks } from '../context';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage from '../storage';
import type { UserCategory } from '../storage';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const PALETTE = ['#4FC3F7', '#CE93D8', '#FFCC80', '#80CBC4', '#EF9A9A', '#A5D6A7', '#FFD54F', '#90CAF9'];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { tasks, fetchTasks } = useTasks();
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  // New folder modal
  const [showModal, setShowModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);

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

  const handleAddFolder = useCallback(async () => {
    const label = newLabel.trim();
    if (!label) return;
    const newCat: UserCategory = { id: `cat_${Date.now()}`, label, color: newColor };
    const updated = [...userCategories, newCat];
    await storage.setUserCategories(updated);
    setUserCategories(updated);
    setNewLabel('');
    setNewColor(PALETTE[0]);
    setShowModal(false);
  }, [newLabel, newColor, userCategories]);

  const handleDeleteFolder = useCallback((catId: string) => {
    Alert.alert('Eliminar carpeta', '¿Eliminar esta carpeta? Las tareas no se borrarán.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const updated = userCategories.filter((c) => c.id !== catId);
          await storage.setUserCategories(updated);
          setUserCategories(updated);
        },
      },
    ]);
  }, [userCategories]);

  // Task counts per category
  const countForCategory = (catId: string) =>
    tasks.filter((t) => categoryMap[t.id] === catId).length;

  const pendingForCategory = (catId: string) =>
    tasks.filter((t) => categoryMap[t.id] === catId && t.status === 'pending').length;

  // Uncategorized tasks
  const uncategorizedCount = tasks.filter((t) => !categoryMap[t.id]).length;
  const uncategorizedPending = tasks.filter((t) => !categoryMap[t.id] && t.status === 'pending').length;

  const folders: (UserCategory | { id: '__none__'; label: string; color: string })[] = [
    ...userCategories,
    ...(uncategorizedCount > 0
      ? [{ id: '__none__' as const, label: 'Sin carpeta', color: Colors.textMuted }]
      : []),
  ];

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <View style={styles.header}>
        <Text style={styles.title}>GusPad</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Carpeta</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin carpetas</Text>
            <Text style={styles.emptyText}>Toca "+ Carpeta" para crear tu primera carpeta</Text>
          </View>
        }
        renderItem={({ item }) => {
          const total = item.id === '__none__' ? uncategorizedCount : countForCategory(item.id);
          const pending = item.id === '__none__' ? uncategorizedPending : pendingForCategory(item.id);
          return (
            <TouchableOpacity
              style={styles.folderCard}
              onPress={() => navigation.navigate('FolderDetail', {
                categoryId: item.id,
                categoryLabel: item.label,
                categoryColor: item.color,
              })}
              onLongPress={() => item.id !== '__none__' && handleDeleteFolder(item.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.folderIcon, { backgroundColor: item.color + '25' }]}>
                <Text style={styles.folderEmoji}>📁</Text>
              </View>
              <View style={styles.folderInfo}>
                <Text style={styles.folderLabel}>{item.label}</Text>
                <Text style={styles.folderCount}>
                  {pending} pendiente{pending !== 1 ? 's' : ''} · {total} total
                </Text>
              </View>
              <View style={[styles.folderAccent, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          );
        }}
      />

      {/* New folder modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Nueva carpeta</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la carpeta"
              placeholderTextColor={Colors.inputPlaceholder}
              value={newLabel}
              onChangeText={setNewLabel}
              autoFocus
            />

            <Text style={styles.sheetLabel}>Color</Text>
            <View style={styles.palette}>
              {PALETTE.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorCircle, { backgroundColor: color }, newColor === color && styles.colorCircleActive]}
                  onPress={() => setNewColor(color)}
                />
              ))}
            </View>

            <View style={styles.sheetButtons}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => { setShowModal(false); setNewLabel(''); }}
              >
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, !newLabel.trim() && { opacity: 0.4 }]}
                onPress={handleAddFolder}
                disabled={!newLabel.trim()}
              >
                <Text style={styles.btnPrimaryText}>Crear</Text>
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
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl, fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary, letterSpacing: 0.5,
  },
  addBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.secondary,
  },
  addBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.secondary },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted, textAlign: 'center' },
  folderCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.divider, overflow: 'hidden',
  },
  folderIcon: {
    width: 48, height: 48, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  folderEmoji: { fontSize: 24 },
  folderInfo: { flex: 1 },
  folderLabel: {
    fontSize: FontSize.md, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary, marginBottom: 3,
  },
  folderCount: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted },
  folderAccent: { width: 4, height: '100%', borderRadius: 2, position: 'absolute', right: 0 },
  // Modal
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.lg, paddingBottom: Spacing.xxl, borderTopWidth: 1, borderColor: Colors.divider,
  },
  sheetTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary, marginBottom: Spacing.md },
  input: {
    backgroundColor: Colors.inputBackground, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSize.md, fontFamily: FontFamily.body,
    color: Colors.inputText, borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: Spacing.md,
  },
  sheetLabel: {
    fontSize: FontSize.xs, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.sm,
  },
  palette: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.lg },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  colorCircleActive: { borderWidth: 3, borderColor: Colors.textPrimary },
  sheetButtons: { flexDirection: 'row', gap: Spacing.sm },
  btnPrimary: {
    flex: 1, backgroundColor: Colors.secondary,
    borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center',
  },
  btnPrimaryText: { fontSize: FontSize.md, fontFamily: FontFamily.headingSemiBold, color: Colors.primary },
  btnSecondary: {
    flex: 1, borderWidth: 1, borderColor: Colors.divider,
    borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center',
  },
  btnSecondaryText: { fontSize: FontSize.md, fontFamily: FontFamily.headingSemiBold, color: Colors.textMuted },
});
