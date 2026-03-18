"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Check, User, MapPin, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  street: z.string().min(2, "Street is required"),
  neighborhood: z.string().min(2, "Neighborhood is required"),
  city: z.enum(["NYC", "NJ", "CT", "OTHER"]),
  source: z.string().min(1, "Please select a source"),
  serviceType: z.enum(["Restoration", "Antietch", "Cleaning", "Polishing", "Refinishing", "Regrout", "Maintenance", "Repair", "Commercial"]),
})

type LeadFormValues = z.infer<typeof leadSchema>

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
  { id: 1, title: "Contact", icon: User },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Services", icon: Wrench },
]

export function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source: "" as any,
      serviceType: "Restoration",
      street: "",
      neighborhood: "",
      city: "" as any,
    }
  })

  if (!isOpen) return null

  const onSubmit = async (data: LeadFormValues) => {
    try {
      setIsSubmitting(true)
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.details || errorData.error || "Failed to create lead")
      }
      
      alert("Lead created successfully for Statewide stone care!")
      
      // Force reload to update dashboard (temporary solution until full state management)
      window.location.reload()
      
      onClose()
      form.reset()
      setCurrentStep(1)
    } catch (error: any) {
      console.error("Error saving lead:", error)
      alert(`Error saving lead: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof LeadFormValues)[] = []
    if (currentStep === 1) fieldsToValidate = ["name", "phone", "email"]
    if (currentStep === 2) fieldsToValidate = ["street", "neighborhood", "city", "source"]
    
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) setCurrentStep(prev => prev + 1)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Add New Lead</h2>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
              <X size={20} />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10" />
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  currentStep >= step.id 
                    ? "bg-primary border-primary text-white" 
                    : "bg-card border-border text-muted-foreground"
                )}>
                  {currentStep > step.id ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span className={cn(
                  "text-xs font-medium mt-2",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input 
                      {...form.register("name")}
                      placeholder="e.g. John Doe"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                    {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input 
                      {...form.register("phone")}
                      placeholder="(+1) 123-4567"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                    {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address (Optional)</label>
                    <input 
                      {...form.register("email")}
                      placeholder="john@example.com"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Street</label>
                      <input 
                        {...form.register("street")}
                        placeholder="e.g. 123 Main St"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      />
                      {form.formState.errors.street && <p className="text-xs text-destructive">{form.formState.errors.street.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Neighborhood</label>
                      <input 
                        {...form.register("neighborhood")}
                        placeholder="e.g. Downtown"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      />
                      {form.formState.errors.neighborhood && <p className="text-xs text-destructive">{form.formState.errors.neighborhood.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City / Region</label>
                      <select 
                        {...form.register("city")}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
                      >
                        <option value="" disabled>Select a city</option>
                        <option value="NYC">NYC</option>
                        <option value="NJ">NJ</option>
                        <option value="CT">CT</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                      {form.formState.errors.city && <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lead Source</label>
                    <select 
                      {...form.register("source")}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select a source</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google Ads - NY">Google Ads - NY</option>
                      <option value="Google Ads - NJ">Google Ads - NJ</option>
                      <option value="Google Ads - Westchester">Google Ads - Westchester</option>
                      <option value="Referral">Referral</option>
                    </select>
                    {form.formState.errors.source && <p className="text-xs text-destructive">{form.formState.errors.source.message}</p>}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Restoration", "Antietch", "Cleaning", "Polishing", "Refinishing", "Regrout", "Maintenance", "Repair", "Commercial"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => form.setValue("serviceType", type as any)}
                          className={cn(
                            "py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left",
                            form.watch("serviceType") === type
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border hover:border-muted-foreground"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 pt-4 mt-8 border-t border-border">
              {currentStep > 1 && (
                <button
                  key="back-btn"
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-xl font-medium hover:bg-accent transition-all"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  key="next-btn"
                  type="button"
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  key="submit-btn"
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Lead"}
                  {!isSubmitting && <Check size={20} />}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
