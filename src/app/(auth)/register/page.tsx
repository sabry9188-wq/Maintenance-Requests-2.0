"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message.includes("already registered") ? "An account with this email already exists." : "Unable to create account. Please try again.");
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-800">Account created</p>
        <p className="mt-2 text-sm text-neutral-600">
          Check your email to confirm your account, then sign in. An Administrator will assign your
          station, department and role before you can create or view requests.
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
        New accounts start with no station/department assigned. An Administrator will set your access
        after registration.
      </p>
      <FieldGroup>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FieldGroup>
      <FieldError>{error ?? undefined}</FieldError>
      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
