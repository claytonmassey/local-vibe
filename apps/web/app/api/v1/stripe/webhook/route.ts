import { randomUUID } from "node:crypto";
import { jsonError, ApiError } from "@/lib/errors";
import { fulfillStripeSession } from "@/lib/services";
import { verifyStripeSignature } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = randomUUID();
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new ApiError(501, "stripe_not_configured", "Stripe is not configured. Live selling stays locked.");
    const signature = req.headers.get("stripe-signature");
    const payload = await req.text();
    if (!signature || !verifyStripeSignature(payload, signature, secret)) {
      throw new ApiError(400, "invalid_signature", "The Stripe signature did not verify.");
    }
    const event = JSON.parse(payload) as {
      id?: string;
      type?: string;
      data?: { object?: { client_reference_id?: string | null; amount_total?: number | null; currency?: string | null; payment_status?: string } };
    };
    if (!event.id || !event.type) throw new ApiError(422, "invalid_input", "Stripe sent an unreadable event.");
    if (event.type !== "checkout.session.completed") {
      return Response.json({ received: true, ignored: event.type, requestId });
    }
    const session = event.data?.object;
    const result = fulfillStripeSession({
      eventId: event.id,
      orderId: session?.client_reference_id ?? null,
      amountTotal: session?.amount_total ?? null,
      currency: session?.currency ?? null,
      paymentStatus: session?.payment_status ?? "unpaid",
    });
    return Response.json({ received: true, ...result, requestId });
  } catch (error) {
    const response = jsonError(error, requestId);
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
