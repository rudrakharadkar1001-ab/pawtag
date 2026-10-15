import { getStore } from "@netlify/blobs";

const ALPHA = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no confusing 0/O/1/I
const BREEDS = ["beagle", "golden", "labrador", "shepherd", "other"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

function genId() {
  const a = new Uint8Array(6);
  crypto.getRandomValues(a);
  let s = "PV-";
  for (const b of a) s += ALPHA[b % ALPHA.length];
  return s;
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  let b;
  try {
    b = await req.json();
  } catch {
    return json({ error: "Bad data" }, 400);
  }

  const name = clean(b.name, 40);
  const phone = clean(b.phone, 20).replace(/[^\d+]/g, "");
  if (!name) return json({ error: "Please enter the dog's name." }, 400);
  if (phone.replace(/\D/g, "").length < 10)
    return json({ error: "Please enter a valid phone number." }, 400);

  const dob = clean(b.dob, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return json({ error: "Please enter the dog's age." }, 400);

  const photo = clean(b.photo, 3_000_000);
  const vaccine = clean(b.vaccine, 3_000_000);
  if ((photo && !photo.startsWith("data:image/")) || (vaccine && !vaccine.startsWith("data:image/")))
    return json({ error: "Photos must be images." }, 400);

  const lat = Number(b.lat), lng = Number(b.lng);
  const record = {
    name,
    breed: BREEDS.includes(b.breed) ? b.breed : "other",
    breedName: clean(b.breedName, 40),
    gender: clean(b.gender, 10),
    color: clean(b.color, 30),
    dob,
    ownerName: clean(b.ownerName, 60),
    phone,
    address: clean(b.address, 200),
    mapLink: /^https?:\/\//i.test(clean(b.mapLink, 400)) ? clean(b.mapLink, 400) : "",
    lat: Number.isFinite(lat) && b.lat !== "" && b.lat != null ? lat : null,
    lng: Number.isFinite(lng) && b.lng !== "" && b.lng != null ? lng : null,
    notes: clean(b.notes, 300),
    photo,
    vaccine,
    createdAt: new Date().toISOString(),
  };

  try {
    const store = getStore({ name: "dogs", consistency: "strong" });
    let id = genId();
    for (let i = 0; i < 8; i++) {
      if (!(await store.get(id))) break;
      id = genId();
    }
    await store.setJSON(id, record);
    return json({ id });
  } catch (e) {
    console.error("create failed", e);
    return json({ error: "Server is busy. Please tap the button again." }, 500);
  }
};

export const config = { path: "/api/create" };
