import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Only Admin and Financeiro can create/manage projects
const CAN_MANAGE_PROJECTS = ["ADMIN", "FINANCE"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let dateFilter = {};
    if (month && year) {
      const monthInt = parseInt(month);
      const yearInt = parseInt(year);
      
      const startDate = new Date(yearInt, monthInt - 1, 1);
      const endDate = new Date(yearInt, monthInt, 1);
      
      dateFilter = {
        createdAt: {
          gte: startDate,
          lt: endDate,
        }
      };
    }

    const projects = await (prisma.project as any).findMany({
      where: dateFilter,
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
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
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

    // Creating project without typing to bypass stale generated client
    const projectClient = prisma.project as any;
    const newProject = await projectClient.create({
      data: {
        leadId: data.leadId,
        name: data.name,
        client: data.client,
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
