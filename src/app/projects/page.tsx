import { getSession } from "@/lib/auth";
import { ProjectsGrid } from "./projects-grid";

export default async function ProjectsPage() {
  const session = await getSession();
  const role = session?.role ?? "OPERADOR";
  return <ProjectsGrid role={role} />;
}
