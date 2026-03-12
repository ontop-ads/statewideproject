"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, Target, Instagram, Search, Share2 } from "lucide-react"

export default function MarketingPage() {
  const [data, setData] = useState({
    totalLeads: 0,
    sources: [
      { label: "Google Search", icon: Search, value: 0, color: "bg-blue-500", leads: 0, growth: "+0%" },
      { label: "Instagram", icon: Instagram, value: 0, color: "bg-pink-500", leads: 0, growth: "+0%" },
      { label: "Referrals", icon: Share2, value: 0, color: "bg-emerald-500", leads: 0, growth: "+0%" },
    ]
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
        let count = 0
        if (s.label === "Google Search") count = breakdown["Google"] || 0
        else if (s.label === "Instagram") count = breakdown["Instagram"] || 0
        else if (s.label === "Referrals") count = breakdown["Referral"] || 0
        
        return {
          ...s,
          leads: count,
          value: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0
        }
      })

        setData({
          totalLeads: leads.length,
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketing Overview</h1>
        <p className="text-muted-foreground mt-1">Analyzing lead sources and campaign performance.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-muted-foreground animate-pulse">
          Loading marketing data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Leads", value: data.totalLeads.toString(), icon: Users, trend: "" },
          { label: "Lead Quality", value: "N/A", icon: Target, trend: "" },
          { label: "Active Channels", value: "3", icon: TrendingUp, trend: "" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <stat.icon size={20} />
              </div>
              {stat.trend && <span className="text-emerald-500 text-xs font-bold">{stat.trend}</span>}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-4 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Lead Source Breakdown</h2>
          <div className="space-y-8">
            {data.sources.map((source, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${source.color}/10 ${source.color.replace('bg-', 'text-')} rounded-lg`}>
                      <source.icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">{source.label}</p>
                      <p className="text-xs text-muted-foreground">{source.leads} leads total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base">{source.value}%</p>
                    <p className="text-[10px] text-emerald-500 font-bold">{source.growth}</p>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${source.color} transition-all duration-1000`} 
                    style={{ width: `${source.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 md:p-8 overflow-hidden">
          <h2 className="text-xl font-semibold mb-6">Monthly Acquisition Trend</h2>
          <div className="flex items-end gap-1 md:gap-3 h-64 pt-8 overflow-x-auto min-w-full">
            {[0, 0, 0, 0, 0, 0, 0, 0].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-3 group min-w-[20px]">
                <div className="w-full relative flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-all"
                    style={{ height: `4px` }}
                  />
                  <div 
                    className="w-full bg-primary rounded-t-lg absolute bottom-0"
                    style={{ height: `2px` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-bold">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
    )}
    </div>
  )
}
