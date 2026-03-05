import { VisualMathApi } from "@vm/vm-api";

async function run(): Promise<void> {
  const api = new VisualMathApi({
    baseUrl: "http://localhost:3001"
  });

  const health = await api.getHealth();
  console.log("HEALTH:", health);

  const lectures = await api.getLectures();
  console.log("LECTURES:", lectures);
}

run().catch((error) => {
  console.error("TEST CLIENT ERROR:", error);
  process.exit(1);
});