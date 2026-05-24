import fs from 'fs';

let content = fs.readFileSync('src/views/dashboard.tsx', 'utf8');

// The main root needs to be scrollable block or flex that doesn't limit children.
// By default, `flex-1 flex flex-col bg-gray-50 h-full overflow-y-auto no-scrollbar` is fine for the outer root.
// But the inner ones should not be forced to fit inside and hide overflow.
content = content.replace(
  /<div className="pt-6 flex-1 flex flex-col">/g,
  '<div className="pt-6 pb-8">'
);
content = content.replace(
  /<div className="relative drop-shadow-sm max-w-full flex-1 flex flex-col">/g,
  '<div className="relative drop-shadow-sm max-w-full">'
);
content = content.replace(
  /"bg-white px-4 pt-6 pb-24 min-h-\[500px\] flex-1 relative z-20 w-full",/g,
  '"bg-white px-4 pt-6 pb-32 min-h-[500px] relative z-20 w-full",'
);

fs.writeFileSync('src/views/dashboard.tsx', content);

let profile = fs.readFileSync('src/views/profile.tsx', 'utf8');
profile = profile.replace(
  /<div className="bg-white relative z-20 px-6 pb-24">/g,
  '<div className="bg-white relative z-20 px-6 pb-32">'
);
fs.writeFileSync('src/views/profile.tsx', profile);

