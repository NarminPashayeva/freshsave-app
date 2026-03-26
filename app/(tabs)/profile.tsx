import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Radius } from '../../src/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/welcome');
      }},
    ]);
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Avatar & name */}
      <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'store_owner' ? 'Store Owner' : 'Customer'}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {[
          { icon: 'person-outline', label: 'Edit profile', onPress: () => {} },
          { icon: 'lock-closed-outline', label: 'Change password', onPress: () => {} },
          { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
        ].map(({ icon, label, onPress }) => (
          <MenuItem key={label} icon={icon} label={label} onPress={onPress} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {[
          { icon: 'help-circle-outline', label: 'Help & FAQ', onPress: () => {} },
          { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => {} },
          { icon: 'shield-outline', label: 'Privacy Policy', onPress: () => {} },
        ].map(({ icon, label, onPress }) => (
          <MenuItem key={label} icon={icon} label={label} onPress={onPress} />
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>FreshSave v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon as any} size={20} color={Colors.gray600} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  hero: {
    backgroundColor: Colors.white, alignItems: 'center',
    paddingBottom: Spacing.xl, borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.primaryDark },
  name: { fontSize: 20, fontWeight: '700', color: Colors.black },
  email: { fontSize: 14, color: Colors.gray600, marginTop: 4 },
  roleBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 4, marginTop: Spacing.sm,
  },
  roleText: { fontSize: 12, fontWeight: '500', color: Colors.primaryDark },
  section: {
    backgroundColor: Colors.white, marginTop: Spacing.lg,
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: Colors.gray100,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '500', color: Colors.gray400,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.xl, paddingVertical: 14,
    borderTopWidth: 0.5, borderTopColor: Colors.gray100,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.gray50, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.black },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl, paddingVertical: 16,
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: Colors.gray100,
  },
  logoutText: { fontSize: 15, color: Colors.danger, fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 12, color: Colors.gray400, marginTop: Spacing.xl },
});
