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

    // Replace gap-1 or gap-1.5 with gap-2 ONLY when it's spacing buttons out, 
    // or just generally replace flex gap-1 with gap-2 if it contains buttons.
    // simpler: just blindly map small gaps within common action button rows:
    content = content.replace(/gap-1([^.0-9])/g, 'gap-2$1');
    content = content.replace(/gap-1\.5([^.0-9])/g, 'gap-2$1');

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Fixed gaps');
