"use client"

import { useState, useEffect } from "react"
import { Target, Users, TrendingUp, DollarSign, Funnel, BarChart3 } from "lucide-react"

const CHANNELS = [
  { key: "Google Ads - NY", label: "Google Ads - NY", color: "bg-blue-600", textColor: "text-blue-600", border: "border-blue-600/20", isPaid: true },
  { key: "Google Ads - NJ", label: "Google Ads - NJ", color: "bg-orange-500", textColor: "text-orange-500", border: "border-orange-500/20", isPaid: true },
  { key: "Google Ads - Westchester", label: "Google Ads - Westchester", color: "bg-purple-500", textColor: "text-purple-500", border: "border-purple-500/20", isPaid: true },

  { key: "Instagram", label: "Instagram", color: "bg-pink-500", textColor: "text-pink-500", border: "border-pink-500/20", isPaid: true },
  { key: "Referral", label: "Referral / Organic", color: "bg-emerald-500", textColor: "text-emerald-500", border: "border-emerald-500/20", isPaid: false },
]

const FUNNEL_STAGES = ["New", "Sent to Jobber", "Quote Sent", "Confirmed Job", "Declined"]
const STAGE_COLORS: Record<string, string> = {
  "New": "bg-blue-500",
  "Sent to Jobber": "bg-amber-500",
  "Quote Sent": "bg-emerald-500",
  "Confirmed Job": "bg-purple-500",
  "Declined": "bg-red-500",
}

export default function CampaignPerformancePage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ad spend per channel — persisted in localStorage
  const [adSpend, setAdSpend] = useState<Record<string, string>>({
    "Google Ads - NY": "",
    "Google Ads - NJ": "",
    "Google Ads - Westchester": "",
    "Instagram": "",
  })

  useEffect(() => {
    const saved = localStorage.getItem("adSpend")
    if (saved) setAdSpend(JSON.parse(saved))

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/analytics")
        if (res.ok) setAnalytics(await res.json())
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const handleSpendChange = (key: string, value: string) => {
    const updated = { ...adSpend, [key]: value }
    setAdSpend(updated)
    localStorage.setItem("adSpend", JSON.stringify(updated))
  }

  // --- Metrics ---
  const totalLeads = analytics?.totalLeads || 0
  const totalConfirmed = analytics?.confirmedJobs || 0
  const conversionRate = analytics?.conversionRate || 0

  const overallCPL = () => {
    const totalSpend = CHANNELS.filter(ch => ch.isPaid).reduce((s, ch) => s + (parseFloat(adSpend[ch.key]) || 0), 0)
    return totalSpend > 0 && totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : null
  }
  const overallCPA = () => {
    const totalSpend = CHANNELS.filter(ch => ch.isPaid).reduce((s, ch) => s + (parseFloat(adSpend[ch.key]) || 0), 0)
    return totalSpend > 0 && totalConfirmed > 0 ? (totalSpend / totalConfirmed).toFixed(2) : null
  }

  const cpl = overallCPL()
  const cpa = overallCPA()

  const summaryCards = [
    { label: "Total Leads", value: totalLeads.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Confirmed Jobs", value: totalConfirmed.toString(), icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Cost Per Lead (CPL)", value: cpl ? `$${cpl}` : "—", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10", hint: cpl ? "" : "Enter ad spend below" },
    { label: "Cost Per Acquisition (CPA)", value: cpa ? `$${cpa}` : "—", icon: BarChart3, color: "text-pink-500", bg: "bg-pink-500/10", hint: cpa ? "" : "Enter ad spend below" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Campaign Performance</h1>
        <p className="text-muted-foreground mt-1">Lead attribution, funnel analytics, and ad spend efficiency.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-muted-foreground animate-pulse">
          Loading campaign data...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryCards.map((card, i) => (
              <div key={i} className="bg-card border border-border p-5 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                    <card.icon size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{card.value}</h3>
                {card.hint && <p className="text-[10px] text-muted-foreground mt-1 italic">{card.hint}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lead Funnel */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Lead Funnel</h2>
              <div className="space-y-5">
                {FUNNEL_STAGES.map((stage) => {
                  const count = analytics?.statusData[stage] || 0
                  const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">{stage}</span>
                        <span className="font-bold">{count} <span className="text-muted-foreground font-normal text-xs">({pct}%)</span></span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${STAGE_COLORS[stage]} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-8 p-4 bg-muted rounded-xl text-center">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{conversionRate}%</span> of all leads converted to Confirmed Jobs
                </p>
              </div>
            </div>

            {/* Channel Performance */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-2">Channel Performance</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter monthly ad spend to calculate CPL & CPA per channel.</p>
              <div className="space-y-6">
                {CHANNELS.filter(ch => ch.isPaid).map((ch) => {
                  const sourceStat = analytics?.sourceData.find((s: any) => s.name === ch.key)
                  const chLeads = sourceStat ? sourceStat.count : 0
                  const chJobs = 0 // Needs more detail in API if we want jobs per channel
                  const spend = parseFloat(adSpend[ch.key]) || 0
                  const chCPL = spend > 0 && chLeads > 0 ? (spend / chLeads).toFixed(2) : null
                  const chCPA = spend > 0 && chJobs > 0 ? (spend / chJobs).toFixed(2) : null
                  const pct = totalLeads > 0 ? Math.round((chLeads / totalLeads) * 100) : 0

                  return (
                    <div key={ch.key} className={`border ${ch.border} rounded-xl p-4 space-y-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${ch.color}`} />
                          <span className="font-semibold text-sm">{ch.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${ch.textColor}`}>{chLeads} leads · {pct}%</span>
                      </div>

                      {/* Ad spend input */}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Monthly ad spend"
                          value={adSpend[ch.key]}
                          onChange={(e) => handleSpendChange(ch.key, e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                        />
                      </div>

                      {/* CPL / CPA */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-muted rounded-lg p-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">CPL</p>
                          <p className="font-bold text-sm">{chCPL ? `$${chCPL}` : "—"}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">CPA</p>
                          <p className="font-bold text-sm">{chCPA ? `$${chCPA}` : "—"}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Lead Source Attribution Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Lead Source Attribution</h2>
              <div className="space-y-4">
                {CHANNELS.map((ch) => {
                  const count = leadsByChannel[ch.key] || 0
                  const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
                  return (
                    <div key={ch.key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">{ch.label}</span>
                        <span className="font-bold">{count} leads <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${ch.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Regional Distribution */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Regional Distribution (City)</h2>
              <div className="space-y-4">
                {(() => {
                  const regionals = leads.reduce((acc: Record<string, number>, lead: any) => {
                    const city = lead.city || "OTHER"
                    acc[city] = (acc[city] || 0) + 1
                    return acc
                  }, { "NYC": 0, "NJ": 0, "CT": 0, "OTHER": 0 })
                  
                  return Object.entries(regionals)
                    .map(([city, count]) => {
                      const pct = totalLeads > 0 ? Math.round((count as number / totalLeads) * 100) : 0
                      return (
                        <div key={city} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">{city}</span>
                            <span className="font-bold">{(count as number)} leads <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/40 transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })
                })()}
                {leads.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">No leads to display</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
