// Minimal Markdown for the coach's replies: headings, lists, bold, rules and paragraphs.
// Builds React elements (no innerHTML), so model output can't inject markup.

const inline = (text, keyPrefix) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={`${keyPrefix}-${i}`} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      : part
  );

export function Markdown({ text }) {
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag key={`l${blocks.length}`} className={`${list.ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1.5 marker:text-gray-400`}>
        {list.items.map((item, i) => <li key={i}>{inline(item, `li${blocks.length}-${i}`)}</li>)}
      </Tag>
    );
    list = null;
  };

  (text || '').split('\n').forEach((raw, index) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)/);
    const numbered = line.match(/^\d+[.)]\s+(.*)/);

    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
      return;
    }
    flushList();

    if (!line) return;
    if (/^(-{3,}|\*{3,})$/.test(line)) {
      blocks.push(<hr key={index} className="border-gray-200" />);
    } else if (line.startsWith('#')) {
      const content = line.replace(/^#+\s*/, '');
      blocks.push(<p key={index} className="font-bold text-gray-900 pt-1">{inline(content, `h${index}`)}</p>);
    } else {
      blocks.push(<p key={index}>{inline(line, `p${index}`)}</p>);
    }
  });
  flushList();

  return <div className="space-y-3">{blocks}</div>;
}
