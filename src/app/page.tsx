import { getSession } from "@/lib/auth";
import { Dashboard } from "./dashboard";

export default async function HomePage() {
  const session = await getSession();
  const role = session?.role ?? "OPERADOR";
  return <Dashboard role={role} />;
}
