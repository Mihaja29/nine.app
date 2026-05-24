import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // For overlays specifically
  content = content.replace(/bg-black(\/[0-9]+)?(?=.*backdrop-blur)/g, 'bg-white/70');
  content = content.replace(/bg-gray-[0-9]+(\/[0-9]+)?(?=.*backdrop-blur)/g, 'bg-white/70');
  content = content.replace(/bg-white(\/[0-9]+)?(?=.*backdrop-blur)/g, 'bg-white/70');
  
  // also handle the case where backdrop-blur comes first
  content = content.replace(/backdrop-blur(-\w+)?\s+bg-black(\/[0-9]+)?/g, 'backdrop-blur$1 bg-white/70');
  content = content.replace(/backdrop-blur(-\w+)?\s+bg-gray-[0-9]+(\/[0-9]+)?/g, 'backdrop-blur$1 bg-white/70');
  content = content.replace(/backdrop-blur(-\w+)?\s+bg-white(\/[0-9]+)?/g, 'backdrop-blur$1 bg-white/70');

  // and some weird ones like `bg-black backdrop-blur-sm z-[50]`
  content = content.replace(/bg-black\s+backdrop-blur/g, 'bg-white/70 backdrop-blur');

  // Fix possible double replacing issues 
  content = content.replace(/bg-white\/70\/70/g, 'bg-white/70');
  
  // in person_details and profile, there is `backdrop-blur-sm bg-black/10`
  content = content.replace(/backdrop-blur-sm bg-black\/10/g, 'backdrop-blur-sm bg-white/70');

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const files = [
  'src/views/dashboard.tsx',
  'src/views/profile.tsx',
  'src/views/settings.tsx',
  'src/views/notifications_center.tsx',
  'src/views/person_details.tsx',
  'src/views/equipes_list.tsx',
  'src/views/unites_list.tsx',
  'src/components/bottom_nav.tsx',
  'src/components/top_bar.tsx'
];

files.forEach(replaceInFile);
