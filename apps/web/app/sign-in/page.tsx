import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/components/actions";

export const metadata = { title: "Create account" };

export default function SignInPage() {
  return (
    <div className="site-wrap">
      <header className="site-header">
        <Link href="/"><Logo /></Link>
      </header>
      <main className="grid-2" style={{ alignItems: "center", paddingBottom: 48 }}>
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="display" style={{ fontSize: "clamp(46px, 6vw, 72px)" }}>Start with your name.</h1>
          <p className="lede">Register first. A new account has no edition yet, so checkout at $7.99 can unlock it. The same email brings you back.</p>
        </div>
        <section className="card">
          <SignInForm />
        </section>
      </main>
    </div>
  );
}
