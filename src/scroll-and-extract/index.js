import { processURLs } from './urlProcessor.js';
import { urlStores } from './urlStores.js';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const resenhasFolderPath = path.join(__dirname, 'resenhas');

// Limita o número de instâncias do navegador abertas simultaneamente
const CONCURRENT_INSTANCES = 2;
const chunks = [];
for (let i = 0; i < urlStores.length; i += CONCURRENT_INSTANCES) {
    chunks.push(urlStores.slice(i, i + CONCURRENT_INSTANCES));
}

for (const chunk of chunks) {
    await processURLs(chunk, resenhasFolderPath);
}