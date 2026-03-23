import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'supabase-config.js');

function stripQuotes(s) {
  s = String(s || '').trim();
  if (s.length >= 2 && ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'"))) return s.slice(1, -1).trim();
  return s;
}

let url = stripQuotes(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '');
let key = stripQuotes(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');
const mHttp = url.match(/^http:\/\/([a-z0-9.-]+\.supabase\.co)\/?$/i);
if (mHttp) url = 'https://' + mHttp[1];

const onNetlify = String(process.env.NETLIFY || '').toLowerCase() === 'true';

if (!url || !key) {
  if (onNetlify) {
    const stub = `/* Build Netlify sin SUPABASE_*: añade variables y redeploy. */
window.LAOLA_SUPABASE_URL = '';
window.LAOLA_SUPABASE_ANON_KEY = '';
`;
    writeFileSync(outPath, stub, 'utf8');
    console.warn('');
    console.warn('NETLIFY: Falta SUPABASE_URL o SUPABASE_ANON_KEY.');
    console.warn('  Site → Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY');
    console.warn('  Luego Deploys → Trigger deploy. (El deploy sigue OK; la app pedirá config hasta entonces.)');
    console.warn('');
    process.exit(0);
  }
  console.log('build.mjs: sin SUPABASE_URL/SUPABASE_ANON_KEY — se mantiene supabase-config.js (solo desarrollo local).');
  process.exit(0);
}

const body = `/* Generado en build (Netlify). No edites a mano en producción. */
window.LAOLA_SUPABASE_URL = ${JSON.stringify(url)};
window.LAOLA_SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;

writeFileSync(outPath, body, 'utf8');
console.log('supabase-config.js generado OK. URL:', url.replace(/^(https:\/\/[^/]+).*/, '$1'), '| longitud anon key:', key.length);
