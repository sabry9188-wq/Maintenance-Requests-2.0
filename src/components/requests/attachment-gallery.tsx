import type { AttachmentWithUrl } from "@/lib/data/attachments";

export function AttachmentGallery({ attachments }: { attachments: AttachmentWithUrl[] }) {
  if (attachments.length === 0) {
    return <p className="py-6 text-center text-sm text-neutral-400">No photos or documents uploaded.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {attachments.map((a) => (
        <a
          key={a.id}
          href={a.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-md border border-neutral-200 bg-neutral-50"
        >
          {a.file_type?.startsWith("image/") && a.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.url} alt={a.file_name ?? "Attachment"} className="h-28 w-full object-cover" />
          ) : (
            <div className="flex h-28 items-center justify-center px-2 text-center text-xs text-neutral-500">
              {a.file_name ?? "File"}
            </div>
          )}
          <p className="truncate px-2 py-1 text-xs text-neutral-500">{a.attachment_kind.replace(/_/g, " ")}</p>
        </a>
      ))}
    </div>
  );
}
