# Zavaleta Mineralien aus Peru — sitio web

Web estática (HTML + CSS + JS, sin dependencias) para un expositor de minerales peruanos con base en Stephanskirchen (Baviera).
Idiomas: alemán, inglés y español (se detecta el idioma del navegador).

## Secciones
- **Galería** — fotos de los minerales y tallas, con filtro por tipo. Al tocar una foto se abre en grande con su descripción y un botón para preguntar por la pieza.
- **Ferias** — próximas ferias con cuenta atrás, botón "añadir al calendario" (.ics) y "reservar piezas para esta feria". Las pasadas se archivan solas.
- **Mayoristas** — bloque para captar tiendas y distribuidores.
- **Nosotros** y **Contacto** (formulario).

## Cómo editar
Todo el contenido está en **`js/data.js`**:

| Qué | Dónde |
|---|---|
| Email, teléfono, WhatsApp, Instagram | `CONFIG` |
| Piezas (nombre, localidad, precio, estado) | `PRODUCTS` |
| Ferias | `EVENTS` |

Los textos de la web están en `js/i18n.js`.

**Fotos:** guarda las fotos en `img/` y añade `photo: "img/nombre.webp"` a cada pieza en `data.js`. Solo aparecen en la galería las piezas que tienen foto.

## Antes de publicar ⚠
1. Datos de contacto ya puestos desde la tarjeta. Falta Instagram (opcional) y precios (`price`, si quieres mostrarlos).
2. **Comprueba las fechas de las ferias** con cada organizador — las de `EVENTS` son orientativas.
4. En `impressum.html` falta la USt-IdNr. (Impressum y Datenschutz son obligatorios en Alemania).
5. Formulario: crea una cuenta gratuita en [Formspree](https://formspree.io) y pega el endpoint en `CONFIG.formEndpoint`. Sin eso, el formulario abre el programa de correo del visitante.

## Ver en local
```bash
python3 -m http.server 8080
```
y abre http://localhost:8080

## Publicar
Sube la carpeta tal cual a Netlify (arrastrar y soltar), GitHub Pages, Cloudflare Pages o cualquier hosting.

## Idiomas
La web está en 8 idiomas: alemán, inglés, español, francés, italiano, checo, polaco y neerlandés.
- Textos de alemán, inglés y español: `js/i18n.js`.
- Textos de francés, italiano, checo, polaco y neerlandés (web y catálogo): `js/translations.js`.
- Si añades un producto nuevo en `data.js` y no lo traduces, en esos 5 idiomas se muestra en inglés.

## Panel de administración (`/admin`)

En **https://zavaletamineralien.de/admin/** (también hay un enlace «Admin» en el pie de página) el administrador puede, sin tocar código:

- **Galería**: añadir piezas con foto, cambiar fotos, nombre, origen, categoría, formatos y descripción (en los 8 idiomas), ordenar y eliminar.
- **Ferias**: añadir, editar y borrar ferias (fechas, ciudad, país, stand, estado, web).
- **Fotos de la web**: cambiar las fotos grandes de Portada, Ferias, Mayoristas y Nosotros.
- **Textos**: cambiar cualquier texto fijo de la web, idioma por idioma.
- **Contacto**: email, teléfonos, WhatsApp, dirección, Instagram.

Todo se guarda en **Vercel Blob** (almacén `zavaleta-media`) y la web lo muestra en unos segundos.
Cada vez que se guarda se crea además una copia en `backups/`.

### Configuración (una sola vez)
El usuario es **zavaleta3** (se puede cambiar con la variable `ADMIN_USER`).
1. En Vercel → proyecto *zavaleta-mineralien* → **Settings → Environment Variables**, crea
   `ADMIN_PASSWORD` (mínimo 8 caracteres) para *Production*. O desde la terminal, en esta carpeta:
   `vercel env add ADMIN_PASSWORD production` (te pide la contraseña sin mostrarla).
2. Vuelve a desplegar (Deployments → ⋯ → Redeploy) para que la tome.
3. Para cambiar la contraseña: edita la variable y vuelve a desplegar (las sesiones abiertas se cierran solas).

`BLOB_READ_WRITE_TOKEN` ya está conectado al proyecto. Lo que no se ha editado en el panel sigue saliendo de `js/data.js`.
En GitHub Pages el panel no funciona (no hay servidor); la web sí, con los datos de `js/data.js`.
