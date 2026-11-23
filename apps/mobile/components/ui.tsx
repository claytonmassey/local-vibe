import { ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export const serif = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });

export const colors = {
  cream: "#f3ecdf",
  paper: "#fbf7f1",
  ink: "#1b2a22",
  forest: "#1e4a37",
  muted: "#5d675f",
  line: "rgba(27,42,34,0.12)",
  gold: "#a67c3d",
  clay: "#8c4638",
};

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Title({ kicker, children }: { kicker?: string; children: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.title}>{children}</Text>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Button({ label, onPress, kind = "primary", disabled }: { label: string; onPress: () => void; kind?: "primary" | "ghost"; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, kind === "ghost" && styles.ghost, disabled && { opacity: 0.55 }]}>
      <Text style={[styles.buttonText, kind === "ghost" && { color: colors.forest }]}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone }: { label: string; tone: string }) {
  const background = tone === "confirmed_allowed" ? "#e4f0e6" : tone === "restricted" ? "#f6ead0" : tone === "not_allowed" ? "#f8e4de" : "#ece6da";
  const color = tone === "confirmed_allowed" ? "#1a4a34" : tone === "restricted" ? "#6a4e12" : tone === "not_allowed" ? "#8c4638" : "#4e5852";
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text style={{ color, fontWeight: "700", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function Status({ loading, error, onRetry }: { loading?: boolean; error?: string | null; onRetry?: () => void }) {
  if (loading) {
    return (
      <View style={styles.status}>
        <ActivityIndicator color={colors.forest} />
        <Text style={styles.muted}>Loading the week…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.status}>
        <Text style={styles.error}>{error}</Text>
        {onRetry ? <Button label="Try again" kind="ghost" onPress={onRetry} /> : null}
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  kicker: { color: "#5d6840", letterSpacing: 1.4, fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 },
  title: { fontFamily: serif, fontSize: 34, lineHeight: 38, color: colors.ink },
  card: { backgroundColor: colors.paper, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 12 },
  button: { minHeight: 46, borderRadius: 999, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginTop: 8 },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.line },
  buttonText: { color: "#f6f1e7", fontWeight: "700" },
  pill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  status: { paddingVertical: 24, gap: 8 },
  muted: { color: colors.muted },
  error: { color: colors.clay },
});
