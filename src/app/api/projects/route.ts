import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Only Admin and Financeiro can create/manage projects
const CAN_MANAGE_PROJECTS = ["ADMIN", "FINANCEIRO"];

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { lead: true }
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !CAN_MANAGE_PROJECTS.includes(session.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    // Check if the project already exists for this lead
    if (data.leadId) {
      const existing = await prisma.project.findFirst({
        where: { leadId: data.leadId }
      });
      if (existing) {
        return NextResponse.json(existing, { status: 200 }); // Prevent duplicates
      }
    }

    const newProject = await prisma.project.create({
      data: {
        leadId: data.leadId,
        name: data.name,
        client: data.client,
        value: data.value,
        deadline: data.deadline || "TBD",
        status: data.status || "Planning",
        paymentStatus: data.paymentStatus || "Unpaid",
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
