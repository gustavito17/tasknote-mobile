import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskCard, Loading, EmptyState, OfflineBanner } from '../components';
import { useTasks } from '../context';
import { Task } from '../types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type FilterType = 'all' | 'pending' | 'completed';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { tasks, isLoading, fetchTasks, updateTaskStatus } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTasks(filter === 'all' ? undefined : { status: filter });
    }, [filter, fetchTasks])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks(filter === 'all' ? undefined : { status: filter });
    setRefreshing(false);
  }, [filter]);

  const handleToggleStatus = useCallback((task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    updateTaskStatus(task.id, newStatus);
  }, []);

  const handleTaskPress = useCallback((task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  }, [navigation]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate('CreateTask');
  }, [navigation]);

  const renderTask = useCallback(({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => handleTaskPress(item)}
      onToggleStatus={() => handleToggleStatus(item)}
    />
  ), []);

  const FilterButton = ({ type, label }: { type: FilterType; label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.filterButtonActive]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && tasks.length === 0) {
    return <Loading message="Cargando tareas..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tareas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <FilterButton type="all" label="Todas" />
        <FilterButton type="pending" label="Pendientes" />
        <FilterButton type="completed" label="Completadas" />
      </View>

      {tasks.length === 0 ? (
        <EmptyState
          title="No hay tareas"
          message={filter === 'all' 
            ? "Crea tu primera tarea para comenzar" 
            : `No tienes tareas ${filter === 'pending' ? 'pendientes' : 'completadas'}`}
          actionLabel="Crear Tarea"
          onAction={handleCreateTask}
        />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
