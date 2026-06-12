import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(__dirname, 'santuarios.json'), 'utf-8');
const ZONES = JSON.parse(raw);

export default ZONES;
