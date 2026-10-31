import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "STAFF") redirect("/");
  if (role === "COUPLE") redirect("/portal/couple");
  if (role === "VENDOR") redirect("/portal/vendor");

  redirect("/login");
}