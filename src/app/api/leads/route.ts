import { NextResponse } from "next/server"; // Cache bust: 2026-03-14T12:37:00
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Roles that can create leads
const CAN_CREATE_LEADS = ["ADMIN", "MARKETING", "OPERATOR"];
// Operadores cannot edit or delete
const CAN_MUTATE_LEADS = ["ADMIN", "MARKETING"];

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

    const leads = await prisma.lead.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !CAN_CREATE_LEADS.includes(session.role)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  try {
    const data = await request.json();
    console.log("Creating lead with data:", JSON.stringify(data, null, 2));

    // Basic validation to prevent Prisma crashes on missing fields
    if (!data.name || !data.phone) {
      return NextResponse.json({ error: "Missing required contact information." }, { status: 400 });
    }
    
    const newLead = await (prisma.lead as any).create({
      data: {
        name: data.name,
        email: data.email || "",
        phone: data.phone,
        serviceType: data.serviceType || "Restoration",
        status: "New",
        street: data.street || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "OTHER",
        source: data.source || "Referral",
      },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: any) {
    console.error("CRITICAL: Error creating lead:", error);
    // Return specific error message if available
    return NextResponse.json({ 
      error: "Failed to create lead", 
      details: error?.message || "Unknown error" 
    }, { status: 500 });
  }
}
