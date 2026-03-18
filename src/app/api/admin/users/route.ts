import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 25;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const search = searchParams.get("search")?.trim() ?? "";

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("api_keys")
    .select("id, email, plan, requests_used, requests_limit, is_active, stripe_customer_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("email", `%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({
    users: data ?? [],
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
    total_pages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}
