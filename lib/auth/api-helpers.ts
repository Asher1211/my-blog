import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAdmin(req?: Request) {
  const apiKey = req?.headers.get("x-api-key");
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    return null;
  }
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: "需要登录" },
      { status: 401 }
    );
  }
  return null;
}

export function unauthorized() {
  return NextResponse.json(
    { error: "未授权" },
    { status: 401 }
  );
}

export function notFound(entity = "文章") {
  return NextResponse.json(
    { error: `${entity}不存在` },
    { status: 404 }
  );
}
