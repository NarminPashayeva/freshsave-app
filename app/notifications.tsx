import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { notificationsAPI } from '../src/services/api';
import { Colors, Spacing, Radius } from '../src/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  order_ready:    { icon: 'checkmark-circle', color: Colors.primaryDark, bg: Colors.primaryLight },
  store_live:     { icon: 'storefront',       color: Colors.warning,     bg: Colors.warningLight },
  order_expiring: { icon: 'time',             color: Colors.danger,      bg: '#FCEBEB' },
  promo:          { icon: 'pricetag',         color: Colors.gray600,     bg: Colors.gray100 },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.list(),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data?.results || data?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => markAllRead.mutate()}>
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 70 }} />}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n: any) => n.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>We'll let you know when stores go live</Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => {
            const cfg = TYPE_ICONS[item.type] || TYPE_ICONS.promo;
            return (
              <View style={[styles.card, !item.is_read && styles.cardUnread]}>
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.body}</Text>
                  <Text style={styles.notifTime}>{dayjs(item.created_at).fromNow()}</Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  title: { fontSize: 17, fontWeight: '600', color: Colors.black },
  markRead: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  list: { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: 32 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 0.5, borderColor: Colors.gray100,
  },
  cardUnread: { borderColor: Colors.primaryLight, backgroundColor: '#FDFFFE' },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 3 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.black },
  notifBody: { fontSize: 13, color: Colors.gray600, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.gray400, marginTop: 2 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, marginTop: 4, flexShrink: 0,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.black },
  emptySub: { fontSize: 14, color: Colors.gray600, textAlign: 'center' },
});
