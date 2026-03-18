import { getSession } from "@/lib/auth";
import { Dashboard } from "./dashboard";

export default async function HomePage() {
  const session = await getSession();
  if (!session) return null; // Middleware will handle redirect
  const role = session.role;
  return <Dashboard role={role} />;
}
