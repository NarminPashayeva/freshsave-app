import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../utils/theme';

/** Single pulsing placeholder block */
function SkeletonBox({ width, height, style }: {
  width?: number | string;
  height: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width ?? '100%', height, borderRadius: Radius.sm, backgroundColor: Colors.gray200 },
        { opacity },
        style,
      ]}
    />
  );
}

/** Skeleton for a store card on the home screen */
export function StoreSkeleton() {
  return (
    <View style={styles.storeCard}>
      <SkeletonBox height={140} style={{ borderRadius: Radius.lg }} />
      <View style={styles.storeBody}>
        <SkeletonBox height={16} width="60%" />
        <SkeletonBox height={12} width="40%" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/** Skeleton for a listing row on the store detail screen */
export function ListingSkeleton() {
  return (
    <View style={styles.listingRow}>
      <SkeletonBox width={64} height={64} style={{ borderRadius: Radius.sm }} />
      <View style={styles.listingInfo}>
        <SkeletonBox height={14} width="70%" />
        <SkeletonBox height={11} width="50%" style={{ marginTop: 6 }} />
        <SkeletonBox height={14} width="40%" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  storeCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    marginBottom: Spacing.lg, overflow: 'hidden',
    borderWidth: 0.5, borderColor: Colors.gray100,
  },
  storeBody: { padding: Spacing.lg, gap: Spacing.sm },
  listingRow: {
    flexDirection: 'row', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.gray100,
  },
  listingInfo: { flex: 1, gap: 4 },
});
