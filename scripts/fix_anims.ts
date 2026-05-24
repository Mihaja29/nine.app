import fs from 'fs';
let content = fs.readFileSync('src/views/dashboard.tsx', 'utf8');

content = content.replace(
  /initial=\{\{ x: '100%', opacity: 0 \}\}\s*animate=\{\{ x: 0, opacity: 1 \}\}\s*exit=\{\{ x: '100%', opacity: 0 \}\}\s*transition=\{\{ type: "tween", ease: \[0\.0, 0\.0, 0\.2, 1\], duration: 0\.3 \}\}/g,
  `initial={{ x: '100%', opacity: 0 }}\n                    animate={{ x: 0, opacity: 1 }}\n                    exit={{ x: '-100%', opacity: 0 }}\n                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}`
);

fs.writeFileSync('src/views/dashboard.tsx', content);
