"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Target,
  Settings, 
  Menu,
  ChevronLeft,
  Briefcase,
  BarChart3,
  LogOut,
  ShieldCheck,
  UserCog,
  Moon,
  Sun
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { logoutAction } from "@/app/actions/auth"

type Session = {
  id: number
  name: string
  email: string
  role: string
}

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", roles: ["ADMIN", "FINANCE", "MARKETING", "OPERATOR"] },
  { icon: Users, label: "Leads", href: "/leads", roles: ["ADMIN", "FINANCE", "MARKETING", "OPERATOR"] },
  { icon: Briefcase, label: "Projects", href: "/projects", roles: ["ADMIN", "FINANCE", "MARKETING", "OPERATOR"] },
  { icon: Target, label: "Campaign", href: "/financial", roles: ["ADMIN", "FINANCE", "MARKETING"] },
  { icon: BarChart3, label: "Marketing", href: "/marketing", roles: ["ADMIN", "MARKETING"] },
]

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  FINANCE: "Financial",
  MARKETING: "Marketing",
  OPERATOR: "Operator",
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/20 text-red-300",
  FINANCE: "bg-green-500/20 text-green-300",
  MARKETING: "bg-purple-500/20 text-purple-300",
  OPERATOR: "bg-blue-500/20 text-blue-300",
}

export function Sidebar({ session }: { session: Session }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleLinkClick = () => setIsNavigating(true)

  // Reset loading state when pathname changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const menuItems = allMenuItems.filter(item => item.roles.includes(session.role))

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: collapsed ? 80 : 250 }}
        className={cn(
          "relative h-screen bg-white dark:bg-[#001A40] border-r border-slate-200 dark:border-white/10 flex-col transition-all duration-300 ease-in-out z-50 hidden md:flex",
        )}
      >
        <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-lg border-2 border-[#3b82f6] overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="Statewide logo" className="w-full h-full object-contain p-1" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Statewide<br />
              <span className="text-slate-600 dark:text-white/80 text-sm font-medium tracking-wide">Stone Care</span>
            </h1>
          </motion.div>
        )}
        {collapsed && (
           <div className="w-12 h-12 bg-white rounded-full shadow-md border-2 border-[#3b82f6] overflow-hidden mx-auto flex items-center justify-center">
              <img src="/logo.png" alt="Statewide logo" className="w-full h-full object-contain p-0.5" />
            </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-lg transition-colors ml-auto"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-4 py-3 px-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" 
                  : "text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(isActive ? "text-primary dark:text-primary-foreground" : "text-slate-500 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white")} />
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          )
        })}
      </nav>



        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          {/* Admin-only: manage users link */}
          {session.role === "ADMIN" && (
            <Link
              href="/settings/users"
              className={cn(
                "flex items-center gap-4 py-2 px-3 rounded-xl transition-all text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                collapsed ? "justify-center" : "",
                pathname === "/settings/users" ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : ""
              )}
            >
              <UserCog size={20} />
              {!collapsed && <span className="text-sm font-medium">Manage Users</span>}
            </Link>
          )}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-3 py-2"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-blue-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{session.name}</p>
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block", roleColors[session.role] || "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/60")}>
                  {roleLabels[session.role] || session.role}
                </span>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center">
                <ShieldCheck size={17} className="text-blue-300" />
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex items-center gap-4 py-3 px-3 rounded-xl transition-all text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white w-full",
              collapsed ? "justify-center" : ""
            )}
          >
            <div className="flex items-center justify-center w-[22px]">
              {theme === "dark" ? <Sun size={22} className="flex-shrink-0" /> : <Moon size={22} className="flex-shrink-0" />}
            </div>
            {!collapsed && <span className="font-medium text-left">Toggle Theme</span>}
          </button>

          <form action={logoutAction}>
            <button
              type="submit"
              className={cn(
                "flex items-center gap-4 py-3 px-3 rounded-xl transition-all text-slate-500 dark:text-white/60 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 w-full",
                collapsed ? "justify-center" : ""
              )}
            >
              <LogOut size={22} />
              {!collapsed && <span className="font-medium">Sign Out</span>}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#001A40] border-t border-slate-200 dark:border-white/10 z-50 flex justify-around items-center p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={handleLinkClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16",
                isActive ? "text-primary dark:text-primary-foreground bg-slate-100 dark:bg-white/10" : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white",
                isNavigating && !isActive ? "animate-pulse brightness-125" : ""
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-primary" : "")} />
              <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          )
        })}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 text-slate-500 dark:text-white/60 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium tracking-tight">Sign Out</span>
          </button>
        </form>
      </div>
    </>
  )
}
