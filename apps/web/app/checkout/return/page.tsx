import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { currentActor } from "@/lib/current";
import { reconcileOrder } from "@/lib/services";
import { ApiError } from "@/lib/errors";

export const metadata = { title: "Order" };

export default async function ReturnPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const actor = await currentActor();
  if (!actor) redirect("/sign-in");
  if (!order) redirect("/library");
  let status = "unknown";
  let message = "The order could not be read.";
  try {
    const result = reconcileOrder(actor, order);
    status = result.status;
    message = result.status === "paid"
      ? "The server confirmed this test order. The edition is on your account."
      : `Order status: ${result.status}. Files stay locked.`;
  } catch (error) {
    if (error instanceof ApiError) message = error.message;
  }
  return (
    <div className="site-wrap">
      <header className="site-header"><Link href="/"><Logo /></Link></header>
      <main className="card" style={{ maxWidth: 640 }}>
        <p className="eyebrow">Test checkout</p>
        <h1 className="display" style={{ fontSize: 52 }}>{status === "paid" ? "You’re in." : "Not unlocked."}</h1>
        <p>{message}</p>
        <Link className="btn primary" href="/library">Go to the library</Link>
      </main>
    </div>
  );
}
