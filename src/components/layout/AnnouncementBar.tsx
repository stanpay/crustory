import Link from "next/link";

export type Announcement = {
  title: string;
  linkHref?: string | null;
  linkLabel?: string | null;
};

export function AnnouncementBar({ announcement }: { announcement: Announcement | null }) {
  if (!announcement?.title) return null;

  const href = announcement.linkHref?.trim();
  const label = announcement.linkLabel?.trim() || "자세히";

  return (
    <div className="announce">
      {announcement.title}
      {href ? (
        <>
          {" "}
          <Link href={href}>{label}</Link>
        </>
      ) : null}
    </div>
  );
}
