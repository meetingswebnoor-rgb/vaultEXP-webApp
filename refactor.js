const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'client');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      processDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Replace api.method('/api/path') to api.method('/path')
      content = content.replace(/api\.(get|post|put|patch|delete)\(\s*(['"`])\/api\//g, "api.$1($2/");
      
      // Also catch anything calling fetch('/api/...')
      content = content.replace(/fetch\(\s*(['"`])\/api\//g, "fetch($1/");
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

processDir(clientDir);
console.log('Refactoring complete.');
