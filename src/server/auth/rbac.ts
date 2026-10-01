import { Role, SessionUser } from "@/types";
import { getSessionUser } from "./session";
import prisma from "@/lib/db";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

const userStatusCache = new Map<
  string,
  { user: SessionUser; isActive: boolean; cachedAt: number }
>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Require an authenticated active user (Owner or Manager)
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new AuthError("Authentication required", 401);
  }

  const cached = userStatusCache.get(session.id);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    if (!cached.isActive) {
      throw new AuthError("User account is inactive or no longer exists", 403);
    }
    return cached.user;
  }

  // Verify in database that user exists and is still active
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    if (user) {
      userStatusCache.set(session.id, {
        user: { id: user.id, name: user.name, email: user.email, role: user.role as Role },
        isActive: false,
        cachedAt: Date.now(),
      });
    }
    throw new AuthError("User account is inactive or no longer exists", 403);
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  };

  userStatusCache.set(session.id, {
    user: sessionUser,
    isActive: true,
    cachedAt: Date.now(),
  });

  return sessionUser;
}

/**
 * Both OWNER and MANAGER have 100% equal operational & administrative access
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden: Insufficient permissions for this action", 403);
  }
  return user;
}

export function canManageStaff(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}

export function canViewAuditLogs(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}

export function canDeleteExpenses(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}
