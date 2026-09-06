// Genera data/content.json a partir de js/menu.js + js/content.js
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';

const sandbox = { window: {}, console };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

const menu = await readFile('js/menu.js', 'utf8');
const content = await readFile('js/content.js', 'utf8');
vm.runInContext(menu, sandbox);
vm.runInContext(content, sandbox);

const data = sandbox.window.LaMIF_CONTENT;
if (!data) throw new Error('No LaMIF_CONTENT found');

await mkdir('data', { recursive: true });
await writeFile('data/content.json', JSON.stringify(data, null, 2), 'utf8');
console.log('data/content.json generado ·', Object.keys(data).length, 'secciones');