"use client"

import { useState, useEffect } from "react"
import { Users, Search, Mail, Phone, Trash2, CheckCircle2, Clock, MessageSquare, Briefcase, MapPin, X } from "lucide-react"
import { cn } from "@/lib/utils"

type LeadStatus = "New" | "Sent to Jobber" | "Quote Sent" | "Confirmed Job" | "Declined"

interface Lead {
  id: number
  name: string
  email: string
  phone: string
  serviceType: string
  status: LeadStatus
  value: string
  source: string
  address: string
  createdAt: string
}

const CAN_MUTATE = ["ADMIN", "MARKETING"]

export function LeadsTable({ role }: { role: string }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const canDelete = CAN_MUTATE.includes(role)
  const canChangeStatus = CAN_MUTATE.includes(role)

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/leads')
      if (res.ok) {
        const data = await res.json()
        setLeads(data)
      }
    } catch (error) {
      console.error("Failed to fetch leads", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const deleteLead = async (id: number) => {
    if (!canDelete) return
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setLeads(leads.filter(lead => lead.id !== id))
        } else {
          alert("Access denied.")
        }
      } catch (error) {
        console.error("Failed to delete lead", error)
      }
    }
  }

  const updateStatus = async (id: number, newStatus: LeadStatus) => {
    if (!canChangeStatus) return
    const oldLead = leads.find(l => l.id === id)
    if (!oldLead) return

    try {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead))
      
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error("Update failed")

      if (newStatus === "Confirmed Job" && oldLead.status !== "Confirmed Job") {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: id,
            name: `${oldLead.serviceType} - ${oldLead.name}`,
            client: oldLead.name,
            value: oldLead.value,
          })
        })
      }
    } catch (error) {
      console.error("Failed to update status", error)
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: oldLead.status } : lead))
    }
  }

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case "New": return <Clock size={12} />
      case "Sent to Jobber": return <MessageSquare size={12} />
      case "Quote Sent": return <CheckCircle2 size={12} />
      case "Confirmed Job": return <Briefcase size={12} />
      case "Declined": return <X size={12} />
    }
  }

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "New": return "bg-blue-500/10 text-blue-500"
      case "Sent to Jobber": return "bg-amber-500/10 text-amber-500"
      case "Quote Sent": return "bg-emerald-500/10 text-emerald-500"
      case "Confirmed Job": return "bg-purple-500/10 text-purple-500"
      case "Declined": return "bg-destructive/10 text-destructive"
    }
  }

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.serviceType.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your customer prospects.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-4 font-semibold text-sm border-b border-border">Name</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Contact</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Service</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Value</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Status</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Date</th>
                {canDelete && (
                  <th className="p-4 font-semibold text-sm border-b border-border text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors text-sm">
                  <td className="p-4 border-b border-border">
                    <div className="font-semibold text-foreground">{lead.name}</div>
                  </td>
                  <td className="p-4 border-b border-border">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 text-foreground/70">
                        <Mail size={12} /> {lead.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} /> {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b border-border text-xs font-medium">{lead.serviceType}</td>
                  <td className="p-4 border-b border-border font-bold">${parseFloat(lead.value).toLocaleString()}</td>
                  <td className="p-4 border-b border-border">
                    {canChangeStatus ? (
                      <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-border appearance-none cursor-pointer focus:ring-2 focus:ring-primary transition-all bg-card/50",
                          getStatusColor(lead.status)
                        )}
                      >
                        <option value="New" className="bg-slate-900 text-blue-500">New</option>
                        <option value="Sent to Jobber" className="bg-slate-900 text-amber-500">Sent to Jobber</option>
                        <option value="Quote Sent" className="bg-slate-900 text-emerald-500">Quote Sent</option>
                        <option value="Confirmed Job" className="bg-slate-900 text-purple-500">Confirmed Job</option>
                        <option value="Declined" className="bg-slate-900 text-destructive">Declined / Lost</option>
                      </select>
                    ) : (
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                        getStatusColor(lead.status)
                      )}>
                        {getStatusIcon(lead.status)} {lead.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 border-b border-border text-xs text-muted-foreground">
                    <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] opacity-60">{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  {canDelete && (
                    <td className="p-4 border-b border-border text-right">
                      <button 
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors text-muted-foreground"
                        title="Delete Lead"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Loading leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-4 opacity-20" size={48} />
              <p>No leads found.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
