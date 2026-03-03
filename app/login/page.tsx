import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const store = await cookies();
  const session = store.get("nt_session")?.value;

  if (session) {
    redirect("/");
  }

  const sp = searchParams ?? {};
  return <LoginClient nextPath={sp.next} />;
}