const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) { 
            /* exclude node_modules, .git, .next */
            if (!file.startsWith('.') && file !== 'node_modules') {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html') || file.endsWith('.md')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk('./src').concat(['./prompt2.md', './tailwind.config.ts', './.env.local']);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Rebrand text
    content = content.replace(/GeoSense v2\.0/g, 'Genome v3.0');
    content = content.replace(/GeoSense/g, 'Genome');
    content = content.replace(/geosense-theme/g, 'genome-theme');
    
    // specifically avoid replacing user's file paths or similar if not needed, but prompt says "geosense -> genome (lowercase variants, slugs, classNames)"
    content = content.replace(/geosense/g, 'genome');

    // Replace CSS colors in globals.css globally
    if (file.endsWith('globals.css')) {
        content = content.replace(/var\(--red\)/g, 'var(--accent)');
    }

    // In TSX files replace var(--red) and #e63a2e 
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        content = content.replace(/var\(--red\)/g, 'var(--accent)');
        content = content.replace(/#e63a2e/gi, 'var(--accent)');
    }

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
