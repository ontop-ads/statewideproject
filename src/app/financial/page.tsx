"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react"

export default function FinancialPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageJob: 0,
    projectsCount: 0,
    revenuePerLead: 0,
    jobsThisMonth: 0,
    avgTimeToClose: 0, // days
    serviceDistribution: [] as any[],
    monthlyData: [] as number[]
  })
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true)
        const [projectsRes, leadsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/leads')
        ])
        
        if (!projectsRes.ok || !leadsRes.ok) throw new Error("Failed to fetch data")
        
        const projects = await projectsRes.json()
        const leads = await leadsRes.json()
        
        const paidProjects = projects.filter((p: any) => p.paymentStatus === "Paid")
      
      const now = new Date()
      const currentYear = now.getFullYear()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const revenue = paidProjects.reduce((acc: number, p: any) => {
        const valueStr = p.value || "0"
        return acc + (parseFloat(valueStr.replace(/[^0-9.-]+/g, "")) || 0)
      }, 0)
      
      const avg = projects.length > 0 ? revenue / projects.length : 0
      const revenuePerLead = leads.length > 0 ? revenue / leads.length : 0
      const jobsThisMonth = projects.filter((p: any) => new Date(p.createdAt) >= firstOfMonth).length
      
      // Calculate Monthly Data for the chart
      const monthlyRevenue = new Array(12).fill(0)
      paidProjects.forEach((p: any) => {
        const date = new Date(p.createdAt)
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth()
          const val = parseFloat((p.value || "0").replace(/[^0-9.-]+/g, "")) || 0
          monthlyRevenue[month] += val
        }
      })

      // Avg Time to close (simplified: diff between lead creation and project creation)
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

      // Calculate Service Distribution
      const services = projects.reduce((acc: any, p: any) => {
        const type = p.name.split(' - ')[0] || "Others"
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})
      
      const distribution = Object.entries(services).map(([label, count]: [string, any]) => ({
        label,
        value: Math.round((count / projects.length) * 100),
        color: label === "Restoration" ? "bg-blue-500" : label === "Cleaning" ? "bg-emerald-500" : "bg-purple-500"
      }))

      setStats({
        totalRevenue: revenue,
        averageJob: Math.round(avg),
        projectsCount: projects.length,
        revenuePerLead: Math.round(revenuePerLead),
        jobsThisMonth,
        avgTimeToClose: Math.round(avgTimeToClose),
        serviceDistribution: distribution,
        monthlyData: monthlyRevenue
      })
    } catch (error) {
      console.error("Error fetching financial data:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  fetchFinancialData()
  }, [])

  const statCards = [
    { label: "Rev per Lead", value: `$${stats.revenuePerLead.toLocaleString()}`, icon: DollarSign, trend: null, positive: true },
    { label: "Jobs (Month)", value: stats.jobsThisMonth.toString(), icon: Briefcase, trend: null, positive: true },
    { label: "Close Time", value: `${stats.avgTimeToClose} Days`, icon: TrendingUp, trend: null, positive: true },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
        <p className="text-muted-foreground mt-1">Track your revenue and financial performance.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-muted-foreground animate-pulse">
          Loading financial data...

        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <stat.icon size={24} />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? 'text-emerald-500' : 'text-destructive'}`}>
                      {stat.trend}
                      {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-2xl p-4 md:p-8 lg:col-span-2 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Revenue Pipeline</h2>
                  <p className="text-sm text-muted-foreground">Monthly growth and projections</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/30" />
                    <span className="text-xs text-muted-foreground">Projection</span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-64 w-full flex items-end gap-1 md:gap-2 px-2 md:px-4 pt-8 overflow-x-auto">
                {/* Reset bar heights to a minimum or 0 */}
                {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative min-w-[20px]">
                    <div 
                      className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all flex items-end justify-center"
                      style={{ height: `${Math.max(stats.monthlyData[i] / 500, 4)}px` }}
                    >
                      <div 
                        className="w-full bg-primary rounded-t-sm" 
                        style={{ height: `2px` }} 
                      />
                      <div className="absolute -top-8 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 w-max">
                        ${stats.monthlyData[i].toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Service Distribution</h2>
              <div className="space-y-6">
                {stats.serviceDistribution.length > 0 ? stats.serviceDistribution.map((service, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">{service.label}</span>
                      <span className="font-bold">{service.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${service.color}`} 
                        style={{ width: `${service.value}%` }} 
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground italic">No project data available yet.</p>
                )}
              </div>
              <div className="mt-12 p-4 bg-muted rounded-xl text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on the last <span className="text-foreground font-bold">180 days</span> of completed projects.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
