type MetaContent = {
  deployId: string;
};
const maybeMetaElement = document.querySelector('meta[name="arcaea-packs-inventory:data"]');
let content: MetaContent;
const fallbackContent = { deployId: "unknown" };
if (maybeMetaElement && maybeMetaElement instanceof HTMLMetaElement) {
  try {
    content = JSON.parse(maybeMetaElement.content);
  } catch {}
}
content ??= fallbackContent;

export const deployId = content.deployId;
