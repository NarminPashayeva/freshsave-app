import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, FlatList, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { storesAPI, listingsAPI } from '../../src/services/api';
import { useCartStore } from '../../src/store/cartStore';
import { Colors, Spacing, Radius } from '../../src/utils/theme';
import { API_BASE_URL } from '../../src/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const addItem = useCartStore(s => s.addItem);
  const cartItems = useCartStore(s => s.items);

  const { data: storeData } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesAPI.detail(id),
  });

  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['listings', id],
    queryFn: () => listingsAPI.storeFeed(id),
  });

  const store = storeData?.data;
  const listings = listingsData?.data?.results || listingsData?.data || [];

  const handleAdd = (listing: any) => {
    const differentStore = cartItems.length > 0 && cartItems[0].store_id !== id;
    if (differentStore) {
      Toast.show({
        type: 'info',
        text1: 'Cart cleared',
        text2: 'Items from a different store were removed',
      });
    }
    addItem({
      listing_id: listing.id,
      name: listing.name,
      store_id: id,
      store_name: store?.name || '',
      original_price: parseFloat(listing.original_price),
      discounted_price: listing.discounted_price,
      quantity: 1,
      image: listing.image,
    });
    Toast.show({ type: 'success', text1: `${listing.name} added to cart` });
  };

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        {store?.cover_image
          ? <Image source={{ uri: `${API_BASE_URL}${store.cover_image}` }} style={StyleSheet.absoluteFill} />
          : <Text style={styles.heroEmoji}>🥐</Text>
        }
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Store info */}
        <Text style={styles.storeName}>{store?.name}</Text>
        <Text style={styles.storeMeta}>
          {store?.category} · {store?.address}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={Colors.warning} />
          <Text style={styles.ratingText}>
            {Number(store?.average_rating || 0).toFixed(1)} ({store?.review_count || 0} reviews)
          </Text>
        </View>

        {/* Pickup banner */}
        {store?.discount_start_time && (
          <View style={styles.banner}>
            <Ionicons name="time-outline" size={16} color={Colors.warning} />
            <Text style={styles.bannerText}>
              Discounts active from {store.discount_start_time.slice(0, 5)} · Pickup only
            </Text>
          </View>
        )}

        {/* Listings */}
        <Text style={styles.sectionTitle}>Available tonight</Text>

        {isLoading
          ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
          : listings.length === 0
            ? <Text style={styles.empty}>No listings available right now</Text>
            : listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} onAdd={() => handleAdd(listing)} />
              ))
        }
      </ScrollView>

      {/* Cart FAB */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          style={[styles.cartFab, { bottom: insets.bottom + 16 }]}
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Text style={styles.cartFabText}>
            View cart · {cartItems.reduce((n, i) => n + i.quantity, 0)} items
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function ListingCard({ listing, onAdd }: { listing: any; onAdd: () => void }) {
  const isAvailable = listing.is_available_now;
  return (
    <View style={[styles.listingCard, !isAvailable && styles.listingUnavailable]}>
      <View style={styles.listingImage}>
        {listing.image
          ? <Image source={{ uri: `${API_BASE_URL}${listing.image}` }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <Text style={{ fontSize: 32 }}>🍞</Text>
        }
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingName}>{listing.name}</Text>
        <Text style={styles.listingDesc} numberOfLines={1}>{listing.description}</Text>
        <Text style={styles.listingTime}>
          {listing.available_from?.slice(0, 5)}–{listing.available_until?.slice(0, 5)}
        </Text>
        <View style={styles.listingPriceRow}>
          <Text style={styles.priceNew}>₼{Number(listing.discounted_price).toFixed(2)}</Text>
          <Text style={styles.priceOld}>₼{Number(listing.original_price).toFixed(2)}</Text>
          <Text style={styles.discountPct}>-{listing.discount_pct}%</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addBtn, !isAvailable && styles.addBtnDisabled]}
        onPress={onAdd}
        disabled={!isAvailable || listing.available_qty === 0}
      >
        <Ionicons name="add" size={22} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  hero: {
    height: 200, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 72 },
  backBtn: {
    position: 'absolute', left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: Spacing.xl, paddingBottom: 100 },
  storeName: { fontSize: 24, fontWeight: '700', color: Colors.black },
  storeMeta: { fontSize: 14, color: Colors.gray600, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingText: { fontSize: 13, color: Colors.gray600 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.warningLight, borderRadius: Radius.sm,
    padding: Spacing.md, marginTop: Spacing.lg,
    borderWidth: 0.5, borderColor: '#FAC775',
  },
  bannerText: { fontSize: 13, color: Colors.warning, flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: Colors.black, marginTop: Spacing.xl, marginBottom: Spacing.md },
  empty: { color: Colors.gray400, textAlign: 'center', marginTop: 32 },
  listingCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  listingUnavailable: { opacity: 0.5 },
  listingImage: {
    width: 64, height: 64, borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  listingInfo: { flex: 1 },
  listingName: { fontSize: 14, fontWeight: '600', color: Colors.black },
  listingDesc: { fontSize: 12, color: Colors.gray400, marginTop: 2 },
  listingTime: { fontSize: 11, color: Colors.gray400, marginTop: 2 },
  listingPriceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  priceNew: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark },
  priceOld: { fontSize: 12, color: Colors.gray400, textDecorationLine: 'line-through' },
  discountPct: { fontSize: 11, color: Colors.white, backgroundColor: Colors.warning, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  addBtnDisabled: { backgroundColor: Colors.gray200 },
  cartFab: {
    position: 'absolute', left: Spacing.xl, right: Spacing.xl,
    backgroundColor: Colors.primaryDark, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: Spacing.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cartFabText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
