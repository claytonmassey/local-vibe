import { useState } from "react";
import { MONTH_GLANCE } from "@marketmap/domain";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Screen, serif } from "@/components/ui";

export default function CalendarScreen() {
  const [year, setYear] = useState(2026);
  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View>
            <Text style={{ fontFamily: serif, fontSize: 34, lineHeight: 38, color: colors.ink }}>Year at a Glance</Text>
            <Text style={{ color: colors.muted }}>Major marketing days, holidays and campaigns.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", borderRadius: 999, paddingHorizontal: 16, minHeight: 48 }}>
            <Pressable onPress={() => setYear((value) => value - 1)} accessibilityLabel="Previous year"><Text style={{ fontSize: 22 }}>‹</Text></Pressable>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>{year}</Text>
            <Pressable onPress={() => setYear((value) => value + 1)} accessibilityLabel="Next year"><Text style={{ fontSize: 22 }}>›</Text></Pressable>
          </View>
          <Pressable onPress={() => router.push("/events")} style={{ backgroundColor: colors.forest, borderRadius: 999, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "white", fontWeight: "700" }}>Networking & events</Text>
          </Pressable>
          {MONTH_GLANCE.map((month) => (
            <Pressable key={month.month} onPress={() => router.push({ pathname: "/today", params: { date: `${year}-${String(month.month).padStart(2, "0")}-01` } })} style={{ flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: colors.paper, borderRadius: 18, padding: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e7efe8", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.forest, fontWeight: "700" }}>{String(month.month).padStart(2, "0")}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: serif, fontSize: 24 }}>{month.name}</Text>
                <Text style={{ color: colors.muted }}>{month.summary}</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 22 }}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
