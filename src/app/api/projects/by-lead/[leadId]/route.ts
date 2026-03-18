import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const CAN_MUTATE = ["ADMIN", "MARKETING"];

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const session = await getSession();
  if (!session || !CAN_MUTATE.includes(session.role)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const leadId = parseInt(resolvedParams.leadId);

    // Delete the project linked to this lead (if any)
    await prisma.project.deleteMany({
      where: { leadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project by leadId:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
