import Link from "next/link";
import { ImportRoadmapForm } from "@/components/ImportRoadmapForm";
import { RoadmapList } from "@/components/RoadmapList";
import { listRoadmaps } from "@/lib/data";
import { requireUser } from "@/lib/auth/session";

export const instant = false;

export default async function RoadmapPage() {
  const user = await requireUser();
  const roadmaps = await listRoadmaps(user.id);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 sm:px-10 py-10 gap-8" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-[560px]">
        <Link href="/" className="font-mono text-[12px]" style={{ color: "var(--muted-2)" }}>
          ← back to trail
        </Link>
      </div>
      <RoadmapList roadmaps={roadmaps} />
      <ImportRoadmapForm />
    </div>
  );
}
