import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Welcome back</h1>
        <p className="mt-1 text-sm text-navy-600">Sign in to continue</p>
      </div>
      <AuthForm mode="login" />
      <p className="text-sm text-navy-600">
        Need an account?{" "}
        <Link href="/signup" className="cursor-pointer font-semibold text-gold-600 hover:text-gold-500">
          Sign up
        </Link>
      </p>
    </main>
  );
}
