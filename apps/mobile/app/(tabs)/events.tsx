import { useState } from "react";
import { LOCAL_EVENTS, type LocalEvent } from "@marketmap/domain";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Screen, serif } from "@/components/ui";

export default function EventsScreen() {
  const [tab, setTab] = useState<"upcoming" | "mine">("upcoming");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [extra, setExtra] = useState<LocalEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [place, setPlace] = useState("");
  const events = [...LOCAL_EVENTS, ...extra];
  const visible = tab === "mine" ? events.filter((event) => favorites.includes(event.id) || extra.some((item) => item.id === event.id)) : events;

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <Text style={{ fontFamily: serif, fontSize: 34, lineHeight: 38 }}>Networking & Events</Text>
          <Text style={{ color: colors.muted }}>Local meetings, mixers & vendor opportunities. Sample listings, not a live feed.</Text>
          <View style={{ flexDirection: "row", backgroundColor: "#efe6d6", borderRadius: 999, padding: 4 }}>
            {(["upcoming", "mine"] as const).map((value) => (
              <Pressable key={value} onPress={() => setTab(value)} style={{ flex: 1, backgroundColor: tab === value ? colors.forest : "transparent", borderRadius: 999, minHeight: 42, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: tab === value ? "white" : colors.ink, fontWeight: "700" }}>{value === "upcoming" ? "Upcoming Events" : "My Events"}</Text>
              </Pressable>
            ))}
          </View>
          {visible.map((event) => {
            const loved = favorites.includes(event.id);
            return (
              <View key={event.id} style={{ flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: colors.paper, borderRadius: 18, padding: 12 }}>
                <View style={{ width: 64, backgroundColor: "#f3e6cf", borderRadius: 14, alignItems: "center", paddingVertical: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700" }}>{event.month}</Text>
                  <Text style={{ fontFamily: serif, fontSize: 26 }}>{event.day}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800", fontSize: 16 }}>{event.title}</Text>
                  <Text style={{ color: colors.muted }}>{event.when}</Text>
                  <Text style={{ color: colors.muted }}>{event.place}</Text>
                </View>
                <Pressable accessibilityLabel={loved ? "Remove from my events" : "Save event"} onPress={() => setFavorites((current) => loved ? current.filter((id) => id !== event.id) : [...current, event.id])}>
                  <Text style={{ color: loved ? colors.clay : colors.muted, fontWeight: "700" }}>{loved ? "Saved" : "Save"}</Text>
                </Pressable>
              </View>
            );
          })}
          <Pressable onPress={() => setOpen((value) => !value)} style={{ backgroundColor: colors.forest, borderRadius: 999, minHeight: 48, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "white", fontWeight: "700" }}>+ Submit a Local Event</Text>
          </Pressable>
          {open ? (
            <View style={{ gap: 8 }}>
              <TextInput value={title} onChangeText={setTitle} placeholder="Event name" placeholderTextColor={colors.muted} style={field} />
              <TextInput value={when} onChangeText={setWhen} placeholder="Thu, Dec 4 · 5:30 PM" placeholderTextColor={colors.muted} style={field} />
              <TextInput value={place} onChangeText={setPlace} placeholder="Place" placeholderTextColor={colors.muted} style={field} />
              <Pressable onPress={() => {
                if (!title.trim() || !when.trim() || !place.trim()) return;
                const next: LocalEvent = { id: `evt_${Date.now()}`, month: "NEW", day: "•", date: "", title: title.trim(), when: when.trim(), place: place.trim() };
                setExtra((current) => [...current, next]);
                setFavorites((current) => [...current, next.id]);
                setTab("mine");
                setOpen(false);
                setTitle("");
                setWhen("");
                setPlace("");
              }} style={{ backgroundColor: colors.ink, borderRadius: 999, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "700" }}>Save event</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const field = { backgroundColor: "white", borderRadius: 14, minHeight: 46, paddingHorizontal: 12, color: colors.ink };
