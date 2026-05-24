import * as fs from 'fs';

let content = fs.readFileSync('./src/views/profile_setup.tsx', 'utf8');

// The blocks look like this:
// { (step === 1 || isEditMode) && (
//   <div className="flex flex-col gap-4">
// ...
//   </div>
// )}

content = content.replace(
  /\{ \(step === 1 \|\| isEditMode\) && \(\n\s*<div className="flex flex-col gap-4">/,
  '{ (step === 1 || isEditMode) && (\n<motion.div key="step1" initial={{ x: step === 1 && !isEditMode ? "100%" : 0 }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}>\n            <div className="flex flex-col gap-4">'
);
content = content.replace(
  /\{ \(step === 2 \|\| isEditMode\) && \(\n\s*<div className="flex flex-col gap-4">/,
  '{ (step === 2 || isEditMode) && (\n<motion.div key="step2" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}>\n            <div className="flex flex-col gap-4">'
);

// Close them 
content = content.replace(
  /<\/button>\n\s*\}\)\n\s*<\/div>\n\s*\}\)/g, 
  '</button>\n            )}\n          </div>\n</motion.div>\n        )}'
);
content = content.replace(
  /<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*\}\)/g, 
  '</button>\n            </div>\n          </div>\n</motion.div>\n        )}'
);

// We need to fix the case where isEditMode might show both at the same time and AnimatePresence might mess up with keys.
// So let's wrap step2 and step1 properly without AnimatePresence if isEditMode.
// Actually AnimatePresence around them is fine because key is different, wait, in isEditMode they are BOTH rendered. AnimatePresence is fine for multiple elements.

fs.writeFileSync('./src/views/profile_setup.tsx', content, 'utf8');
console.log('Fixed profile setup wrapped correctly');
