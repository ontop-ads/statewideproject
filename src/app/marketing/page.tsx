"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, Target, Instagram, Search, Share2, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MarketingPage() {
  const [data, setData] = useState({
    totalLeads: 0,
    leadQuality: 0,
    sources: [
      { key: "Google Ads - NY", label: "Google Ads - NY", icon: Search, value: 0, color: "bg-blue-600", textColor: "text-blue-600", leads: 0, growth: "+0%" },
      { key: "Google Ads - NJ", label: "Google Ads - NJ", icon: Search, value: 0, color: "bg-orange-500", textColor: "text-orange-500", leads: 0, growth: "+0%" },
      { key: "Google Ads - Westchester", label: "Google Ads - Westchester", icon: Search, value: 0, color: "bg-purple-500", textColor: "text-purple-500", leads: 0, growth: "+0%" },

      { key: "Instagram", label: "Instagram", icon: Instagram, value: 0, color: "bg-pink-500", textColor: "text-pink-500", leads: 0, growth: "+0%" },
      { key: "Referral", label: "Referrals", icon: Share2, value: 0, color: "bg-emerald-500", textColor: "text-emerald-500", leads: 0, growth: "+0%" },
    ]
  })

  const [isLoading, setIsLoading] = useState(true)
  const [adSpend, setAdSpend] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedSpend = localStorage.getItem("adSpend")
    if (savedSpend) setAdSpend(JSON.parse(savedSpend))

    const fetchMarketingData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/leads')
        if (!res.ok) throw new Error("Failed to fetch leads")
        
        const leads = await res.json()
      
      const breakdown = leads.reduce((acc: any, lead: any) => {
        const source = lead.source || "Referrals"
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})

      const updatedSources = data.sources.map(s => {
        const count = breakdown[s.key] || 0
        
        return {
          ...s,
          leads: count,
          value: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0
        }
      })

      const confirmedJobs = leads.filter((l: any) => l.status === "Confirmed Job").length
      const leadQuality = leads.length > 0 ? Math.round((confirmedJobs / leads.length) * 100) : 0

        setData({
          totalLeads: leads.length,
          leadQuality,
          sources: updatedSources
        })
      } catch (error) {
        console.error("Error fetching marketing data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMarketingData()
  }, [])

  const totalSpend = data.sources.reduce((acc, s) => acc + (parseFloat(adSpend[s.key]) || 0), 0)
  const overallCPL = totalSpend > 0 && data.totalLeads > 0 ? (totalSpend / data.totalLeads).toFixed(2) : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketing Insights</h1>
        <p className="text-muted-foreground mt-1">Analyzing lead acquisition efficiency and channel performance.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-muted-foreground animate-pulse">
          Loading marketing data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Leads", value: data.totalLeads.toString(), icon: Users, subtitle: "All time" },
          { label: "Lead Quality", value: `${data.leadQuality}%`, icon: Target, subtitle: "Conversion to Job" },
          { label: "Overall CPL", value: overallCPL ? `$${overallCPL}` : "—", icon: DollarSign, subtitle: "Cost per lead" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-4 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Channel Efficiency</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let cumulativePercent = 0
                  return data.sources.map((source, i) => {
                    if (source.leads === 0) return null;
                    
                    const startX = Math.cos(2 * Math.PI * cumulativePercent)
                    const startY = Math.sin(2 * Math.PI * cumulativePercent)
                    cumulativePercent += source.value / 100
                    const endX = Math.cos(2 * Math.PI * cumulativePercent)
                    const endY = Math.sin(2 * Math.PI * cumulativePercent)
                    
                    const largeArcFlag = source.value > 50 ? 1 : 0
                    const pathData = [
                      `M ${50 + 40 * startX} ${50 + 40 * startY}`,
                      `A 40 40 0 ${largeArcFlag} 1 ${50 + 40 * endX} ${50 + 40 * endY}`
                    ].join(' ')
                    
                    // Direct hex mapping for reliability
                    const colorMap: Record<string, string> = {
                      "bg-blue-600": "#2563eb",
                      "bg-orange-500": "#f97316",
                      "bg-purple-500": "#a855f7",
                      "bg-pink-500": "#ec4899",
                      "bg-emerald-500": "#10b981"
                    }
                    
                    return (
                      <path
                        key={i}
                        d={pathData}
                        fill="none"
                        stroke={colorMap[source.color] || '#3b82f6'}
                        strokeWidth="12"
                        className="transition-all duration-1000"
                      />
                    )
                  })
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold">{data.totalLeads}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Leads</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-grow space-y-4 w-full">
              {data.sources.map((source, i) => {
                const spend = parseFloat(adSpend[source.key]) || 0
                const sourceCPL = spend > 0 && source.leads > 0 ? (spend / source.leads).toFixed(2) : null
                
                return (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", source.color)} />
                      <div>
                        <p className="font-semibold text-sm">{source.label}</p>
                        <p className="text-[10px] text-muted-foreground">{source.leads} leads · {source.value}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{sourceCPL ? `$${sourceCPL}` : "—"}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">CPL</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
            <p className="text-xs text-muted-foreground italic">
              * CPL is calculated based on monthly ad spend entered in the <span className="font-bold text-foreground">Campaign Performance</span> page.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 md:p-8 overflow-hidden">
          <h2 className="text-xl font-semibold mb-6">Strategy Insights</h2>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <h3 className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-2">
                <TrendingUp size={16} /> Lead Quality Focus
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Current data shows a <span className="font-bold text-foreground">{data.leadQuality}%</span> conversion rate. 
                Focusing on channels with higher conversion rather than lower CPL often yields better results.
              </p>
            </div>
            
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <h3 className="text-sm font-bold text-blue-500 mb-1 flex items-center gap-2">
                <BarChart3 size={16} /> Volume Projections
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                With a total of <span className="font-bold text-foreground">{data.totalLeads}</span> leads tracked, 
                the platform is building a strong baseline for seasonal campaign optimization.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                This platform is now 100% focused on lead attribution and cost efficiency, agnostic of project revenue.
              </p>
            </div>
          </div>
        </div>
      </div>
      </>
    )}
    </div>
  )
}
