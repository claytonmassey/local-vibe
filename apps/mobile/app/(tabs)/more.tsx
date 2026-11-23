import { router } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, colors, Screen, Title } from "@/components/ui";
import { apiBase } from "@/lib/api";
import { useSession } from "@/lib/session";

export default function MoreScreen() {
  const { me, signOut } = useSession();
  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Title kicker="More">{me?.user.name ?? "Account"}</Title>
          <Card>
            <Text>{me?.user.email}</Text>
            <Text style={{ color: colors.muted, marginTop: 6 }}>{me?.business ? `${me.business.name} · ${me.business.zip}` : "No business profile yet."}</Text>
            <Text style={{ color: colors.muted, marginTop: 6 }}>{me?.entitled ? `${me.editionName} is on this account.` : "No paid edition yet. Checkout stays on the web."}</Text>
          </Card>
          <Button label="Library" kind="ghost" onPress={() => router.push("/library")} />
          <Button label="Business profile" kind="ghost" onPress={() => router.push("/onboarding")} />
          <Text style={{ color: colors.muted, marginTop: 16 }}>Reminders are saved on the web profile and are not delivered in this release. API: {apiBase()}</Text>
          <Button label="Sign out" onPress={async () => { await signOut(); router.replace("/"); }} />
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
