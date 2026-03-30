import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/utils/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Please enter your email' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Something went wrong. Try again.';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>📬</Text>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a password reset link to {email}. Check your inbox and follow the instructions.
            </Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.btnText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.gray400}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.btnText}>Send reset link</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40,
  },
  back: { marginBottom: Spacing.xl },
  backText: { color: Colors.primary, fontSize: 16 },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  successEmoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black, marginBottom: Spacing.sm },
  subtitle: { fontSize: 15, color: Colors.gray600, lineHeight: 22, marginBottom: Spacing.xl },
  field: { gap: Spacing.xs, marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: '500', color: Colors.gray800 },
  input: {
    borderWidth: 1, borderColor: Colors.gray200, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    fontSize: 15, color: Colors.black, backgroundColor: Colors.gray50,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
