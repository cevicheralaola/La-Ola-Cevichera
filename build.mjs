import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'supabase-config.js');

function stripQuotes(s) {
  s = String(s || '').trim();
  if (s.length >= 2 && ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'"))) return s.slice(1, -1).trim();
  return s;
}

/** Si el build no tiene env, reutiliza valores ya presentes en supabase-config.js (p. ej. subido a Git). */
function readExistingConfigFromFile() {
  if (!existsSync(outPath)) return { url: '', key: '' };
  try {
    const txt = readFileSync(outPath, 'utf8');
    const um = txt.match(/window\.LAOLA_SUPABASE_URL\s*=\s*["']([^"']*)["']/);
    const km = txt.match(/window\.LAOLA_SUPABASE_ANON_KEY\s*=\s*["']([^"']*)["']/);
    return {
      url: um ? stripQuotes(um[1]) : '',
      key: km ? stripQuotes(km[1]) : ''
    };
  } catch {
    return { url: '', key: '' };
  }
}

let url = stripQuotes(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '');
let key = stripQuotes(
  process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
);

const fromFile = readExistingConfigFromFile();
if (!url && fromFile.url) url = fromFile.url;
if (!key && fromFile.key) key = fromFile.key;

let mHttp = url.match(/^http:\/\/([a-z0-9.-]+\.supabase\.co)\/?$/i);
if (mHttp) url = 'https://' + mHttp[1];

const onNetlify = String(process.env.NETLIFY || '').toLowerCase() === 'true';

if (!url || !key) {
  if (onNetlify) {
    const stub = `/* Build Netlify: sin credenciales. Define env o sube supabase-config.js con URL y clave. */
window.LAOLA_SUPABASE_URL = '';
window.LAOLA_SUPABASE_ANON_KEY = '';
`;
    writeFileSync(outPath, stub, 'utf8');
    console.warn('');
    console.warn('NETLIFY: Sin SUPABASE_URL / clave anon. Variables: SUPABASE_URL, SUPABASE_ANON_KEY (o SUPABASE_PUBLISHABLE_KEY).');
    console.warn('  O deja supabase-config.js en el repo con LAOLA_SUPABASE_* y vuelve a desplegar.');
    console.warn('');
    process.exit(0);
  }
  console.log('build.mjs: sin env — se mantiene supabase-config.js (desarrollo local).');
  process.exit(0);
}

if (
  onNetlify &&
  fromFile.url &&
  fromFile.key &&
  !process.env.SUPABASE_URL &&
  !process.env.VITE_SUPABASE_URL &&
  !process.env.SUPABASE_ANON_KEY &&
  !process.env.SUPABASE_PUBLISHABLE_KEY &&
  !process.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn('build.mjs: credenciales desde supabase-config.js del repo. Mejor: variables en Netlify (no subas claves si el repo es público).');
}

const body = `/* Generado en build (Netlify). No edites a mano en producción. */
window.LAOLA_SUPABASE_URL = ${JSON.stringify(url)};
window.LAOLA_SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;

writeFileSync(outPath, body, 'utf8');
console.log('supabase-config.js generado OK. URL:', url.replace(/^(https:\/\/[^/]+).*/, '$1'), '| longitud anon key:', key.length);
