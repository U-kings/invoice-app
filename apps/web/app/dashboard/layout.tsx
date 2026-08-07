import { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  // 2. Double-check token validity (as a secondary server-side guard)
  const user = await verifyAuthToken(token);
  
  // Backup safety guard if middleware configuration is ever bypassed
  if (!user) {
    redirect('/api/auth/login');
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}