import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { colors, Screen, serif, Status, Title } from "@/components/ui";

export default function CalendarScreen() {
  const [days, setDays] = useState<Array<{ date: string; posts: number; holiday: string | null; campaign: string | null }>>([]);
  const [cursor, setCursor] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);
  const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;

  const load = useCallback(() => {
    const start = `${month}-01`;
    const endDate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const end = `${month}-${String(endDate.getDate()).padStart(2, "0")}`;
    setError(null);
    api.calendar(start, end).then((result) => setDays(result.days)).catch((err) => setError(err instanceof Error ? err.message : "Could not load the calendar."));
  }, [month, cursor]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const label = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });
  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Title kicker="Calendar">{label}</Title>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <Pressable onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><Text style={{ color: colors.forest }}>Previous</Text></Pressable>
            <Pressable onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><Text style={{ color: colors.forest }}>Next</Text></Pressable>
          </View>
          <Status loading={days.length === 0 && !error} error={error} onRetry={load} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {days.map((day) => (
              <Pressable key={day.date} onPress={() => router.push({ pathname: "/today", params: { date: day.date } })} style={{ width: "13%", minHeight: 52, backgroundColor: colors.paper, borderRadius: 10, padding: 4 }}>
                <Text style={{ fontFamily: serif }}>{Number(day.date.slice(8))}</Text>
                {day.posts ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.forest }} /> : null}
                {day.holiday ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold }} /> : null}
                {day.campaign ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.clay }} /> : null}
              </Pressable>
            ))}
          </View>
          <Text style={{ color: colors.muted, marginTop: 12 }}>Forest is a planned post. Gold is a holiday. Clay is a campaign.</Text>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
