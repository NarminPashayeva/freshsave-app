import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const TERMINAL = ['collected', 'cancelled', 'expired'];

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.detail(id),
    // Stop polling once order reaches a final state
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.data?.status;
      return TERMINAL.includes(status) ? false : 15000;
    },
  });

  const order = data?.data;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Order details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Status card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>{getStatusEmoji(order?.status)}</Text>
          <Text style={styles.statusTitle}>{getStatusTitle(order?.status)}</Text>
          <Text style={styles.statusSub}>{getStatusSubtitle(order)}</Text>
        </View>

        {/* Store */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pickup from</Text>
          <Text style={styles.sectionValue}>{order?.store_name}</Text>
          <Text style={styles.sectionSub}>{order?.store_address}</Text>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Items</Text>
          {order?.items?.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.quantity}× {item.listing_name}</Text>
              <Text style={styles.itemPrice}>₼{(item.unit_price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total paid</Text>
            <Text style={styles.summaryValue}>₼{Number(order?.total_amount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You saved</Text>
            <Text style={[styles.summaryValue, { color: Colors.primaryDark }]}>
              ₼{Number(order?.saved_amount).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order date</Text>
            <Text style={styles.summaryValue}>
              {dayjs(order?.created_at).format('D MMM YYYY, HH:mm')}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.homeBtnText}>Back to home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function getStatusEmoji(status: string) {
  const map: any = { pending: '⏳', paid: '✅', ready: '🎉', collected: '🏠', expired: '❌', cancelled: '❌' };
  return map[status] || '⏳';
}

function getStatusTitle(status: string) {
  const map: any = {
    pending: 'Awaiting payment',
    paid: 'Order confirmed!',
    ready: 'Ready for pickup!',
    collected: 'Order collected',
    expired: 'Order expired',
    cancelled: 'Order cancelled',
  };
  return map[status] || 'Processing...';
}

function getStatusSubtitle(order: any) {
  if (!order) return '';
  if (order.status === 'paid' || order.status === 'ready') {
    const pickup = dayjs(order.pickup_by);
    return `Pick up by ${pickup.format('HH:mm')} tonight`;
  }
  if (order.status === 'collected') return 'Thank you for using FreshSave!';
  return '';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  title: { fontSize: 17, fontWeight: '600', color: Colors.black },
  body: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  statusCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.xl,
    alignItems: 'center', gap: Spacing.sm, borderWidth: 0.5, borderColor: Colors.gray100,
  },
  statusEmoji: { fontSize: 52 },
  statusTitle: { fontSize: 20, fontWeight: '700', color: Colors.black },
  statusSub: { fontSize: 14, color: Colors.gray600, textAlign: 'center' },
  section: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg,
    gap: Spacing.sm, borderWidth: 0.5, borderColor: Colors.gray100,
  },
  sectionLabel: { fontSize: 12, fontWeight: '500', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionValue: { fontSize: 16, fontWeight: '600', color: Colors.black },
  sectionSub: { fontSize: 13, color: Colors.gray600 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 14, color: Colors.gray800 },
  itemPrice: { fontSize: 14, fontWeight: '500', color: Colors.black },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: Colors.gray600 },
  summaryValue: { fontSize: 14, fontWeight: '500', color: Colors.black },
  homeBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  homeBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
