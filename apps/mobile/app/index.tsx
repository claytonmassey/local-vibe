import { useState } from "react";
import { Redirect, router } from "expo-router";
import { ScrollView, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, colors, Screen, serif, Status } from "@/components/ui";
import { useSession } from "@/lib/session";

export default function SignInScreen() {
  const { ready, me, signIn, signUp } = useSession();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!ready) return <Screen><Status loading /></Screen>;
  if (me) return <Redirect href="/(tabs)" />;

  async function submit() {
    if (mode === "signup" && password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const session = mode === "signup"
        ? await signUp(name.trim(), email.trim(), password)
        : await signIn(email.trim(), password);
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
          <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: -0.8, color: colors.ink }}><Text style={{ fontFamily: serif, fontWeight: "600" }}>Post</Text><Text style={{ color: colors.forest }}>Local</Text></Text>
          <Text style={{ fontFamily: serif, fontSize: 46, lineHeight: 48, color: colors.ink }}>{mode === "signup" ? "Create your account" : "Sign in"}</Text>
          {mode === "signup" ? <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.muted} style={field} /> : null}
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.muted} style={field} />
          <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor={colors.muted} style={field} />
          {mode === "signup" ? <TextInput value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Confirm password" placeholderTextColor={colors.muted} style={field} /> : null}
          {mode === "signup" ? <Text style={{ color: colors.muted }}>Use at least 8 characters.</Text> : null}
          <Button
            label={pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            disabled={pending || !email.includes("@") || password.length < (mode === "signup" ? 8 : 1) || (mode === "signup" && !name.trim())}
            onPress={submit}
          />
          <Button
            label={mode === "signup" ? "Already have an account? Sign in" : "Need an account? Create one"}
            kind="ghost"
            disabled={pending}
            onPress={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
              setPassword("");
              setConfirm("");
            }}
          />
          {error ? <Text style={{ color: colors.clay }}>{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const field = { backgroundColor: "white", borderRadius: 14, minHeight: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, color: colors.ink };
