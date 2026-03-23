# La Ola Cevichera — POS web + Supabase

Aplicación estática (`index.html`) con datos **solo en la nube** (Supabase) y sincronización **en tiempo real** entre dispositivos.

## 1. Base de datos en Supabase

1. Abre tu proyecto (por ejemplo `cevicheralaola`).
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/migrations/001_laola_app_state.sql`.
3. Ve a **Database → Replication** y confirma que la tabla **`laola_app_state`** está incluida en **supabase_realtime** (si el SQL falló en `alter publication`, actívala desde el panel).
4. En **Project Settings → API** copia:
   - **Project URL**
   - **anon public** key (no uses la `service_role` en el navegador).

## 2. Configuración de claves

### Opción A — Netlify (recomendado)

En el sitio: **Site configuration → Environment variables**:

- `SUPABASE_URL` = tu URL (`https://xxxxx.supabase.co`)
- `SUPABASE_ANON_KEY` = tu anon key

El comando de build `npm run build` genera `supabase-config.js` automáticamente.

### Opción B — Local / Git manual

Copia `supabase-config.example.js` a `supabase-config.js` y pega la **anon key**.

> Si el repositorio es **público**, no subas `supabase-config.js` con la clave; usa solo Netlify env + build.

## 3. Despliegue en Netlify

- Conecta el repo Git.
- **Build command:** `npm run build`
- **Publish directory:** `.` (raíz del repo)

## 4. Instalar en el celular (PWA)

Abre la URL publicada en **Chrome** o **Safari** → menú **“Añadir a pantalla de inicio”** / **Instalar app**.  
Icono: `icons/icon.svg` (puedes sustituir por PNG 192×192 y 512×512 si quieres mejor soporte en todos los Android).

## Seguridad

Las políticas RLS actuales permiten lectura/escritura a **anon** para que el POS funcione solo con la clave pública. Es adecuado para uso interno si la URL de la app no es divulgada. Para más seguridad, planifica **Supabase Auth** y políticas por usuario.

## Datos y conflictos

Todo el estado vive en **una fila** JSON (`payload`). Varios dispositivos: **gana el último guardado**. Para uso simultáneo intenso, habría que normalizar tablas en el futuro.

## Comportamiento sync (v3.4.1+)

- `saveDB()` ahora **espera de verdad** al guardado en Supabase (debounce 300 ms), para que login y la primera carga no cierren antes de subir datos.
- Realtime **ignora eventos duplicados** (mismo JSON ya aplicado) y **reintenta** la suscripción si el canal falla o se cierra.
- Si falla un `upsert`, se muestra aviso y se permite de nuevo recibir cambios remotos de inmediato.
