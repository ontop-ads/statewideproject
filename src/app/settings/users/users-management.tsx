"use client";

import { useState, useEffect } from "react";
import {
  Users,
  PlusCircle,
  Trash2,
  Pencil,
  ShieldCheck,
  X,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Role = "ADMIN" | "FINANCE" | "MARKETING" | "OPERATOR";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

const ROLES: Role[] = ["ADMIN", "FINANCE", "MARKETING", "OPERATOR"];

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrator",
  FINANCE: "Financial",
  MARKETING: "Marketing",
  OPERATOR: "Operator",
};

const roleColors: Record<Role, string> = {
  ADMIN: "bg-red-500/15 text-red-400 border-red-500/20",
  FINANCE: "bg-green-500/15 text-green-400 border-green-500/20",
  MARKETING: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  OPERATOR: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const emptyForm: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "OPERATOR",
};

function UserModal({
  mode,
  user,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  user?: User;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<UserFormData>(
    user
      ? { name: user.name, email: user.email, password: "", role: user.role }
      : emptyForm
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create" && !form.password) {
      setError("Password is required for new users.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

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
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {mode === "create" ? "New User" : "Edit User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {mode === "edit" ? "New Password (leave blank to keep current)" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "edit" ? "••••••••" : "Minimum 6 characters"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Access Level</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-2",
                    form.role === role
                      ? cn("border-2", roleColors[role])
                      : "bg-background border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  <ShieldCheck size={14} />
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-accent transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Check size={18} />
              )}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function UsersManagement({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (data: UserFormData) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create user.");
    setUsers((prev) => [...prev, result]);
  };

  const handleEdit = async (data: UserFormData) => {
    if (!selectedUser) return;
    const payload: any = { name: data.name, email: data.email, role: data.role };
    if (data.password) payload.password = data.password;

    const res = await fetch(`/api/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to edit user.");
    setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? result : u)));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to delete user.");
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create, edit, and control your team's access levels.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(undefined);
            setModalMode("create");
          }}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 active:scale-95 w-full md:w-auto"
        >
          <PlusCircle size={20} />
          New User
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div
              key={role}
              className={cn(
                "bg-card border rounded-xl p-4 flex items-center gap-3",
                roleColors[role]
              )}
            >
              <ShieldCheck size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                  {roleLabels[role]}
                </p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border">
          <h2 className="font-semibold text-lg">Registered Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-4 font-semibold text-sm border-b border-border">User</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Email</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Access Level</th>
                <th className="p-4 font-semibold text-sm border-b border-border">Member Since</th>
                <th className="p-4 font-semibold text-sm border-b border-border text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors text-sm"
                >
                  <td className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        {user.id === currentUserId && (
                          <span className="text-[10px] text-primary font-bold">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b border-border text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="p-4 border-b border-border">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold border",
                        roleColors[user.role]
                      )}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="p-4 border-b border-border text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="p-4 border-b border-border text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalMode("edit");
                        }}
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground"
                        title="Edit User"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUserId || deletingId === user.id}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          user.id === currentUserId
                            ? "You cannot delete your own account"
                            : "Delete User"
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-4 opacity-20" size={48} />
              <p>No users found.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalMode && (
          <UserModal
            key={modalMode + selectedUser?.id}
            mode={modalMode}
            user={selectedUser}
            onClose={() => setModalMode(null)}
            onSave={modalMode === "create" ? handleCreate : handleEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
