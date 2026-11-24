import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { Button, colors, Screen, serif } from "@/components/ui";
import { useSession } from "@/lib/session";

export default function OnboardingScreen() {
  const { me, refresh } = useSession();
  const [businessName, setBusinessName] = useState(me?.business?.name ?? "");
  const [category, setCategory] = useState(me?.business?.category ?? "");
  const [zip, setZip] = useState(me?.business?.zip ?? "77354");
  const [offerings, setOfferings] = useState(me?.business?.offerings ?? "");
  const [error, setError] = useState<string | null>(null);

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
          <Text style={{ fontFamily: serif, fontSize: 36 }}>What is true about the business?</Text>
          <TextInput value={businessName} onChangeText={setBusinessName} placeholder="Business name" placeholderTextColor={colors.muted} style={field} />
          <TextInput value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor={colors.muted} style={field} />
          <TextInput value={zip} onChangeText={setZip} placeholder="ZIP" placeholderTextColor={colors.muted} style={field} />
          <TextInput value={offerings} onChangeText={setOfferings} placeholder="Offerings" placeholderTextColor={colors.muted} multiline style={[field, { minHeight: 90 }]} />
          <Button label="Look around first" kind="ghost" onPress={() => router.replace("/(tabs)")} />
          <Button label="Save" onPress={async () => {
            try {
              await api.saveProfile({ businessName, category, zip, timeZone: "America/Chicago", offerings, tone: me?.business?.tone || "Friendly" });
              await refresh();
              router.replace("/(tabs)");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not save.");
            }
          }} />
          {error ? <Text style={{ color: colors.clay }}>{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const field = { backgroundColor: "white", borderRadius: 14, minHeight: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, color: colors.ink };
