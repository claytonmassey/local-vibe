import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/components/actions";
import { currentActor, destinationFor } from "@/lib/current";

export const metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const actor = await currentActor();
  if (actor) redirect(destinationFor(actor));
  return (
    <div className="site-wrap">
      <header className="site-header">
        <Link href="/"><Logo /></Link>
        <Link href="/sign-in">Create account</Link>
      </header>
      <main style={{ maxWidth: 440, margin: "12px auto 64px" }}>
        <SignInForm mode="signin" />
      </main>
    </div>
  );
}
