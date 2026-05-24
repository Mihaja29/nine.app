import fs from 'fs';

let content = fs.readFileSync('src/views/dashboard.tsx', 'utf8');

// Replace exit animations for steps
content = content.replace(
  /exit=\{\{ x: '-100%', opacity: 0 \}\}/g,
  `exit={{ x: '-100%', opacity: 0, position: 'absolute', top: 0, left: 0, right: 0 }}`
);

// Specifically for step1, wait, let me use regex properly.
fs.writeFileSync('src/views/dashboard.tsx', content);
