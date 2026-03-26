import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Radius } from '../../src/utils/theme';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', password2: '',
  });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);

  const set = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    if (!form.full_name || !form.email || !form.password || !form.password2) {
      Toast.show({ type: 'error', text1: 'Please fill in all required fields' });
      return;
    }
    if (form.password !== form.password2) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role: 'customer', email: form.email.trim().toLowerCase() });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      const errors = e?.response?.data;
      const msg = typeof errors === 'object'
        ? Object.values(errors).flat().join(' ')
        : 'Registration failed';
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join thousands saving food and money</Text>

        <View style={styles.form}>
          {[
            { key: 'full_name', label: 'Full name *', placeholder: 'Amir Mammadov' },
            { key: 'email', label: 'Email *', placeholder: 'your@email.com', keyboard: 'email-address' as any },
            { key: 'phone', label: 'Phone', placeholder: '+994 50 123 45 67', keyboard: 'phone-pad' as any },
            { key: 'password', label: 'Password *', placeholder: 'Min. 8 characters', secure: true },
            { key: 'password2', label: 'Confirm password *', placeholder: 'Repeat password', secure: true },
          ].map(({ key, label, placeholder, keyboard, secure }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.gray400}
                keyboardType={keyboard || 'default'}
                autoCapitalize={key === 'email' ? 'none' : 'words'}
                secureTextEntry={secure}
                value={(form as any)[key]}
                onChangeText={(v) => set(key, v)}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnText}>Create account</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40,
  },
  back: { marginBottom: Spacing.xl },
  backText: { color: Colors.primary, fontSize: 16 },
  title: { fontSize: 30, fontWeight: '700', color: Colors.black, marginBottom: Spacing.sm },
  subtitle: { fontSize: 15, color: Colors.gray600, marginBottom: Spacing.xxl },
  form: { gap: Spacing.lg },
  field: { gap: Spacing.xs },
  label: { fontSize: 14, fontWeight: '500', color: Colors.gray800 },
  input: {
    borderWidth: 1, borderColor: Colors.gray200, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    fontSize: 15, color: Colors.black, backgroundColor: Colors.gray50,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  footerText: { color: Colors.gray600, fontSize: 15 },
  footerLink: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
