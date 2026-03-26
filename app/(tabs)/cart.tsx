import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../src/store/cartStore';
import { ordersAPI } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { items, updateQty, removeItem, clearCart, total, saved } = useCartStore();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        listing_id: i.listing_id,
        quantity: i.quantity,
      }));
      const { data } = await ordersAPI.create(orderItems);
      clearCart();
      Toast.show({ type: 'success', text1: 'Order placed!', text2: 'Head to the store for pickup.' });
      router.push(`/order/${data.order.id}`);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ||
        (Array.isArray(e?.response?.data) ? e.response.data.join(' ') : 'Order failed');
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛍️</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Browse stores and add items to get started</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.browseBtnText}>Browse stores</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Your cart</Text>
        <Text style={styles.storeName}>{items[0]?.store_name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {items.map(item => (
          <View key={item.listing_id} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemStore}>{item.store_name} · {item.discount_pct || 50}% off</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.listing_id, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color={Colors.gray600} />
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.listing_id, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color={Colors.gray600} />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemPrice}>
              ₼{(item.discounted_price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Pickup note */}
        <View style={styles.pickupNote}>
          <Ionicons name="location-outline" size={15} color={Colors.gray600} />
          <Text style={styles.pickupText}>Pickup only · {items[0]?.store_name}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₼{total().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You save</Text>
            <Text style={[styles.summaryValue, { color: Colors.primaryDark }]}>
              -₼{saved().toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₼{total().toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.checkoutBtnText}>
                Reserve & Pay · ₼{total().toFixed(2)}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.black },
  storeName: { fontSize: 13, color: Colors.gray600, marginTop: 2 },
  body: { padding: Spacing.xl, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  rowInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: Colors.black },
  itemStore: { fontSize: 12, color: Colors.gray400, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 0.5, borderColor: Colors.gray200,
    alignItems: 'center', justifyContent: 'center',
  },
  qty: { fontSize: 14, fontWeight: '600', color: Colors.black, minWidth: 20, textAlign: 'center' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: Colors.black, minWidth: 56, textAlign: 'right' },
  divider: { height: 0.5, backgroundColor: Colors.gray100, marginVertical: Spacing.lg },
  pickupNote: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.gray50, borderRadius: Radius.sm, padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pickupText: { fontSize: 13, color: Colors.gray600 },
  summary: { gap: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: Colors.gray600 },
  summaryValue: { fontSize: 14, color: Colors.gray800 },
  totalRow: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 0.5, borderTopColor: Colors.gray100 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: Colors.black },
  totalValue: { fontSize: 16, fontWeight: '700', color: Colors.black },
  footer: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md,
    borderTopWidth: 0.5, borderTopColor: Colors.gray100,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  checkoutBtnDisabled: { opacity: 0.7 },
  checkoutBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.black },
  emptySubtitle: { fontSize: 14, color: Colors.gray600, textAlign: 'center' },
  browseBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: Spacing.xxl, marginTop: Spacing.md,
  },
  browseBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
