
import fs from 'fs';
import path from 'path';

const detects = (name) => {
  return (name.includes('wasm') || name.includes('worker'));
};

const dstFolder = path.resolve('./static');
const files = fs.readdirSync(dstFolder);
files.forEach(p => {
  const dst = `${dstFolder}/${p}`;
  const stat = fs.statSync(dst);
  if (stat.isFile() && detects(dst)) {
    fs.unlinkSync(dst);
  }
});

const srcFolder = path.resolve('..', 'core', 'dist');
const paths = fs.readdirSync(srcFolder);
paths.forEach((p) => {
  const src = `${srcFolder}/${p}`;
  const stat = fs.statSync(src);
  if (stat.isFile() && detects(src)) {
    const dst = `${path.resolve('./static', p)}`;
    fs.copyFileSync(src, dst);
  }
});
