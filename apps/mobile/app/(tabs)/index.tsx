import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { HomeDto } from "@marketmap/contracts";
import { api } from "@/lib/api";
import { Card, colors, Pill, Screen, serif, Status, Title } from "@/components/ui";
import { useSession } from "@/lib/session";

export default function HomeScreen() {
  const { me } = useSession();
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
              <Title kicker={home.businessName ?? "MarketMap"}>{`${home.greeting}, ${home.displayName}.`}</Title>
              <View style={{ backgroundColor: colors.forest, borderRadius: 24, padding: 20, marginBottom: 16 }}>
                <Text style={{ color: "#e7d7b2", letterSpacing: 1.2, fontSize: 12, fontWeight: "700" }}>TODAY’S PLAN</Text>
                <Text style={{ fontFamily: serif, color: "#f6f1e7", fontSize: 36, lineHeight: 40, marginVertical: 8 }}>{home.theme.name}</Text>
                <Text style={{ color: "#f6f1e7" }}>{home.theme.prompt}</Text>
                <Pressable onPress={() => router.push({ pathname: "/today", params: { date: home.today } })} style={{ marginTop: 14, backgroundColor: "#f6f1e7", borderRadius: 999, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: colors.forest, fontWeight: "700" }}>Open the day</Text>
                </Pressable>
              </View>
              {home.notices.map((notice) => (
                <Text key={notice.id} style={{ backgroundColor: notice.tone === "warning" ? "#f6ead0" : "#e7efe8", padding: 12, borderRadius: 14, marginBottom: 8 }}>{notice.text}</Text>
              ))}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
                {home.week.map((day) => (
                  <Pressable key={day.date} onPress={() => router.push({ pathname: "/today", params: { date: day.date } })} style={{ width: 74, borderRadius: 16, padding: 10, backgroundColor: day.active ? colors.forest : colors.paper }}>
                    <Text style={{ color: day.active ? "#f6f1e7" : colors.muted, fontSize: 11 }}>{day.weekdayShort}</Text>
                    <Text style={{ color: day.active ? "white" : colors.ink, fontSize: 20, fontWeight: "700" }}>{day.dayNumber}</Text>
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
              {!me?.entitled ? <Text style={{ color: colors.muted }}>Buy the edition on the web, then sign in here with the same email.</Text> : null}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
