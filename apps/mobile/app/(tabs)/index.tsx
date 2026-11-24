import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { HomeDto } from "@marketmap/contracts";
import { api } from "@/lib/api";
import { Card, colors, Pill, Screen, serif, Status } from "@/components/ui";

export default function HomeScreen() {
  const [home, setHome] = useState<HomeDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    setError(null);
    api.home().then(setHome).catch((err) => setError(err instanceof Error ? err.message : "Could not load home."));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Status loading={!home && !error} error={error} onRetry={load} />
          {home ? (
            <>
              <Text style={{ fontFamily: serif, fontSize: 40, lineHeight: 44 }}>Hi {home.displayName}!</Text>
              <Text style={{ color: colors.muted, marginBottom: 14 }}>{home.businessName ?? "Your business marketing hub"}</Text>
              <Pressable onPress={() => router.push({ pathname: "/today", params: { date: home.today } })} style={{ backgroundColor: colors.forest, borderRadius: 18, padding: 16, marginBottom: 12 }}>
                <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>Today’s Plan</Text>
                <Text style={{ color: "#f6f1e7" }}>{home.today}</Text>
              </Pressable>
              <View style={{ backgroundColor: "#f8efe4", borderRadius: 18, padding: 16, marginBottom: 12 }}>
                <Text style={{ color: colors.clay, fontWeight: "800", letterSpacing: 0.4 }}>{home.theme.name.toUpperCase()}</Text>
                <Text style={{ marginTop: 4 }}>{home.theme.prompt}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                <Pressable onPress={() => router.push({ pathname: "/today", params: { date: home.today } })} style={tile}><Text style={tileNum}>{home.counts.groups}</Text><Text style={tileLabel}>Groups to post in</Text></Pressable>
                <Pressable onPress={() => router.push("/(tabs)/studio")} style={tile}><Text style={tileNum}>{home.counts.drafts}</Text><Text style={tileLabel}>AI post ready</Text></Pressable>
                <Pressable onPress={() => router.push({ pathname: "/today", params: { date: home.today } })} style={tile}><Text style={tileNum}>{home.plan.filter((item) => item.status !== "done").length}</Text><Text style={tileLabel}>Tasks today</Text></Pressable>
              </View>
              <Text style={{ fontFamily: serif, fontSize: 28, marginBottom: 8 }}>This week at a glance</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
                {home.week.map((day) => (
                  <Pressable key={day.date} onPress={() => router.push({ pathname: "/today", params: { date: day.date } })} style={{ width: 108, borderRadius: 16, padding: 10, backgroundColor: day.active ? colors.forest : "white" }}>
                    <Text style={{ color: day.active ? "#f6f1e7" : colors.muted, fontSize: 12, fontWeight: "800" }}>{day.weekdayShort}</Text>
                    <Text style={{ color: day.active ? "white" : colors.ink, marginTop: 4 }}>{day.theme}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {home.plan.map((item) => (
                <Card key={item.id}>
                  <Text style={{ color: colors.muted }}>{item.timeLabel}</Text>
                  <Text style={{ fontFamily: serif, fontSize: 22 }}>{item.groupName}</Text>
                  <Pill label={item.statusLabel} tone={item.kind === "personal_reminder" ? "neutral" : item.promotionStatus} />
                </Card>
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const tile = { flex: 1, backgroundColor: "white", borderRadius: 16, padding: 10, alignItems: "center" as const };
const tileNum = { fontSize: 26, fontWeight: "800" as const, color: colors.ink };
const tileLabel = { color: colors.muted, textAlign: "center" as const, fontSize: 12 };
