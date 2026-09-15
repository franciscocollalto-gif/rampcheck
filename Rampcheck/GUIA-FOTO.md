# RampCheck — Activar la lectura por foto 📷

El botón "📷 Leer pantalla del sistema" ya está en la app, **listo pero apagado**.
Hoy, si lo tocás, te avisa que falta conectar la clave. Cuando hagas estos pasos, empieza a funcionar solo.

## Qué hace cuando esté activo
1. Tocás "📷 Leer pantalla del sistema".
2. Sacás foto (o elegís la captura) de la lista de vuelos del sistema.
3. La IA lee cada fila y te muestra una **lista para revisar**:
   - **Llegadas (verdes)** → carga el "Necesito" de cada platz (Wagen desde kg, Postwagen desde kg, Dolly, Tráiler).
   - **Contenedores vacíos** → aviso "📤 retirar N" en ese platz.
   - **Salidas (azules)** → aviso "↗ puede dejar material".
4. Tocás "Cargar todo" y quedan las plazas cargadas. Vos revisás y listo.

## Pasos para activarlo

### 1. Clave de IA (la misma que para la voz)
Si ya hiciste la GUIA-IA y cargaste `ANTHROPIC_API_KEY` en Netlify, **no tenés que hacer nada más** — la foto usa la misma clave. Saltá al paso 3.
Si no:
1. Entrá a **console.anthropic.com**, creá cuenta y cargá un poco de saldo.
2. En **API Keys** → **Create Key**, copiá la clave `sk-ant-...`.

### 2. Cargar la clave en Netlify
1. En tu sitio de Netlify → **Site configuration** → **Environment variables**.
2. **Add a variable**: Key = `ANTHROPIC_API_KEY`, Value = tu clave `sk-ant-...`.

### 3. Subir los archivos nuevos
La carpeta ahora tiene también `netlify/functions/photo.mjs`. Volvé a subir la carpeta completa a Netlify (o hacé "Trigger deploy" si usás GitHub).

### 4. Usarlo
1. Abrí la app **desde Safari** (el link de Netlify).
2. Tocá "📷 Leer pantalla del sistema" y sacá/elegí la foto.
3. Revisá la lista y tocá "Cargar todo".

## Consejos para que lea bien
- **La captura de pantalla directa del Zebra** se lee mejor que una foto de la pantalla con otro teléfono.
- Si es foto: de frente, con buena luz, sin reflejos, que se lean los números.
- **Siempre revisá** la lista antes de "Cargar todo": la IA es muy buena pero conviene controlar los números.

## Costo
- Cada foto cuesta un poco más que una frase de voz (la imagen "pesa" más), pero es **una foto por varios aviones**, así que rinde. Igual son centavos por foto.
- Si querés cortar el gasto, borrá `ANTHROPIC_API_KEY` en Netlify y la app sigue andando a mano (la foto queda apagada de nuevo).

## Nota técnica
El botón usa el modelo de visión de Anthropic. En `photo.mjs` está puesto `claude-opus-4-8` (buena lectura). Si querés algo más barato podés cambiarlo por un modelo más chico, pero puede leer un poco peor los números chicos.
