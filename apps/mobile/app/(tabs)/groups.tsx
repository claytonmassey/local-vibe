import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { GroupCardDto } from "@marketmap/contracts";
import { api } from "@/lib/api";
import { Card, colors, Pill, Screen, serif, Status, Title } from "@/components/ui";

const chips = [
  ["", "All"],
  ["business_ads", "Business ads"],
  ["local", "Local only"],
  ["favorites", "Favorites"],
];

export default function GroupsScreen() {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("");
  const [items, setItems] = useState<GroupCardDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((nextChip = chip, nextQuery = query) => {
    setError(null);
    api.groups({ q: nextQuery, chip: nextChip || undefined }).then((result) => setItems(result.items)).catch((err) => setError(err instanceof Error ? err.message : "Could not load groups."));
  }, [chip, query]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Title kicker="Local groups">Where a post is allowed.</Title>
          <TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => load(chip, query)} placeholder="Search name, city or keyword" placeholderTextColor={colors.muted} style={{ backgroundColor: "white", borderRadius: 14, minHeight: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
            {chips.map(([value, label]) => (
              <Pressable key={label} onPress={() => { setChip(value); load(value, query); }} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: chip === value ? colors.forest : colors.paper }}>
                <Text style={{ color: chip === value ? "white" : colors.ink }}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Status loading={!items && !error} error={error} onRetry={() => load()} />
          {items?.length === 0 ? <Text>No groups match. Clear the search or try another chip.</Text> : null}
          {items?.map((group) => (
            <Pressable key={group.id} onPress={() => router.push({ pathname: "/groups/[id]", params: { id: group.id } })}>
              <Card>
                <Text style={{ fontFamily: serif, fontSize: 24 }}>{group.name}</Text>
                <Text style={{ color: colors.muted }}>{group.city} · {group.distanceLabel}</Text>
                <Text style={{ marginVertical: 6 }}>{group.ruleSummary}</Text>
                <Pill label={group.statusLabel} tone={group.promotionStatus} />
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
