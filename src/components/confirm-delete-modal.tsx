"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, KeyRound } from "lucide-react"

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ isOpen, title, description, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleClose = () => {
    setPassword("")
    setError("")
    onClose()
  }

  const handleConfirm = async () => {
    if (!password) {
      setError("Please enter your password to confirm.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Incorrect password.")
        setIsLoading(false)
        return
      }

      // Password verified successfully
      onConfirm()
      handleClose()
      setIsLoading(false)
    } catch (err) {
      setError("An error occurred during verification.")
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card border border-destructive/20 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-muted-foreground mb-6 mt-2">{description}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <KeyRound size={16} className="text-muted-foreground" />
                  Confirm your password
                </label>
                <input 
                  type="password" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleConfirm()
                    }
                  }}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-destructive/50 outline-none transition-all"
                />
                {error && <p className="text-destructive text-sm mt-2 font-medium">{error}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleClose}
                  className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-accent transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-destructive text-white rounded-xl font-medium hover:bg-destructive/90 transition-all disabled:opacity-50 flex justify-center items-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
