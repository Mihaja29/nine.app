import fs from 'fs';

let profile = fs.readFileSync('src/views/profile.tsx', 'utf8');

profile = profile.replace(
  /className="p-2 -ml-2 rounded-full hover:bg-white\/40 transition-colors focus:outline-none backdrop-blur-md bg-white\/30 border border-white\/30"/g,
  'className="p-2 -ml-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none"'
);
profile = profile.replace(
  /className="p-2 -mr-2 rounded-full hover:bg-white\/40 transition-colors focus:outline-none backdrop-blur-md bg-white\/30 border border-white\/30"/g,
  'className="p-2 -mr-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none"'
);

fs.writeFileSync('src/views/profile.tsx', profile);

let personDetails = fs.readFileSync('src/views/person_details.tsx', 'utf8');

personDetails = personDetails.replace(
  /className="p-2 -ml-2 rounded-full hover:bg-white\/40 transition-colors focus:outline-none backdrop-blur-md bg-white\/30 border border-white\/30"/g,
  'className="p-2 -ml-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none"'
);
personDetails = personDetails.replace(
  /className="p-2 -mr-2 rounded-full hover:bg-white\/40 transition-colors focus:outline-none backdrop-blur-md bg-white\/30 border border-white\/30 text-white"/g,
  'className="p-2 -mr-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none"'
);

fs.writeFileSync('src/views/person_details.tsx', personDetails);
