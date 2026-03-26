const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') results = results.concat(walk(fullPath));
        } else {
            if (/\.(tsx|ts)$/.test(file)) results.push(fullPath);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(p => {
    let content = fs.readFileSync(p, 'utf8');
    // Fix double-escaped backticks: \` -> `
    let newContent = content.replace(/\\`/g, '`');
    if (content !== newContent) {
        fs.writeFileSync(p, newContent);
        console.log('Fixed template literals in', path.relative('./src', p));
    }
});
console.log('Done.');
