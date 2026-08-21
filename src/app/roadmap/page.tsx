import Link from "next/link";
import { ImportRoadmapForm } from "@/components/ImportRoadmapForm";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 sm:px-10 py-10 gap-8" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-[560px]">
        <Link href="/" className="font-mono text-[12px]" style={{ color: "var(--muted-2)" }}>
          ← back to trail
        </Link>
      </div>
      <ImportRoadmapForm />
    </div>
  );
}
