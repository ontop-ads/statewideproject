import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const data = await request.json();
    const { name, email, role, password } = data;

    // Check for duplicate email
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Email already in use by another user." }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Prevent admin from deleting themselves
    if (id === session.id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
