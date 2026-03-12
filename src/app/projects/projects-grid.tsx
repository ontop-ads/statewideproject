"use client"

import { useState, useEffect } from "react"
import { Briefcase, Calendar, DollarSign, Trash2, User } from "lucide-react"
import { cn } from "@/lib/utils"

const CAN_MANAGE = ["ADMIN", "FINANCEIRO"]

export function ProjectsGrid({ role }: { role: string }) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const canDelete = CAN_MANAGE.includes(role)
  const canTogglePayment = CAN_MANAGE.includes(role)

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const deleteProject = async (id: number) => {
    if (!canDelete) return
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setProjects(projects.filter(p => p.id !== id))
        } else {
          alert("Access denied.")
        }
      } catch (error) {
        console.error("Failed to delete project", error)
      }
    }
  }

  const togglePaymentStatus = async (id: number) => {
    if (!canTogglePayment) return
    const project = projects.find(p => p.id === id)
    if (!project) return
    
    const newStatus = project.paymentStatus === "Paid" ? "Unpaid" : "Paid"
    
    try {
      setProjects(projects.map(p => p.id === id ? { ...p, paymentStatus: newStatus } : p))
      
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      })
      
      if (!res.ok) throw new Error("Failed to update status")
    } catch (error) {
      console.error("Failed to update payment status", error)
      setProjects(projects.map(p => p.id === id ? { ...p, paymentStatus: project.paymentStatus } : p))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Management of approved budgets and active jobs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                <Briefcase size={20} />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                  {project.status}
                </span>
                {canDelete && (
                  <button 
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors text-muted-foreground"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{project.name}</h3>
              {canTogglePayment ? (
                <button
                  onClick={() => togglePaymentStatus(project.id)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all",
                    project.paymentStatus === "Paid" 
                      ? "bg-emerald-500 text-white" 
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}
                >
                  {project.paymentStatus || "Unpaid"}
                </button>
              ) : (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                  project.paymentStatus === "Paid" 
                    ? "bg-emerald-500 text-white" 
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                  {project.paymentStatus || "Unpaid"}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{project.client}</p>
            
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign size={16} />
                  Contract Value
                </div>
                <span className="font-semibold">{project.value}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} />
                  Deadline
                </div>
                <span className="font-medium">{project.deadline}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={16} />
                  Employee
                </div>
                {canTogglePayment ? (
                  <button 
                    onClick={async () => {
                      const newEmp = prompt("Update assigned employee:", project.assignedEmployee || "Unassigned");
                      if (newEmp !== null) {
                        try {
                          setProjects(projects.map(p => p.id === project.id ? { ...p, assignedEmployee: newEmp } : p))
                          await fetch(`/api/projects/${project.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ assignedEmployee: newEmp })
                          })
                        } catch (err) {
                          console.error("Update failed", err);
                        }
                      }
                    }}
                    className="font-medium hover:text-primary transition-colors cursor-pointer"
                  >
                    {project.assignedEmployee || "Unassigned"}
                  </button>
                ) : (
                  <span className="font-medium">{project.assignedEmployee || "Unassigned"}</span>
                )}
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg text-sm font-semibold transition-all">
              View Details
            </button>
          </div>
        ))}
      </div>
      {isLoading ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground animate-pulse">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          <Briefcase className="mx-auto mb-4 opacity-20" size={48} />
          <p>No projects found. Once a lead budget is accepted, it will appear here.</p>
        </div>
      ) : null}
    </div>
  )
}
