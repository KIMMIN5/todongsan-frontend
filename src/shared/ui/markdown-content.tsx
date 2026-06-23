import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: Props) {
  return (
    <div className={`min-w-0 w-full${className ? ` ${className}` : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-6 text-xl font-bold text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-5 text-lg font-semibold text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-sm leading-relaxed text-foreground last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc pl-5 text-sm text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal pl-5 text-sm text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1 leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-border pl-4 text-sm text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClassName }) => {
            const isBlock = codeClassName?.startsWith("language-");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-md bg-muted p-3 text-xs">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-4 border-border" />,
          table: ({ children }) => (
            <div className="mb-3 w-full min-w-0 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[320px] text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/60">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-muted/30">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-sm text-foreground">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
