"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError("Unable to send reset email. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-800">Check your email</p>
        <p className="mt-2 text-sm text-neutral-600">
          If an account exists for {email}, a password reset link has been sent.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-sm text-neutral-500">
        Enter your account email and we&apos;ll send you a link to reset your password.
      </p>
      <FieldGroup>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </FieldGroup>
      <FieldError>{error ?? undefined}</FieldError>
      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>
      <p className="mt-4 text-center text-sm text-neutral-500">
        <Link href="/login" className="text-primary-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
