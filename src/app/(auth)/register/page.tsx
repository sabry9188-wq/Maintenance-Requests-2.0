"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FieldGroup, FieldError } from "@/components/ui/input";

interface Option {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stationId, setStationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [stations, setStations] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("stations")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setStations(data ?? []));
    supabase
      .from("departments")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setDepartments(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!stationId || !departmentId) {
      setError("Please select your station and department.");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, station_id: stationId, department_id: departmentId } },
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
          Check your email to confirm your account, then sign in. Your station and department are
          already set - an Administrator can adjust them later if needed.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
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
      <FieldGroup>
        <Label htmlFor="station_id">Station</Label>
        <Select id="station_id" required value={stationId} onChange={(e) => setStationId(e.target.value)}>
          <option value="">Select your station</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="department_id">Department</Label>
        <Select id="department_id" required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">Select your department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
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
