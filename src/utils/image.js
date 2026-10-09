/* Builds responsive image URLs. Unsplash (and imgix-style) URLs get
   width/quality parameters; any other URL (e.g. /images/ring.jpg) is
   returned untouched, so you can swap in your own photos freely. */

const isResizable = (url) => /images\.unsplash\.com/.test(url);

export function imgSrc(url, width = 800) {
  if (!isResizable(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=${width}&q=75&auto=format&fit=crop`;
}

export function imgSrcSet(url, widths = [400, 600, 800, 1200]) {
  if (!isResizable(url)) return undefined;
  return widths.map((w) => `${imgSrc(url, w)} ${w}w`).join(", ");
}
