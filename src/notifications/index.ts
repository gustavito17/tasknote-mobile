import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIF_ID_MAP_KEY = '@GusPad:notifIdMap'; // taskId → notificationId

// Muestra la notificación como alerta cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Permisos ────────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'GusPad',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Recordatorio diario ─────────────────────────────────────────────────────

const DAILY_NOTIF_KEY = '@GusPad:dailyNotifId';

export async function scheduleDailyReminder(hour = 9, minute = 0): Promise<void> {
  // Cancelar el anterior si existe
  const prevId = await AsyncStorage.getItem(DAILY_NOTIF_KEY);
  if (prevId) await Notifications.cancelScheduledNotificationAsync(prevId);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 GusPad',
      body: 'Tenés tareas pendientes para hoy. ¡Revisá tu lista!',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await AsyncStorage.setItem(DAILY_NOTIF_KEY, id);
}

export async function cancelDailyReminder(): Promise<void> {
  const id = await AsyncStorage.getItem(DAILY_NOTIF_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(DAILY_NOTIF_KEY);
  }
}

// ── Notificación por fecha de tarea ─────────────────────────────────────────

export async function scheduleTaskNotification(
  taskId: number,
  title: string,
  date: Date,
): Promise<void> {
  // No programar si la fecha ya pasó
  if (date <= new Date()) return;

  // Cancelar notificación anterior para esta tarea
  await cancelTaskNotification(taskId);

  // Notificar a las 9 AM del día de la tarea
  const trigger = new Date(date);
  trigger.setHours(9, 0, 0, 0);
  if (trigger <= new Date()) return;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Tarea para hoy',
      body: title,
      sound: 'default',
      data: { taskId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });

  // Guardar el id para poder cancelarlo después
  const map = await getNotifIdMap();
  map[taskId] = id;
  await AsyncStorage.setItem(NOTIF_ID_MAP_KEY, JSON.stringify(map));
}

export async function cancelTaskNotification(taskId: number): Promise<void> {
  const map = await getNotifIdMap();
  const id = map[taskId];
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    delete map[taskId];
    await AsyncStorage.setItem(NOTIF_ID_MAP_KEY, JSON.stringify(map));
  }
}

async function getNotifIdMap(): Promise<Record<number, string>> {
  try {
    const data = await AsyncStorage.getItem(NOTIF_ID_MAP_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
