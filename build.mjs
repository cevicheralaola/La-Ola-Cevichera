import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'supabase-config.js');

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

const onNetlify = String(process.env.NETLIFY || '').toLowerCase() === 'true';

if (!url || !key) {
  if (onNetlify) {
    console.error('');
    console.error('NETLIFY: Faltan variables de entorno obligatorias.');
    console.error('  En el sitio: Site configuration → Environment variables → Add a variable');
    console.error('  - SUPABASE_URL   = https://TU_REF.supabase.co');
    console.error('  - SUPABASE_ANON_KEY = (anon public de Supabase → Settings → API)');
    console.error('  Luego: Deploys → Trigger deploy → Clear cache and deploy site.');
    console.error('');
    process.exit(1);
  }
  console.log('build.mjs: sin SUPABASE_URL/SUPABASE_ANON_KEY — se mantiene supabase-config.js (solo desarrollo local).');
  process.exit(0);
}

const body = `/* Generado en build (Netlify). No edites a mano en producción. */
window.LAOLA_SUPABASE_URL = ${JSON.stringify(url)};
window.LAOLA_SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;

writeFileSync(outPath, body, 'utf8');
console.log('supabase-config.js generado OK para deploy.');
