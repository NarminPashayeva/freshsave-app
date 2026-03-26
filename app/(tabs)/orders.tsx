import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',     color: Colors.warning,     bg: Colors.warningLight },
  paid:      { label: 'Paid',        color: Colors.primaryDark, bg: Colors.primaryLight },
  ready:     { label: 'Ready! 🎉',   color: Colors.primaryDark, bg: Colors.primaryLight },
  collected: { label: 'Collected',   color: Colors.gray600,     bg: Colors.gray100 },
  expired:   { label: 'Expired',     color: Colors.danger,      bg: '#FCEBEB' },
  cancelled: { label: 'Cancelled',   color: Colors.danger,      bg: '#FCEBEB' },
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersAPI.history(),
  });

  const orders = data?.data?.results || data?.data || [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>My orders</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🧾</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySub}>Your order history will appear here</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/order/${item.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.storeName}>{item.store_name}</Text>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.items} numberOfLines={1}>
                  {item.items?.map((i: any) => `${i.quantity}× ${i.listing_name}`).join(', ')}
                </Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.date}>{dayjs(item.created_at).format('D MMM · HH:mm')}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.saved}>saved ₼{Number(item.saved_amount).toFixed(2)}</Text>
                    <Text style={styles.total}>₼{Number(item.total_amount).toFixed(2)}</Text>
                  </View>
                </View>
                {item.status === 'ready' && (
                  <View style={styles.pickupAlert}>
                    <Ionicons name="location" size={14} color={Colors.primaryDark} />
                    <Text style={styles.pickupText}>
                      Ready for pickup · {item.store_address}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
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
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.black },
  list: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 0.5, borderColor: Colors.gray100,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  storeName: { fontSize: 15, fontWeight: '600', color: Colors.black },
  badge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '500' },
  items: { fontSize: 13, color: Colors.gray600, marginBottom: Spacing.sm },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: Colors.gray400 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  saved: { fontSize: 12, color: Colors.primaryDark },
  total: { fontSize: 14, fontWeight: '700', color: Colors.black },
  pickupAlert: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.sm,
    padding: Spacing.sm, marginTop: Spacing.sm,
  },
  pickupText: { fontSize: 12, color: Colors.primaryDark, flex: 1 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.black },
  emptySub: { fontSize: 14, color: Colors.gray600 },
});
