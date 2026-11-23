import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, colors, Screen, serif, Status } from "@/components/ui";
import { useSession } from "@/lib/session";

export default function SignInScreen() {
  const { ready, me, signIn } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!ready) return <Screen><Status loading /></Screen>;
  if (me) return <Redirect href="/(tabs)" />;

  async function enter(mode: "fixture" | "create", account: string, display?: string) {
    setPending(true);
    setError(null);
    try {
      const session = await signIn(account, mode, display);
      router.replace(session.needsOnboarding ? "/onboarding" : "/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The API did not answer. Start the web app, then try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, gap: 14 }}>
          <Text style={{ color: "#5d6840", letterSpacing: 1.4, fontWeight: "700" }}>MARKETMAP</Text>
          <Text style={{ fontFamily: serif, fontSize: 46, lineHeight: 48, color: colors.ink }}>Plan the week. Respect the group.</Text>
          <Text style={{ color: colors.muted, fontSize: 16 }}>Sara already has the founding edition. A new account can walk the test checkout on the web, then open the same library here.</Text>
          <Button label={pending ? "Signing in…" : "Continue as Sara Hale"} disabled={pending} onPress={() => enter("fixture", "sara@wildorchid.example")} />
          <Button label="Publisher workspace" kind="ghost" disabled={pending} onPress={() => enter("fixture", "alex@marketmap.example")} />
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} style={field} />
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email for a new account" placeholderTextColor={colors.muted} style={field} />
          <Button label="Create account" kind="ghost" disabled={pending || !email.includes("@")} onPress={() => enter("create", email.trim(), name.trim())} />
          {error ? <Text style={{ color: colors.clay }}>{error}</Text> : null}
          <Pressable onPress={() => router.push("/onboarding")}><Text style={{ color: colors.forest }}> </Text></Pressable>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const field = { backgroundColor: "white", borderRadius: 14, minHeight: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, color: colors.ink };
