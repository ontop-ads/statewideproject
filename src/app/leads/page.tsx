import { getSession } from "@/lib/auth";
import { LeadsTable } from "./leads-table";

export default async function LeadsPage() {
  const session = await getSession();
  const role = session?.role ?? "OPERADOR";
  return <LeadsTable role={role} />;
}
