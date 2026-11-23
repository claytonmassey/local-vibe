import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AssetDto, OrderDto } from "@marketmap/contracts";
import { api } from "@/lib/api";
import { Card, colors, Screen, serif, Status } from "@/components/ui";

export default function LibraryScreen() {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api.orders().then((result) => { setOrders(result.items); setAssets(result.assets); }).catch((err) => setError(err instanceof Error ? err.message : "Could not load the library."));
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: colors.forest }}>More</Text></Pressable>
          <Text style={{ fontFamily: serif, fontSize: 36, marginVertical: 8 }}>Library</Text>
          <Status loading={!orders && !error} error={error} onRetry={load} />
          <Text style={{ color: colors.muted, marginBottom: 10 }}>Files download from the signed-in web library. This screen shows the same entitlement.</Text>
          {assets.map((asset) => <Card key={asset.id}><Text style={{ fontFamily: serif, fontSize: 22 }}>{asset.label}</Text><Text>Ready on the web</Text></Card>)}
          {orders?.map((order) => <Card key={order.id}><Text>{order.offerName}</Text><Text style={{ color: colors.muted }}>{order.amountLabel} · {order.status} · {order.mode}</Text></Card>)}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
