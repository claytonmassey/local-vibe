import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSession } from "@/lib/session";
import { colors } from "@/components/ui";

function tint(color: unknown): string {
  return typeof color === "string" ? color : colors.forest;
}

export default function TabsLayout() {
  const { ready, me } = useSession();
  if (!ready) return null;
  if (!me) return <Redirect href="/" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: "#fbf7f1", borderTopColor: colors.line, height: 62, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={tint(color)} size={size} /> }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar", tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={tint(color)} size={size} /> }} />
      <Tabs.Screen name="studio" options={{ title: "Studio", tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" color={tint(color)} size={size} /> }} />
      <Tabs.Screen name="groups" options={{ title: "Groups", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={tint(color)} size={size} /> }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" color={tint(color)} size={size} /> }} />
    </Tabs>
  );
}
