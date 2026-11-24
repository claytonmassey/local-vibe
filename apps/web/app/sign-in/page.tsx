import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/components/actions";
import { currentActor, destinationFor } from "@/lib/current";

export const metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const actor = await currentActor();
  if (actor) redirect(destinationFor(actor));
  return (
    <div className="site-wrap">
      <header className="site-header">
        <Link href="/"><Logo /></Link>
        <Link href="/login">Log in</Link>
      </header>
      <main style={{ maxWidth: 440, margin: "12px auto 64px" }}>
        <SignInForm mode="signup" />
      </main>
    </div>
  );
}
