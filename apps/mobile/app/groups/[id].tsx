import { useCallback, useEffect, useState } from "react";
import { addDays, civilToday, civilWeekday } from "@marketmap/domain";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { GroupCardDto } from "@marketmap/contracts";
import { api } from "@/lib/api";
import { Button, Card, colors, Pill, Screen, serif, Status } from "@/components/ui";

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<GroupCardDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(() => {
    if (!id) return;
    api.group(id).then(setGroup).catch((err) => setError(err instanceof Error ? err.message : "Could not open the group."));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const today = civilToday("America/Chicago");
  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: colors.forest }}>Groups</Text></Pressable>
          <Status loading={!group && !error} error={error} onRetry={load} />
          {group ? (
            <>
              <Text style={{ fontFamily: serif, fontSize: 36, lineHeight: 40, marginTop: 8 }}>{group.name}</Text>
              <Pill label={group.statusLabel} tone={group.promotionStatus} />
              <Text style={{ marginVertical: 10 }}>{group.ruleSummary}</Text>
              <Text style={{ color: colors.muted }}>{group.city} · {group.distanceLabel}</Text>
              <Text style={{ color: colors.muted, marginBottom: 8 }}>{group.evidenceSummary}</Text>
              {group.correction ? <Text style={{ backgroundColor: "#f6ead0", padding: 12, borderRadius: 12 }}>{group.correction}</Text> : null}
              {group.url ? <Button label="Open group" onPress={() => Linking.openURL(group.url)} /> : <Text>The direct link is part of the paid edition.</Text>}
              <Button label={group.favorite ? "Favorited" : "Favorite"} kind="ghost" onPress={async () => {
                try {
                  if (group.favorite) await api.unfavorite(group.id);
                  else await api.favorite(group.id);
                  load();
                } catch (err) {
                  setMessage(err instanceof Error ? err.message : "Could not update the favorite.");
                }
              }} />
              {group.windows.map((window) => {
                const date = nextMatching(today, window.weekdays);
                return (
                <Card key={window.id}>
                  <Text style={{ fontFamily: serif, fontSize: 22 }}>{window.timeLabel}</Text>
                  <Text>{window.conditions}</Text>
                  <Button label={`Add ${date}`} onPress={async () => {
                    try {
                      await api.addPlanItem({ groupId: group.id, windowId: window.id, date, kind: "verified", acknowledgeConditions: group.promotionStatus === "restricted" });
                      router.push({ pathname: "/today", params: { date } });
                    } catch (err) {
                      setMessage(err instanceof Error ? err.message : "That slot could not be added.");
                    }
                  }} />
                </Card>
                );
              })}
              {message ? <Text>{message}</Text> : null}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function nextMatching(from: string, weekdays: number[]): string {
  for (let offset = 0; offset < 14; offset += 1) {
    const date = addDays(from, offset);
    if (weekdays.includes(civilWeekday(date))) return date;
  }
  return from;
}
