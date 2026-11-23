import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { HomeDto, OpportunityDto } from "@marketmap/contracts";
import { api } from "@/lib/api";
import { Button, Card, colors, Pill, Screen, serif, Status } from "@/components/ui";

export default function TodayScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const [home, setHome] = useState<HomeDto | null>(null);
  const [suggestions, setSuggestions] = useState<OpportunityDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const date = typeof params.date === "string" ? params.date : undefined;

  const load = useCallback(() => {
    setError(null);
    api.home(date).then(async (next) => {
      setHome(next);
      if (next.entitled) {
        const found = await api.opportunities(next.today);
        setSuggestions(found.items);
      }
    }).catch((err) => setError(err instanceof Error ? err.message : "Could not load the day."));
  }, [date]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: colors.forest, marginBottom: 10 }}>Back</Text></Pressable>
          <Status loading={!home && !error} error={error} onRetry={load} />
          {home ? (
            <>
              <Text style={{ fontFamily: serif, fontSize: 36, lineHeight: 40 }}>{home.theme.name}</Text>
              <Text style={{ color: colors.muted, marginBottom: 12 }}>{home.today}</Text>
              <Text style={{ color: colors.ink, marginBottom: 12 }}>{home.theme.prompt}</Text>
              {home.plan.length === 0 ? <Text style={{ marginBottom: 12 }}>Nothing is planned. Suggestions stay separate until you add one.</Text> : null}
              {home.plan.map((item) => (
                <Card key={item.id}>
                  <Text style={{ color: colors.muted }}>{item.timeLabel}</Text>
                  <Text style={{ fontFamily: serif, fontSize: 24 }}>{item.groupName}</Text>
                  <Pill label={item.kindLabel} tone={item.kind === "personal_reminder" ? "neutral" : item.promotionStatus} />
                  <Text style={{ marginTop: 8 }}>{item.conditions}</Text>
                  {item.status === "planned" ? (
                    <Button label="Mark posted" onPress={async () => {
                      try {
                        await api.patchPlanItem(item.id, { revision: item.revision, status: "done" });
                        setMessage("Marked posted. Copying a draft would not have done this.");
                        load();
                      } catch (err) {
                        setMessage(err instanceof Error ? err.message : "Could not update the plan.");
                      }
                    }} />
                  ) : <Text style={{ marginTop: 8 }}>Posted</Text>}
                </Card>
              ))}
              <Text style={{ fontFamily: serif, fontSize: 28, marginVertical: 8 }}>Suggestions</Text>
              {suggestions.map((item) => (
                <Card key={item.windowId}>
                  <Text style={{ color: colors.muted }}>{item.timeLabel} · {item.city}</Text>
                  <Text style={{ fontFamily: serif, fontSize: 22 }}>{item.groupName}</Text>
                  <Text>{item.conditions}</Text>
                  <Button label={item.needsConfirmation ? "Confirm and add" : "Add to the week"} onPress={async () => {
                    try {
                      await api.addPlanItem({ groupId: item.groupId, windowId: item.windowId, date: item.date, acknowledgeConditions: item.needsConfirmation });
                      load();
                    } catch (err) {
                      setMessage(err instanceof Error ? err.message : "Could not add the slot.");
                    }
                  }} />
                </Card>
              ))}
              {message ? <Text style={{ color: colors.forest }}>{message}</Text> : null}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
