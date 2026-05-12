import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-8" style={{ color: "var(--text-primary)" }}>系统设置</h1>

      {/* Password change */}
      <div className="p-6 rounded-xl mb-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-primary)" }}>修改密码</h2>
        <form action={changePassword} className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>当前密码</label>
            <input name="currentPassword" type="password" required
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>新密码</label>
            <input name="newPassword" type="password" required minLength={6}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent-primary)", color: "#fff" }}>
            修改密码
          </button>
        </form>
      </div>

      {/* System info */}
      <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>系统信息</h2>
        <div className="space-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <p>当前用户：{session.user?.email}</p>
          <p>Next.js 14.2 · PostgreSQL · Prisma · Vercel</p>
        </div>
      </div>
    </div>
  );
}

async function changePassword(formData: FormData) {
  "use server";
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) return;

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  if (!currentPassword || !newPassword || newPassword.length < 6) return;

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  if (!user?.password) return;

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return; // current password wrong

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hash } });

  revalidatePath("/admin/settings");
}
