"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();

    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage("Check your email to confirm your account.");
      return;
    }

    router.replace("/");
  }

  async function googleLogin() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <Card className="w-full max-w-md animate-fade-up p-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-acid text-ink">
          <Dumbbell size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-black">LiftLoop</h1>
          <p className="text-sm text-steel">Track every rep in the loop.</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 rounded-lg border border-line bg-white/[0.03] p-1">
        <button
          className={`h-10 rounded-md text-sm font-semibold ${mode === "sign-in" ? "bg-white/10 text-white" : "text-steel"}`}
          onClick={() => setMode("sign-in")}
        >
          Login
        </button>
        <button
          className={`h-10 rounded-md text-sm font-semibold ${mode === "sign-up" ? "bg-white/10 text-white" : "text-steel"}`}
          onClick={() => setMode("sign-up")}
        >
          Sign up
        </button>
      </div>

      <div className="space-y-3">
        <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button className="w-full" onClick={submit} disabled={loading || !email || password.length < 6}>
          <Mail size={18} />
          {mode === "sign-in" ? "Login with email" : "Create account"}
        </Button>
        <Button className="w-full" variant="secondary" onClick={googleLogin}>
          Continue with Google
        </Button>
      </div>

      {message && <p className="mt-4 rounded-lg border border-line bg-white/[0.04] p-3 text-sm text-steel">{message}</p>}
    </Card>
  );
}
