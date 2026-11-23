import Link from "next/link";
import { CheckoutButton, RefundButton } from "@/components/actions";
import { currentActor } from "@/lib/current";
import { catalog, listOrders } from "@/lib/services";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const actor = await currentActor();
  const orders = listOrders(actor);
  const { edition } = catalog();
  return (
    <div className="stack" style={{ gap: 18 }}>
      <header>
        <p className="eyebrow">Buyer library</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>{orders.entitled ? edition.name : "The edition is waiting."}</h1>
        <p className="lede">{edition.updateSummary} {edition.refundSummary}</p>
      </header>
      {orders.entitled ? (
        <section className="grid-3">
          {orders.assets.map((asset) => (
            <a key={asset.id} className="card" href={`/api/v1/editions/ed_founding/downloads/${asset.id}`}>
              <p className="eyebrow">{asset.kind === "pdf" ? "PDF" : "Spreadsheet"}</p>
              <h2>{asset.label}</h2>
              <p className="meta">Short-lived for this signed-in session. Refresh the library to download again.</p>
            </a>
          ))}
        </section>
      ) : (
        <section className="card">
          <p className="eyebrow">{edition.priceLabel}</p>
          <h2>PDF, spreadsheet and calendar.</h2>
          <p>Stripe is not connected yet, so checkout unlocks the edition without a charge. The return page still confirms the order on the server.</p>
          <CheckoutButton />
        </section>
      )}
      <section className="stack">
        <h2 className="serif">Orders</h2>
        {orders.items.length === 0 ? <p className="muted">No orders yet.</p> : orders.items.map((order) => (
          <article key={order.id} className="card flat split-line">
            <div>
              <strong>{order.offerName}</strong>
              <p className="meta">{order.amountLabel} · {order.mode === "demo" ? "Test" : "Stripe"} · {order.status}</p>
            </div>
            {order.mode === "demo" && order.status === "paid" ? <RefundButton orderId={order.id} /> : null}
          </article>
        ))}
      </section>
      <p><Link href="/plan/print">Print this week’s plan</Link></p>
    </div>
  );
}
