import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersManagement } from "./users-management";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }
  return <UsersManagement currentUserId={session.id} />;
}
