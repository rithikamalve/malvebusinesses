import { createServerFn } from "@tanstack/react-start";
import fs from "node:fs";
import path from "node:path";
import type { Building } from "@/data/listings";

export const writeListingsToDisk = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!Array.isArray(data)) throw new Error("Expected array of buildings");
    return data as Building[];
  })
  .handler(async ({ data }) => {
    const target = path.resolve(process.cwd(), "src/data/listings.seed.json");
    try {
      fs.writeFileSync(target, JSON.stringify(data, null, 2), "utf8");
      return { ok: true as const, path: target };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  });
