import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalLeads,
      leadsThisMonth,
      leadsToday,
      totalProjects,
      projectsThisMonth,
      leadsBySource,
      leadsByService,
      projectsByLead,
      leadsByStatus
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: firstOfMonth } } }),
      prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.project.count(),
      prisma.project.count({ where: { createdAt: { gte: firstOfMonth } } }),
      prisma.lead.groupBy({
        by: ['source'],
        _count: { _all: true }
      }),
      prisma.lead.groupBy({
        by: ['serviceType'],
        _count: { _all: true }
      }),
      prisma.project.findMany({
        where: { NOT: { leadId: null } },
        select: { createdAt: true, lead: { select: { createdAt: true } } }
      }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    // Calculate Avg Close Time
    let totalDays = 0;
    projectsByLead.forEach((p: any) => {
      if (p.lead) {
        const diff = p.createdAt.getTime() - p.lead.createdAt.getTime();
        totalDays += diff / (1000 * 60 * 60 * 24);
      }
    });
    const avgTimeToClose = projectsByLead.length > 0 ? Math.round(totalDays / projectsByLead.length) : 0;

    // Format Source Data
    const sourceData = leadsBySource.map(s => ({
      name: s.source || "Referral",
      count: s._count._all,
      percent: totalLeads > 0 ? Math.round((s._count._all / totalLeads) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Format Service Data
    const serviceData = leadsByService.map(s => ({
      name: s.serviceType || "Unknown",
      count: s._count._all,
      percent: totalLeads > 0 ? Math.round((s._count._all / totalLeads) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Format Status Data
    const statusData = leadsByStatus.reduce((acc: any, s) => {
      acc[s.status] = s._count._all;
      return acc;
    }, {});

    const confirmedJobs = statusData["Confirmed Job"] || 0;
    const conversionRate = totalLeads > 0 ? Math.round((confirmedJobs / totalLeads) * 100) : 0;

    // Final Payload
    return NextResponse.json({
      totalLeads,
      leadsThisMonth,
      leadsToday,
      totalProjects,
      projectsThisMonth,
      avgTimeToClose,
      conversionRate,
      sourceData,
      serviceData,
      statusData,
      confirmedJobs
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
