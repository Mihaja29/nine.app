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

    // Typography: readable font sizes above 14sp (text-sm is 14px)
    content = content.replace(/text-xs/g, 'text-sm');
    content = content.replace(/text-\[10px\]/g, 'text-sm');
    content = content.replace(/text-\[13px\]/g, 'text-sm');

    // Outer screen margins: 16dp
    content = content.replace(/p-6/g, 'p-4');

    // Interactive elements minimum touch target 48x48 dp
    // Fix buttons shape and touch targets
    // Ensure standard buttons have 40dp height (h-10) but touch target 48dp (min-h-[48px]) and fully rounded corners (rounded-full)
    content = content.replace(/(<button[^>]*className="[^"]*)rounded-xl/g, '$1rounded-full min-h-[48px]');
    content = content.replace(/(<button[^>]*className="[^"]*)rounded-lg/g, '$1rounded-full min-h-[48px]');
    
    // Convert common standard action buttons explicitly
    // e.g. "py-2.5 rounded-xl" or "py-3 rounded-xl" -> "h-12 rounded-full min-h-[48px]"
    content = content.replace(/py-2\.5 rounded-xl/g, 'h-12 rounded-full min-h-[48px]');
    content = content.replace(/py-3 rounded-xl/g, 'h-12 rounded-full min-h-[48px]');
    content = content.replace(/py-2 rounded-xl/g, 'h-12 rounded-full min-h-[48px]');
    content = content.replace(/py-2\.5 rounded-full/g, 'h-12 rounded-full min-h-[48px]');
    
    // Text fields have a height of 56dp (h-14).
    // Often inputs look like `<input ... className="... pl-10 pr-4 py-2.5 ... ">` or `<select`
    // Let's replace 'h-12 rounded-full min-h-[48px]' inside input classNames back to h-14 if we ruined it,
    // Actually we can just do a regex replace on input and select elements:
    const inputRegex = /(<(?:input|select)[^>]*className="[^"]*)py-2\.5([^"]*")/g;
    content = content.replace(inputRegex, '$1h-14 min-h-[56px] py-0$2');

    const inputRegex2 = /(<(?:input|select)[^>]*className="[^"]*)h-12 rounded-full min-h-\[48px\]([^"]*")/g;
    content = content.replace(inputRegex2, '$1h-14 min-h-[56px] rounded-lg$2');
    
    // Also cover inputs that didn't match the buttons fix
    const inputRegex3 = /(<(?:input|select)[^>]*className="[^"]*)rounded-xl([^"]*")/g;
    content = content.replace(inputRegex3, '$1rounded-lg min-h-[56px] h-14$2');

    // Any manual 44x44 or 40x40 containers (like icon buttons) to 48x48
    content = content.replace(/w-10 h-10/g, 'w-12 h-12 min-h-[48px] min-w-[48px]');
    content = content.replace(/w-11 h-11/g, 'w-12 h-12 min-h-[48px] min-w-[48px]');
    content = content.replace(/w-8 h-8/g, 'w-12 h-12 min-h-[48px] min-w-[48px]');

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Script completed');
