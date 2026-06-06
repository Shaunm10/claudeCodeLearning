import { type ReactNode } from "react";

type Mark = { type: string };
type TipTapNode = {
  type: string;
  text?: string;
  marks?: Mark[];
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
};

function renderChildren(nodes?: TipTapNode[]): ReactNode {
  return nodes?.map((node, i) => renderNode(node, i));
}

function renderHeading(level: number, children: ReactNode, key: number): ReactNode {
  const cls =
    level === 1
      ? "text-3xl font-bold tracking-tight"
      : level === 2
        ? "text-2xl font-semibold"
        : "text-xl font-semibold";
  if (level === 1) return <h1 key={key} className={cls}>{children}</h1>;
  if (level === 2) return <h2 key={key} className={cls}>{children}</h2>;
  return <h3 key={key} className={cls}>{children}</h3>;
}

function renderNode(node: TipTapNode, index: number): ReactNode {
  switch (node.type) {
    case "doc":
      return (
        <article key={index} className="flex flex-col gap-4">
          {renderChildren(node.content)}
        </article>
      );
    case "paragraph":
      return (
        <p key={index} className="leading-relaxed">
          {renderChildren(node.content)}
        </p>
      );
    case "heading":
      return renderHeading(
        node.attrs?.level as number,
        renderChildren(node.content),
        index,
      );
    case "bulletList":
      return (
        <ul key={index} className="list-disc pl-6 flex flex-col gap-1">
          {renderChildren(node.content)}
        </ul>
      );
    case "listItem": {
      const content = node.content ?? [];
      const inner =
        content.length === 1 && content[0].type === "paragraph"
          ? renderChildren(content[0].content)
          : renderChildren(content);
      return <li key={index}>{inner}</li>;
    }
    case "horizontalRule":
      return <hr key={index} className="border-foreground/15" />;
    case "text": {
      let el: ReactNode = node.text ?? "";
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") el = <strong className="font-semibold">{el}</strong>;
        else if (mark.type === "italic") el = <em className="italic">{el}</em>;
      }
      return el;
    }
    default:
      return renderChildren(node.content);
  }
}

export function NoteRenderer({ doc }: { doc: TipTapNode }) {
  return <>{renderNode(doc, 0)}</>;
}
