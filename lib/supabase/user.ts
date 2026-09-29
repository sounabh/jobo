import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub as string | undefined;

  return {
    supabase,
    userId,
    claims: claimsData?.claims,
  };
}