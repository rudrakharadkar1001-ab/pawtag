import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=30" },
  });

export default async (req) => {
  const id = (new URL(req.url).searchParams.get("id") || "").trim().toUpperCase();
  if (!/^PV-[A-Z0-9]{6}$/.test(id)) return json({ error: "not_found" }, 404);
  try {
    const store = getStore({ name: "dogs", consistency: "strong" });
    const rec = await store.get(id, { type: "json" });
    if (!rec) return json({ error: "not_found" }, 404);
    return json({ id, ...rec });
  } catch (e) {
    console.error("pet failed", e);
    return json({ error: "busy" }, 503);
  }
};

export const config = { path: "/api/pet" };
