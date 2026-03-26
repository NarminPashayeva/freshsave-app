import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radius } from '../../src/utils/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.logo}>FreshSave</Text>
        <Text style={styles.tagline}>
          Fight food waste.{'\n'}Get great food at half the price.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.btnPrimaryText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.btnOutlineText}>Log in</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 60,
  },
  hero: { alignItems: 'center', gap: Spacing.lg },
  emoji: { fontSize: 72 },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: Spacing.sm,
  },
  actions: { gap: Spacing.md },
  btnPrimary: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: '600',
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  legal: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.sm,
  },
});
