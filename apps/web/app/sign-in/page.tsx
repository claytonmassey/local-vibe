import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/components/actions";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="site-wrap">
      <header className="site-header">
        <Link href="/"><Logo /></Link>
      </header>
      <main className="grid-2" style={{ alignItems: "center", paddingBottom: 48 }}>
        <div>
          <p className="eyebrow">Fixture accounts</p>
          <h1 className="display" style={{ fontSize: "clamp(46px, 6vw, 72px)" }}>Come back to the same week.</h1>
          <p className="lede">Sara already owns the founding edition. Alex keeps the publisher queue. A new account starts without access, so you can walk the test checkout.</p>
        </div>
        <section className="card">
          <SignInForm />
        </section>
      </main>
    </div>
  );
}
