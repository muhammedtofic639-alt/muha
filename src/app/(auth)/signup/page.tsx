import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Create your account</h1>
        <p className="mt-1 text-sm text-navy-600">Step 1 of 4 — Email &amp; password</p>
      </div>
      <AuthForm mode="signup" />
      <p className="text-sm text-navy-600">
        Already have an account?{" "}
        <Link href="/login" className="cursor-pointer font-semibold text-gold-600 hover:text-gold-500">
          Sign in
        </Link>
      </p>
    </main>
  );
}
