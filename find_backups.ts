import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!dirPath.includes('node_modules') && !dirPath.includes('dist') && !dirPath.includes('.git')) {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

console.log("Searching for backup or Notes files:");
walkDir('.', (filePath) => {
  if (filePath.toLowerCase().includes('notes') || filePath.toLowerCase().includes('backup')) {
    console.log(filePath);
  }
});
