import * as fs from 'fs';

const filePath = './src/views/profile_setup.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// I should wrap the step rendering block with AnimatePresence
content = content.replace(/<form onSubmit=\{isEditMode \? handleSubmit : \(step === 1 \? handleNextStep : handleSubmit\)\} className="flex flex-col gap-4 relative z-10">/g, 
  '<form onSubmit={isEditMode ? handleSubmit : (step === 1 ? handleNextStep : handleSubmit)} className="flex flex-col gap-4 relative z-10">\n<AnimatePresence mode="wait">');

content = content.replace(/<\/form>/g, '</AnimatePresence>\n</form>');

// Also need to fix the unclosed motion.div
// I'll undo the previous wrong replacements by replacing the opening `motion.div` back, and re-implementing them properly.

content = content.replace(/\{ \(step === 1 \|\| isEditMode\) && \(\n\s*<motion[^\n]*\n/g, '{ (step === 1 || isEditMode) && (\n');
content = content.replace(/\{ \(step === 2 \|\| isEditMode\) && \(\n\s*<motion[^\n]*\n/g, '{ (step === 2 || isEditMode) && (\n');
content = content.replace(/<\/motion\.div>\n\s*\}\)/g, ')}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed profile_setup.tsx');
