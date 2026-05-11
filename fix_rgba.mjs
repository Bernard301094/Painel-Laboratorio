import fs from 'node:fs';

const files = ['src/pages/Display.tsx', 'src/pages/Admin.tsx'];

const hexToRgba = (hex) => {
  // e.g. #ffffff0d -> rgba(255,255,255,0.05)
  if (hex.length === 9) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16) / 255;
    // Replace spaces with nothing so tailwind arbitrary value parses it
    return `rgba(${r},${g},${b},${Number(a.toFixed(2))})`;
  }
  return hex;
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Find all matches like [#ffffff0d] inside class names
  content = content.replace(/bg-\[#[0-9a-fA-F]{8}\]/g, match => {
    const hex = match.match(/#[0-9a-fA-F]{8}/)[0];
    return `bg-[${hexToRgba(hex)}]`;
  });
  content = content.replace(/border-\[#[0-9a-fA-F]{8}\]/g, match => {
    const hex = match.match(/#[0-9a-fA-F]{8}/)[0];
    return `border-[${hexToRgba(hex)}]`;
  });
  content = content.replace(/text-\[#[0-9a-fA-F]{8}\]/g, match => {
    const hex = match.match(/#[0-9a-fA-F]{8}/)[0];
    return `text-[${hexToRgba(hex)}]`;
  });
  content = content.replace(/ring-\[#[0-9a-fA-F]{8}\]/g, match => {
    const hex = match.match(/#[0-9a-fA-F]{8}/)[0];
    return `ring-[${hexToRgba(hex)}]`;
  });
  
  // also fix shadows containing modern rgba if they do
  fs.writeFileSync(file, content);
}
console.log('Fixed to RGBA!');
