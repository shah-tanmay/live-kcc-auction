import { requireAuth } from "@/lib/authMiddleware";

export async function GET(request) {
  try {
    const user = requireAuth(request, ["admin"]);
    return new Response(
      JSON.stringify({ message: `Hello Admin ${user.username}` }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: e.message === "Unauthorized" ? 401 : 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}
