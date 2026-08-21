import * as XLSX from "xlsx";
import { buildTemplateWorkbook } from "@/lib/roadmap-io";

export async function GET() {
  const wb = buildTemplateWorkbook();
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="roadmap-template.xlsx"',
    },
  });
}
