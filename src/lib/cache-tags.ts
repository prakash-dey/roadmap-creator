export function roadmapCacheTag(ownerId: string, roadmapId: number): string {
  return `roadmap-${ownerId}-${roadmapId}`;
}

export function roadmapListCacheTag(ownerId: string): string {
  return `roadmaps-${ownerId}`;
}
