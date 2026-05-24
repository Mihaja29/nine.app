import fs from 'fs';

let profile = fs.readFileSync('src/views/profile.tsx', 'utf8');

profile = profile.replace(
  /className="p-2 -ml-2 rounded-full hover:bg-white\/70 transition-colors focus:outline-none backdrop-blur-sm bg-white\/70"/g,
  'className="p-2 -ml-2 rounded-full hover:bg-white/40 transition-colors focus:outline-none backdrop-blur-md bg-white/30 border border-white/30"'
);
profile = profile.replace(
  /className="p-2 -mr-2 rounded-full hover:bg-white\/70 transition-colors focus:outline-none backdrop-blur-sm bg-white\/70"/g,
  'className="p-2 -mr-2 rounded-full hover:bg-white/40 transition-colors focus:outline-none backdrop-blur-md bg-white/30 border border-white/30"'
);

fs.writeFileSync('src/views/profile.tsx', profile);

let personDetails = fs.readFileSync('src/views/person_details.tsx', 'utf8');

personDetails = personDetails.replace(
  /className="p-2 -ml-2 rounded-full hover:bg-white\/70 transition-colors focus:outline-none backdrop-blur-sm bg-white\/70"/g,
  'className="p-2 -ml-2 rounded-full hover:bg-white/40 transition-colors focus:outline-none backdrop-blur-md bg-white/30 border border-white/30"'
);
personDetails = personDetails.replace(
  /className="p-2 -mr-2 rounded-full hover:bg-white\/70 transition-colors focus:outline-none backdrop-blur-sm bg-white\/70 text-white"/g,
  'className="p-2 -mr-2 rounded-full hover:bg-white/40 transition-colors focus:outline-none backdrop-blur-md bg-white/30 border border-white/30 text-white"'
);

fs.writeFileSync('src/views/person_details.tsx', personDetails);
