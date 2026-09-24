"use server"; //server actions

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


/*// This describes what our Server Action can return.
// Example:
// { error: "Wrong password" }
// OR
// { message: "Check your email..." } 
// so we used optinal type chhecking
* */
export type AuthState = {
  error?: string;
  message?: string;
};

function getOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInWithEmail(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> { 

  //data 

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard"); // // Get the page where the user should go after login.


  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();  // Create a Supabase server client.
  const { error } = await supabase.auth.signInWithPassword({ email, password }); //auth the user

  if (error) {
    return { error: error.message }; //supabase error returns authState
  }

  redirect(next.startsWith("/") ? next : "/dashboard"); // on success redirect
}

//_prev and formData are by default set by server actions internally
export async function signUpWithEmail(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {

  //data

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || undefined }, // // Store additional user information in Supabase's user metadata.
      emailRedirectTo: `${getOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  //// Sometimes Supabase immediately creates a session in that case redirect
  if (data.session) {
    redirect(next.startsWith("/") ? next : "/dashboard");
  }

  return {
    message: "Check your email to confirm your account, then sign in.",
  };
}

export async function signInWithGitHub(formData: FormData) {

  // // Only allow internal paths like /dashboard.
  // If someone sends an external URL, fall back to /dashboard.

  const nextRaw = String(formData.get("next") ?? "/dashboard");
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard"; 


  const supabase = await createClient();
   // This is the URL GitHub/Supabase should return to
  // after the OAuth process finishes.
  const redirectTo = `${getOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=Unable%20to%20start%20GitHub%20sign-in");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}



/*User clicks Sign In
       ↓
<form action={formAction}>
       ↓
React calls signInWithEmail()
       ↓
signInWithEmail(
    previousState,
    formData
    
)* */