/** Lightweight markdown-ish renderer for curriculum content (no extra deps) */
export default function MarkdownView({ content = "" }) {
  if (!content) {
    return (
      <p className="text-slate-400 text-sm italic">Is section me content nahi hai.</p>
    );
  }

  const lines = content.split("\n");
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // closing ```
      blocks.push(
        <pre
          key={key++}
          className="my-3 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm overflow-x-auto leading-relaxed"
        >
          {lang && (
            <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-wide">
              {lang}
            </div>
          )}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // headings
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="text-base font-semibold text-slate-900 dark:text-white mt-5 mb-2">
          {inline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
          {inline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={key++} className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-3">
          {inline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // hr
    if (line.trim() === "---") {
      blocks.push(<hr key={key++} className="my-4 border-slate-200 dark:border-slate-700" />);
      i++;
      continue;
    }

    // list items
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i]) || /^\d+\.\s+/.test(lines[i]))) {
        const item = lines[i].replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
        items.push(
          <li key={items.length} className="ml-1">
            {inline(item)}
          </li>
        );
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 my-2 space-y-1 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {items}
        </ul>
      );
      continue;
    }

    // empty
    if (!line.trim()) {
      i++;
      continue;
    }

    // paragraph
    blocks.push(
      <p key={key++} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed my-2">
        {inline(line)}
      </p>
    );
    i++;
  }

  return <div className="markdown-body">{blocks}</div>;
}

function inline(text) {
  // **bold**, `code`, simple
  const parts = [];
  let rest = text;
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={k++} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(
        <code
          key={k++}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-300 text-xs font-mono"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}
