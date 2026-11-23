import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  const timestamp = header
    .split(",")
    .find((part) => part.startsWith("t="))
    ?.slice(2);
  const signatures = header
    .split(",")
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 60 * 5) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  return signatures.some((signature) => {
    const given = Buffer.from(signature);
    return given.length === expectedBuffer.length && timingSafeEqual(given, expectedBuffer);
  });
}
