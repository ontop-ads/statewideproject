"use client"

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

interface MonthYearPickerProps {
  date: Date;
  onChange: (newDate: Date) => void;
}

export function MonthYearPicker({ date, onChange }: MonthYearPickerProps) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handlePrevMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1)
    onChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    onChange(newDate)
  }

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1 shadow-sm">
      <button 
        type="button"
        onClick={handlePrevMonth}
        className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        title="Previous Month"
      >
        <ChevronLeft size={18} />
      </button>
      
      <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center text-sm font-semibold text-foreground">
        <CalendarIcon size={14} className="text-primary" />
        {monthNames[date.getMonth()]} {date.getFullYear()}
      </div>

      <button 
        type="button"
        onClick={handleNextMonth}
        className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        title="Next Month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
