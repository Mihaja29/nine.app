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

    // Remove min-h-[48px] and min-w-[48px] from elements as CSS handles it with pseudo elements
    content = content.replace(/ min-h-\[48px\]/g, '');
    content = content.replace(/min-h-\[48px\] /g, '');
    content = content.replace(/ min-w-\[48px\]/g, '');
    content = content.replace(/min-w-\[48px\] /g, '');
    
    // Some buttons were changed to h-12 to compensate earlier, let's change them back to h-10 (40dp height)
    // Careful not to alter inputs - although inputs were explicitly h-14 min-h-[56px].
    // If a button has h-12 explicitly, make it h-10
    content = content.replace(/(<button[^>]*className="[^"]*)h-12([^"]*")/g, '$1h-10$2');

    // List items to have min-h-[48px] visually
    // Often they are div or li. Wait, let's just make sure list wrappers have py-3 at least
    // 16px font + py-3 (24px) = 40px... wait, py-3 = 12px top/bot = 24px + 24px content = 48px!
    // So p-3 or py-3 or p-4 is fine. Earlier I changed p-6 to p-4 (16px), giving 32px padding, meaning min-height is at least 48px+.
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Script buttons completed');
