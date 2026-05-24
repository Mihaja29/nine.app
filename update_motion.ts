import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

const transitionRegex = /transition=\{\{\s*type:\s*["']spring["'][^}]*\}\}/g;
const transitionTween = 'transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}';

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the default spring transitions on pages
    content = content.replace(transitionRegex, transitionTween);
    
    // Also try to replace generic transition if no type was specified but duration or something
    
    // Specific check for bottom nav / modals where it's opening from bottom Y 100% -> 0
    // We already do this globally for ease-out
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Framer transitions updated');
