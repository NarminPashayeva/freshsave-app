import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, FlatList, Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { storesAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Radius } from '../../src/utils/theme';
import { API_BASE_URL } from '../../src/services/api';
import dayjs from 'dayjs';

const CATEGORIES = ['All', 'Bakery', 'Café', 'Pastry', 'Sandwich'];

export default function HomeScreen() {
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['stores', category, search],
    queryFn: () => storesAPI.list({
      search: search || undefined,
      category: category !== 'All' ? category.toLowerCase() : undefined,
    }),
  });

  const stores = data?.data?.results || data?.data || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Good {getTimeOfDay()}, {user?.full_name?.split(' ')[0]} 👋
          </Text>
          <Text style={styles.location}>📍 Baku</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={Colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bakeries, cafés..."
          placeholderTextColor={Colors.gray400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Store list */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {stores.length} stores available tonight
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No stores found</Text>
            </View>
          }
          renderItem={({ item }) => <StoreCard store={item} />}
        />
      )}
    </View>
  );
}

function StoreCard({ store }: { store: any }) {
  const discount = 50; // default, refine with listing data
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/store/${store.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.cardImage}>
        {store.logo
          ? <Image source={{ uri: `${API_BASE_URL}${store.logo}` }} style={StyleSheet.absoluteFill} />
          : <Text style={styles.cardEmoji}>{getCategoryEmoji(store.category)}</Text>
        }
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>Up to {discount}% off</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{store.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardMetaText}>
            {store.discount_start_time
              ? `From ${store.discount_start_time.slice(0, 5)}`
              : store.category}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={Colors.warning} />
            <Text style={styles.ratingText}>{Number(store.average_rating).toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getCategoryEmoji(cat: string) {
  const map: any = { bakery: '🥐', cafe: '☕', pastry: '🎂', sandwich: '🥪' };
  return map[cat] || '🍽️';
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// Need useState import
import { useState } from 'react';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 56, paddingBottom: 20,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  location: { color: Colors.white, fontSize: 16, fontWeight: '600', marginTop: 2 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, marginHorizontal: Spacing.xl,
    marginTop: -18, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.black },
  chips: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.sm },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.gray200, backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.gray600 },
  chipTextActive: { color: Colors.primaryDark },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 24 },
  sectionTitle: { fontSize: 13, color: Colors.gray600, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, marginBottom: Spacing.lg,
    overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.gray100,
  },
  cardImage: {
    height: 140, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 52 },
  discountBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: Colors.warning, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  cardBody: { padding: Spacing.lg },
  cardName: { fontSize: 16, fontWeight: '600', color: Colors.black, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMetaText: { fontSize: 13, color: Colors.gray600 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '500', color: Colors.gray800 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: Colors.gray600 },
});
