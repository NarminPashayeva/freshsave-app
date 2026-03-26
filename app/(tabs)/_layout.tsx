import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/utils/theme';
import { useCartStore } from '../../src/store/cartStore';
import { View, Text, StyleSheet } from 'react-native';

function CartBadge() {
  const count = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0));
  if (!count) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.gray400,
      tabBarStyle: { borderTopColor: Colors.gray100, paddingBottom: 8, height: 60 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
    }}>
      <Tabs.Screen name="home" options={{
        title: 'Discover',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="storefront-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Cart',
        tabBarIcon: ({ color, size }) => (
          <View>
            <Ionicons name="bag-outline" size={size} color={color} />
            <CartBadge />
          </View>
        ),
      }} />
      <Tabs.Screen name="orders" options={{
        title: 'Orders',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="receipt-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: Colors.danger, borderRadius: 999,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
