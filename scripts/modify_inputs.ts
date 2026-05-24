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

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Make inputs h-14 (56px)
    content = content.replace(/(<(?:input|select)[^>]*className="[^"]*)py-2\.5([^"]*")/g, '$1h-14 min-h-[56px] py-0$2');
    content = content.replace(/(<(?:input|select)[^>]*className="[^"]*)py-3([^"]*")/g, '$1h-14 min-h-[56px] py-0$2');
    
    // Also change buttons rounded-2xl to rounded-full
    content = content.replace(/(<button[^>]*className="[^"]*)rounded-2xl([^"]*")/g, '$1rounded-full min-h-[48px]$2');

    // Change any remaining py-2.5 inside button to min-h-[48px]
    content = content.replace(/(<button[^>]*className="[^"]*)py-2\.5([^"]*")/g, '$1h-12 min-h-[48px] py-0$2');
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Script completed');
