import fs from 'node:fs';

const files = ['src/pages/Display.tsx', 'src/pages/Admin.tsx'];

const replacements = {
  'ring-white/10': 'ring-[#ffffff1a]',
  'ring-white/20': 'ring-[#ffffff33]',
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }
  fs.writeFileSync(file, content);
}
console.log('Rings replaced!');
