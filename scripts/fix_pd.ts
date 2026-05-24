import fs from 'fs';
let pd = fs.readFileSync('src/views/person_details.tsx', 'utf8');
pd = pd.replace(
  /<div className="bg-white relative z-20 px-6 pb-24">/g,
  '<div className="bg-white relative z-20 px-6 pb-32">'
);
fs.writeFileSync('src/views/person_details.tsx', pd);
