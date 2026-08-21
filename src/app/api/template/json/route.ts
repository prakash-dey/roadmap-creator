import { buildTemplateJSON } from "@/lib/roadmap-io";

export async function GET() {
  const json = JSON.stringify(buildTemplateJSON(), null, 2);
  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="roadmap-template.json"',
    },
  });
}
