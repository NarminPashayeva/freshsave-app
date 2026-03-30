import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { storesAPI } from '../services/api';
import { Colors, Spacing, Radius } from '../utils/theme';
import dayjs from 'dayjs';

interface Props {
  storeId: string;
}

export default function ReviewsSection({ storeId }: Props) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', storeId],
    queryFn: () => storesAPI.reviews(storeId),
  });

  const submit = useMutation({
    mutationFn: () => storesAPI.addReview(storeId, { rating, comment }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Review submitted!' });
      queryClient.invalidateQueries({ queryKey: ['reviews', storeId] });
      queryClient.invalidateQueries({ queryKey: ['store', storeId] });
      setShowForm(false);
      setRating(0);
      setComment('');
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.detail || 'Could not submit review';
      Toast.show({ type: 'error', text1: msg });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Select a rating', 'Please tap a star before submitting.');
      return;
    }
    submit.mutate();
  };

  const reviews = data?.data?.results || data?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Reviews</Text>
        <TouchableOpacity onPress={() => setShowForm(v => !v)}>
          <Text style={styles.writeLink}>{showForm ? 'Cancel' : '+ Write review'}</Text>
        </TouchableOpacity>
      </View>

      {/* Review form */}
      {showForm && (
        <View style={styles.form}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Ionicons
                  name={n <= rating ? 'star' : 'star-outline'}
                  size={28}
                  color={n <= rating ? Colors.warning : Colors.gray400}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Share your experience…"
            placeholderTextColor={Colors.gray400}
            multiline
            numberOfLines={3}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity
            style={[styles.submitBtn, submit.isPending && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submit.isPending}
          >
            {submit.isPending
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Text style={styles.submitBtnText}>Submit</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Review list */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
      ) : reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet — be the first!</Text>
      ) : (
        reviews.map((r: any) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarText}>
                  {r.user_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerName}>{r.user_name || 'Anonymous'}</Text>
                <Text style={styles.reviewDate}>{dayjs(r.created_at).format('D MMM YYYY')}</Text>
              </View>
              <StarRow rating={r.rating} />
            </View>
            {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Ionicons
          key={n}
          name={n <= rating ? 'star' : 'star-outline'}
          size={12}
          color={n <= rating ? Colors.warning : Colors.gray400}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.xl },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: 17, fontWeight: '600', color: Colors.black },
  writeLink: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  form: {
    backgroundColor: Colors.gray50, borderRadius: Radius.md,
    padding: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 0.5, borderColor: Colors.gray200,
  },
  stars: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    borderWidth: 1, borderColor: Colors.gray200, borderRadius: Radius.sm,
    padding: Spacing.md, fontSize: 14, color: Colors.black,
    backgroundColor: Colors.white, minHeight: 80, textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: 12, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  empty: { fontSize: 13, color: Colors.gray400, marginTop: 8, textAlign: 'center' },
  reviewCard: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  avatarSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark },
  reviewerName: { fontSize: 13, fontWeight: '600', color: Colors.black },
  reviewDate: { fontSize: 11, color: Colors.gray400 },
  reviewComment: { fontSize: 13, color: Colors.gray800, lineHeight: 18 },
});
