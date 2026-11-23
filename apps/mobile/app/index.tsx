import { useState } from "react";
import { Redirect, router } from "expo-router";
import { ScrollView, Text, TextInput } from "react-native";
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

  async function createAccount() {
    setPending(true);
    setError(null);
    try {
      const session = await signIn(email.trim(), "create", name.trim());
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
          <Text style={{ fontFamily: serif, fontSize: 46, lineHeight: 48, color: colors.ink }}>Create your account</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.muted} style={field} />
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.muted} style={field} />
          <Button label={pending ? "Creating account…" : "Create account"} disabled={pending || !name.trim() || !email.includes("@")} onPress={createAccount} />
          {error ? <Text style={{ color: colors.clay }}>{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const field = { backgroundColor: "white", borderRadius: 14, minHeight: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, color: colors.ink };
