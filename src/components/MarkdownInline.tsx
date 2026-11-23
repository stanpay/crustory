import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

const components: Components = {
  p: ({ children }) => <>{children}</>,
  h1: ({ children }) => <strong>{children}</strong>,
  h2: ({ children }) => <strong>{children}</strong>,
  h3: ({ children }) => <strong>{children}</strong>,
  h4: ({ children }) => <strong>{children}</strong>,
  h5: ({ children }) => <strong>{children}</strong>,
  h6: ({ children }) => <strong>{children}</strong>,
  ul: ({ children }) => <>{children}</>,
  ol: ({ children }) => <>{children}</>,
  li: ({ children }) => <span>{children} </span>,
  blockquote: ({ children }) => <>{children}</>,
  pre: ({ children }) => <>{children}</>,
  code: ({ children }) => <code>{children}</code>,
  a: ({ href, children }) => {
    const url = href?.trim() ?? "";
    if (!url) return <>{children}</>;
    if (isInternalHref(url)) {
      return <Link href={url}>{children}</Link>;
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

export function MarkdownInline({ source }: { source: string }) {
  const text = source.trim();
  if (!text) return null;

  return <ReactMarkdown components={components}>{text}</ReactMarkdown>;
}
