import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret"; // Em produção, usar process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function loginToSession(user: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const sessionData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expires,
  };
  
  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: false, // Alterado para false para funcionar via HTTP no VPS
    sameSite: "lax",
    path: "/",
  });
}

export async function logoutFromSession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}
