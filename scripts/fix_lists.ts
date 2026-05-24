import fs from 'fs';

let content = fs.readFileSync('src/views/equipes_list.tsx', 'utf8');
content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-3">/g,
  '<div className="flex-1 overflow-y-auto p-4 pb-32 space-y-3">'
);
fs.writeFileSync('src/views/equipes_list.tsx', content);

let content2 = fs.readFileSync('src/views/unites_list.tsx', 'utf8');
content2 = content2.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-3">/g,
  '<div className="flex-1 overflow-y-auto p-4 pb-32 space-y-3">'
);
fs.writeFileSync('src/views/unites_list.tsx', content2);
