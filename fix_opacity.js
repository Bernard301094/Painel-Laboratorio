const fs = require('fs');
const files = ['src/pages/Display.tsx', 'src/pages/Admin.tsx'];

const replacements = {
  'bg-white/5': 'bg-[#ffffff0d]',
  'bg-white/10': 'bg-[#ffffff1a]',
  'bg-white/20': 'bg-[#ffffff33]',
  'border-white/5': 'border-[#ffffff0d]',
  'border-white/10': 'border-[#ffffff1a]',
  'bg-black/40': 'bg-[#00000066]',
  'bg-black/60': 'bg-[#00000099]',
  'bg-emerald-500/5': 'bg-[#10b9810d]',
  'bg-emerald-500/10': 'bg-[#10b9811a]',
  'bg-emerald-500/20': 'bg-[#10b98133]',
  'bg-emerald-500/30': 'bg-[#10b9814d]',
  'border-emerald-500/20': 'border-[#10b98133]',
  'border-emerald-500/30': 'border-[#10b9814d]',
  'border-emerald-500/40': 'border-[#10b98166]',
  'border-emerald-500/50': 'border-[#10b98180]',
  'bg-red-500/5': 'bg-[#ef44440d]',
  'bg-red-500/10': 'bg-[#ef44441a]',
  'bg-red-500/20': 'bg-[#ef444433]',
  'border-red-500/20': 'border-[#ef444433]',
  'border-red-500/30': 'border-[#ef44444d]',
  'bg-amber-500/5': 'bg-[#f59e0b0d]',
  'bg-amber-500/10': 'bg-[#f59e0b1a]',
  'bg-amber-500/20': 'bg-[#f59e0b33]',
  'border-amber-500/20': 'border-[#f59e0b33]',
  'border-amber-500/30': 'border-[#f59e0b4d]',
  'bg-[#0a0a0a]/80': 'bg-[#0a0a0acc]',
  'text-white/5': 'text-[#ffffff0d]',
  'text-white/10': 'text-[#ffffff1a]',
  'text-white/20': 'text-[#ffffff33]',
  'text-white/50': 'text-[#ffffff80]',
  'text-white/60': 'text-[#ffffff99]',
  'text-white/70': 'text-[#ffffffb3]',
  'text-white/80': 'text-[#ffffffcc]',
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }
  fs.writeFileSync(file, content);
}
console.log('Opacities replaced!');
