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
      <main style={{ maxWidth: 440, margin: "12px auto 64px" }}>
        <SignInForm />
      </main>
    </div>
  );
}
