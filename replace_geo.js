const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!file.startsWith('.')) results = results.concat(walk(fullPath));
        } else {
            if (/\.(tsx|ts|css)$/.test(file)) results.push(fullPath);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(p => {
    let content = fs.readFileSync(p, 'utf8');
    let newContent = content.replace(/GeoSense v2\.0/g, 'Genome v3.0')
                            .replace(/GeoSense/g, 'Genome');
    if (content !== newContent) {
        fs.writeFileSync(p, newContent);
        console.log('Fixed', p);
    }
});
