/**
 * Renderizado seguro de un subconjunto de Markdown (respuestas del asistente).
 * Admite párrafos, listas (-, •, *, 1.), **negrita**, *cursiva*, `código` y
 * enlaces [texto](https://...). No usa dangerouslySetInnerHTML: React escapa todo.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

function renderInline(text, keyPrefix) {
  const parts = text.split(INLINE).filter((p) => p !== '');
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key} className="px-1 rounded bg-white/10 text-xs">{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-solarFlare underline hover:text-white">
          {link[1]}
        </a>
      );
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <span key={key}>{part}</span>;
  });
}

export default function RichText({ text = '' }) {
  const blocks = [];
  let list = null;
  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };

  text.replace(/\r\n/g, '\n').split('\n').forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      const ordered = /^\s*\d/.test(line);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { type: 'list', ordered, items: [] };
      }
      list.items.push(bullet[1]);
      return;
    }
    flush();
    if (!line.trim()) {
      blocks.push({ type: 'gap', key: idx });
    } else if (/^#{1,6}\s+/.test(line)) {
      blocks.push({ type: 'heading', text: line.replace(/^#{1,6}\s+/, '') });
    } else if (/^-{3,}$/.test(line.trim())) {
      blocks.push({ type: 'rule' });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  });
  flush();

  return (
    <div className="text-sm leading-relaxed space-y-1 break-words">
      {blocks.map((b, i) => {
        if (b.type === 'gap') return <div key={i} className="h-1" aria-hidden="true" />;
        if (b.type === 'rule') return <hr key={i} className="border-white/10 my-2" />;
        if (b.type === 'heading') return <p key={i} className="font-semibold text-white">{renderInline(b.text, i)}</p>;
        if (b.type === 'list') {
          const Tag = b.ordered ? 'ol' : 'ul';
          return (
            <Tag key={i} className={`${b.ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-0.5`}>
              {b.items.map((item, j) => <li key={j}>{renderInline(item, `${i}-${j}`)}</li>)}
            </Tag>
          );
        }
        return <p key={i}>{renderInline(b.text, i)}</p>;
      })}
    </div>
  );
}
