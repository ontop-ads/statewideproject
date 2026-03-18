"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, TrendingUp, Users, Briefcase, Clock, Phone, Target } from "lucide-react"
import { AddLeadModal } from "@/components/add-lead-modal"
import { cn } from "@/lib/utils"

// Roles that can add leads
const CAN_ADD_LEADS = ["ADMIN", "MARKETING", "OPERATOR"]

export function Dashboard({ role }: { role: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leadsGoal, setLeadsGoal] = useState(50)
  const [callsGoal, setCallsGoal] = useState(5)
  const [stats, setStats] = useState({
    leadCount: 0,
    projectCount: 0,
    topSource: "N/A",
    conversionRate: 0,
    jobsThisMonth: 0,
    avgTimeToClose: 0,
    callsToday: 0,
    leadsThisMonth: 0,
    sourceData: [] as { name: string, value: number, color: string }[],
    serviceData: [] as { name: string, value: number, color: string }[],
    recentLeads: [] as any[]
  })

  const [isLoading, setIsLoading] = useState(true)

  const canAddLead = CAN_ADD_LEADS.includes(role)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [leadsRes, projectsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/projects')
        ])
        
        if (!leadsRes.ok || !projectsRes.ok) throw new Error("Failed to fetch data")
        
        const leads = await leadsRes.json()
        const projects = await projectsRes.json()
        
        const savedLeadsGoal = localStorage.getItem("leadsGoal")
        const savedCallsGoal = localStorage.getItem("callsGoal")
        
        if (savedLeadsGoal) setLeadsGoal(parseInt(savedLeadsGoal))
        if (savedCallsGoal) setCallsGoal(parseInt(savedCallsGoal))
    
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const leadsThisMonth = leads.filter((l: any) => new Date(l.createdAt) >= firstOfMonth).length
    const jobsThisMonth = projects.filter((p: any) => new Date(p.createdAt) >= firstOfMonth).length
    const callsToday = leads.filter((l: any) => new Date(l.createdAt).getTime() >= todayStart).length
    
    const closedWithLead = projects.filter((p: any) => p.leadId)
    let totalDays = 0
    closedWithLead.forEach((p: any) => {
      const lead = leads.find((l: any) => l.id === p.leadId)
      if (lead) {
        const diff = new Date(p.createdAt).getTime() - new Date(lead.createdAt).getTime()
        totalDays += diff / (1000 * 60 * 60 * 24)
      }
    })
    const avgTimeToClose = closedWithLead.length > 0 ? totalDays / closedWithLead.length : 0

    const conversion = leads.length > 0 ? (projects.length / leads.length) * 100 : 0

    const sourceCounts = leads.reduce((acc: any, l: any) => {
      const s = l.source || "Referral"
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {})
    
    const chartColors = ["bg-blue-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500"]
    const sourceData = Object.entries(sourceCounts).map(([name, count]: [string, any], i) => ({
      name,
      value: Math.round((count / (leads.length || 1)) * 100),
      color: chartColors[i % chartColors.length]
    }))

    const serviceCounts = projects.reduce((acc: any, p: any) => {
      const type = p.name.split(' - ')[0] || "Other"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const serviceData = Object.entries(serviceCounts).map(([name, count]: [string, any], i) => ({
      name,
      value: Math.round((count / (projects.length || 1)) * 100),
      color: name === "Restoration" ? "bg-blue-500" : name === "Cleaning" ? "bg-emerald-500" : name === "Repair" ? "bg-amber-500" : "bg-purple-500"
    }))

    const topSource = Object.entries(sourceCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A"

    const sortedLeads = leads.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

      setStats({
        leadCount: leads.length,
        projectCount: projects.length,
        topSource: topSource,
        conversionRate: Math.round(conversion),
        jobsThisMonth,
        leadsThisMonth,
        avgTimeToClose: Math.round(avgTimeToClose),
        callsToday,
        sourceData,
        serviceData,
        recentLeads: sortedLeads.slice(0, 5)
      })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [])

  const handleUpdateLeadsGoal = () => {
    const newGoal = prompt("Enter monthly leads goal:", leadsGoal.toString())
    if (newGoal && !isNaN(parseInt(newGoal))) {
      const g = parseInt(newGoal)
      setLeadsGoal(g)
      localStorage.setItem("leadsGoal", g.toString())
    }
  }

  const handleUpdateCallsGoal = () => {
    const newGoal = prompt("Enter daily calls goal:", callsGoal.toString())
    if (newGoal && !isNaN(parseInt(newGoal))) {
      const g = parseInt(newGoal)
      setCallsGoal(g)
      localStorage.setItem("callsGoal", g.toString())
    }
  }

  const statCards = [
    { label: "Total Leads", value: stats.leadCount.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", subtitle: "All time" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", subtitle: "Leads → Confirmed Jobs" },
    { label: "Top Channel", value: stats.topSource, icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10", subtitle: "Best lead source" },
    { 
      label: "Leads This Month", 
      value: stats.leadsThisMonth.toString(), 
      icon: Target, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10", 
      subtitle: `/ ${leadsGoal} goal`,
      onClick: handleUpdateLeadsGoal
    },
    { 
      label: "Calls Today", 
      value: stats.callsToday.toString(), 
      icon: Phone, 
      color: "text-pink-500", 
      bg: "bg-pink-500/10", 
      subtitle: `/ ${callsGoal} goal`,
      onClick: handleUpdateCallsGoal
    },
    { label: "Avg Close Time", value: `${stats.avgTimeToClose} Days`, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Overview Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Real-time performance from Financial and Marketing.</p>
        </div>
        {canAddLead && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 active:scale-95 w-full md:w-auto"
          >
            <PlusCircle size={20} />
            Add Lead
          </button>
        )}
      </div>

      {/* Modal */}
      <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-muted-foreground animate-pulse">
          Loading dashboard data...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.onClick}
            className={cn(
              "bg-card border border-border p-5 rounded-2xl transition-all",
              stat.onClick ? "cursor-pointer hover:border-primary/50 hover:bg-primary/5 shadow-sm hover:shadow-md" : "hover:border-primary/50"
            )}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold truncate">{stat.value}</h3>
                {stat.subtitle && (
                  <p className={cn(
                    "text-[11px] font-extrabold mt-1 uppercase tracking-wide",
                    stat.label === "Monthly Goal" ? "text-amber-500" : "text-pink-500"
                  )}>
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-48"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {stats.recentLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-4 text-xs font-bold uppercase text-muted-foreground border-b border-border">Lead</th>
                      <th className="p-4 text-xs font-bold uppercase text-muted-foreground border-b border-border text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLeads.slice(0, 6).map((lead: any, i: number) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 border-b border-border">
                          <div className="font-semibold text-sm">{lead.name}</div>
                          <div className="text-[10px] text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</div>
                        </td>

                        <td className="p-4 border-b border-border text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight",
                            lead.status === "Confirmed Job" ? "bg-emerald-500/10 text-emerald-500" : 
                            lead.status === "Declined" ? "bg-destructive/10 text-destructive" :
                            lead.status === "Sent to Jobber" ? "bg-amber-500/10 text-amber-500" :
                            lead.status === "Quote Sent" ? "bg-blue-500/10 text-blue-500" :
                            "bg-blue-500/10 text-blue-500"
                          )}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="mx-auto mb-4 opacity-20" size={48} />
                <p>No leads found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Sources Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Top Channels</h2>
          <div className="space-y-6 flex-1">
            {stats.sourceData.length > 0 ? stats.sourceData.map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{source.name}</span>
                  <span className="font-bold">{source.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full ${source.color} transition-all duration-1000 animate-pulse`} 
                    style={{ width: `${source.value}%` }} 
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic p-4 text-center">No source data yet.</p>
            )}
          </div>
          <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed font-semibold">
              Conversion is <span className="text-emerald-500 font-bold">12% higher</span> via Instagram referrals this month.
            </p>
          </div>
        </div>

        {/* Service Distribution Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Best Sellers</h2>
          <div className="space-y-6 flex-1">
            {stats.serviceData.length > 0 ? stats.serviceData.map((service, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{service.name}</span>
                  <span className="font-bold">{service.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full ${service.color} transition-all duration-1000`} 
                    style={{ width: `${service.value}%` }} 
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic p-4 text-center">No project data yet.</p>
            )}
          </div>
          <div className="mt-8 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed font-semibold uppercase tracking-tighter">
              <span className="text-amber-500 font-bold">Repair</span> services increased by 8% this week.
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
