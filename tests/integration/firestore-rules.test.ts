import { it, expect } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
it("blocks direct client reads and writes for anonymous and authenticated users", async () => {
  if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080")
    throw Error("Local demo only");
  const env = await initializeTestEnvironment({
    projectId: "demo-vitech",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  try {
    for (const ctx of [
      env.unauthenticatedContext(),
      env.authenticatedContext("vitech-demo-admin"),
    ]) {
      const ref = doc(ctx.firestore(), "registrations", "private");
      await assertFails(getDoc(ref));
      await assertFails(setDoc(ref, { fullName: "Forbidden" }));
    }
    expect(true).toBe(true);
  } finally {
    await env.cleanup();
  }
});
