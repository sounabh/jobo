import { redirect } from "next/navigation";

type SearchParams = Promise<{ next?: string }>;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = params.next ? `?mode=signup&next=${encodeURIComponent(params.next)}` : "?mode=signup";
  redirect(`/login${next}`);
}

//Hey, you're asking for signup. Go to the login page, but tell it to open the form in signup mode.