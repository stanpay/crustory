import { MarkdownInline } from "@/components/MarkdownInline";

export type Announcement = {
  title: string;
};

export function AnnouncementBar({ announcement }: { announcement: Announcement | null }) {
  if (!announcement?.title?.trim()) return null;

  return (
    <div className="announce">
      <MarkdownInline source={announcement.title} />
    </div>
  );
}
