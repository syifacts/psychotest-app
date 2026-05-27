import { prisma } from "@/lib/prisma";

export async function logActivity({
  userId,
  role,
  action,
  resource,
  resourceId,
  endpoint,
  method,
  ipAddress,
  userAgent,
  status,
  severity = "LOW",
  isSuspicious = false,
  description,
  oldData,   // ✅ baru
  newData,   // ✅ baru
}: {
  userId?: number;
  role?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  endpoint?: string;
  method?: string;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  severity?: string;
  isSuspicious?: boolean;
  description?: string;
  oldData?: any;   // ✅ baru
  newData?: any;   // ✅ baru
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        role,
        action,
        resource,
        resourceId,
        endpoint,
        method,
        ipAddress,
        userAgent,
        status,
        severity,
        isSuspicious,
        description,
         oldData, // ✅
    newData, // ✅
      },
    });
  } catch (err) {
    console.error("Logging error:", err);
  }
}