// `html` MUST come from lib/cms-content (cleanHtml / pageContentToHtml), which sanitizes it.
export function RichContent({ html }: { html: string }) {
  return <div className="rich-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
