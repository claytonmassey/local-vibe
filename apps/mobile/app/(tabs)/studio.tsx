import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { civilToday } from "@marketmap/domain";
import { ScrollView, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { Button, Card, colors, Screen, serif, Title } from "@/components/ui";
import { useSession } from "@/lib/session";

export default function StudioScreen() {
  const { me } = useSession();
  const [points, setPoints] = useState("");
  const [body, setBody] = useState("");
  const [reminders, setReminders] = useState<string[]>([]);
  const [groupUrl, setGroupUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const today = civilToday(me?.business?.timeZone || "America/Chicago");

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Title kicker="Post studio">A draft with the brakes on.</Title>
          <Text style={{ color: colors.muted, marginBottom: 10 }}>{me?.business ? me.business.name : "Add a business on the web or in More before drafting."}</Text>
          <TextInput value={points} onChangeText={setPoints} multiline placeholder="Optional talking points. Leave blank and nothing is invented." placeholderTextColor={colors.muted} style={{ minHeight: 100, backgroundColor: "white", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.line }} />
          <Button label={pending ? "Writing…" : "Generate draft"} disabled={pending || !me?.business} onPress={async () => {
            setPending(true);
            setError(null);
            try {
              const draft = await api.generateDraft({ date: today, tone: me?.business?.tone || "Friendly", talkingPoints: points });
              setBody(draft.body);
              setReminders(draft.reminders);
              setGroupUrl(draft.groupUrl);
            } catch (err) {
              setError(err instanceof Error ? err.message : "The draft could not be written. Your notes are still above.");
            } finally {
              setPending(false);
            }
          }} />
          {error ? <Text style={{ color: colors.clay, marginTop: 8 }}>{error}</Text> : null}
          {body ? (
            <Card>
              <Text style={{ fontFamily: serif, fontSize: 18, lineHeight: 26 }}>{body}</Text>
              <Button label="Copy draft" kind="ghost" onPress={() => Clipboard.setStringAsync(body)} />
              {groupUrl ? <Button label="Open group" kind="ghost" onPress={() => Linking.openURL(groupUrl)} /> : null}
              {reminders.map((item) => <Text key={item} style={{ color: colors.muted, marginTop: 6 }}>{item}</Text>)}
            </Card>
          ) : <Text style={{ marginTop: 16, color: colors.muted }}>Nothing drafted yet. Copying never marks a post done.</Text>}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
