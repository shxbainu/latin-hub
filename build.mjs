import { build } from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs';
const r = await build({ entryPoints: ['src/app.jsx'], bundle: true, charset: 'ascii', minify: true, format: 'iife', write: false, target: ['es2019'], jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none', logLevel: 'warning' });
let js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
fs.mkdirSync('dist', { recursive: true });
execSync('npx tailwindcss -c tailwind.config.js -i src/index.css -o dist/app.css --minify', { stdio: 'pipe' });
const css = fs.readFileSync('dist/app.css', 'utf8');
const fragment = `<title>Jenney's Latin Hub</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap">
<style>${css}</style>
<div id="root"></div>
<script>${js}</script>
`;
// The website: a full page. Same app, with a proper head.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#405ccd"/><text x="32" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="40" font-weight="600" fill="#fff">J</text></svg>`;
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Jenney's Latin Hub</title>
<meta name="description" content="Vocabulary and grammar practice for Jenney's First Year Latin.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#f6f7fa" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15181f" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-title" content="Latin Hub">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<noscript>Jenney's Latin Hub needs JavaScript.</noscript>
<script>${js}</script>
</body>
</html>
`;
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', page);
// The Claude artifact is the same app as a page fragment; set ARTIFACT_OUT to write it.
if (process.env.ARTIFACT_OUT) fs.writeFileSync(process.env.ARTIFACT_OUT, fragment);
console.log('js', (js.length / 1024).toFixed(0) + 'KB', 'css', (css.length / 1024).toFixed(0) + 'KB', 'page', (page.length / 1024).toFixed(0) + 'KB');
