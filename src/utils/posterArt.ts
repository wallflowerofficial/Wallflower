// Clean neutral placeholder generator for posters without images

export function getPosterPlaceholderSvg(title: string = 'Art Print'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="100%" height="100%" style="background:#FAFAFA;">
      <rect width="600" height="840" fill="#FAFAFA"/>
      <rect x="40" y="40" width="520" height="760" fill="none" stroke="#EAEAEA" stroke-width="1"/>
      <text x="300" y="410" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#171717" letter-spacing="2">WALLFLOWER.</text>
      <text x="300" y="435" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="400" fill="#888888">${title}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
