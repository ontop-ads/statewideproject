"use client"

import { useState, useEffect } from "react"
import { 
  Briefcase,
  Calendar, 
  Trash2, 
  User, 
  X, 
  Check, 
  Phone, 
  MapPin, 
  Mail,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal"
import { MonthYearPicker } from "@/components/month-year-picker"

const CAN_MANAGE = ["ADMIN", "FINANCE"]

interface Project {
  id: number
  leadId: number | null
  name: string
  client: string
  status: string
  paymentStatus: string
  createdAt: string
  lead?: {
    phone: string
    email: string
    address: string
    serviceType: string
    source: string
  } | null
}



function DetailsModal({ 
  project, 
  onClose 
}: { 
  project: Project | null, 
  onClose: () => void 
}) {
  if (!project) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Briefcase size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{project.name}</h2>
              <p className="text-sm text-muted-foreground">{project.client}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Project Information</h3>
              <div className="space-y-3">

                <div className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground flex items-center gap-2"><Clock size={16} /> Created at</span>
                   <span className="font-medium text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Status</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase border border-emerald-500/20">
                  {project.status}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase border",
                  project.paymentStatus === "Paid" 
                    ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" 
                    : "bg-destructive/10 text-destructive border-destructive/20"
                )}>
                  {project.paymentStatus}
                </span>
              </div>
            </section>
          </div>

          <div className="space-y-6 border-l border-border/50 pl-0 md:pl-8">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Contact Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Phone size={16} /></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Phone</p>
                    <p className="text-sm font-medium">{project.lead?.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Mail size={16} /></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                    <p className="text-sm font-medium">{project.lead?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground"><MapPin size={16} /></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Address</p>
                    <p className="text-sm font-medium leading-relaxed">{project.lead?.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-background border border-border rounded-xl font-bold hover:bg-accent transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function ProjectsGrid({ role }: { role: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const canDelete = CAN_MANAGE.includes(role)
  const canTogglePayment = CAN_MANAGE.includes(role)

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/projects?month=${selectedMonth.getMonth() + 1}&year=${selectedMonth.getFullYear()}`)
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
  }, [selectedMonth])

  const deleteProject = (id: number) => {
    if (!canDelete) return
    setDeletingProjectId(id)
  }

  const confirmDeleteProject = async () => {
    if (!canDelete || !deletingProjectId) return
    try {
      const res = await fetch(`/api/projects/${deletingProjectId}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== deletingProjectId))
      } else {
        alert("Access denied.")
      }
    } catch (error) {
      console.error("Failed to delete project", error)
    } finally {
      setDeletingProjectId(null)
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
        <MonthYearPicker date={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all group flex flex-col">
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
            
            <div className="space-y-3 pt-4 border-t border-border flex-grow">


            </div>

            <button 
              onClick={() => setViewingProject(project)}
              className="w-full mt-6 py-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl text-sm font-bold transition-all"
            >
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

      {/* Modals */}
      <AnimatePresence>

        {viewingProject && (
          <DetailsModal 
            project={viewingProject}
            onClose={() => setViewingProject(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={deletingProjectId !== null}
        title="Delete Project"
        description="Are you sure you want to delete this project?"
        onClose={() => setDeletingProjectId(null)}
        onConfirm={confirmDeleteProject}
      />
    </div>
  )
}
