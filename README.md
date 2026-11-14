# Zavaleta Mineralien aus Peru — sitio web

Web estática (HTML + CSS + JS, sin dependencias) para un expositor de minerales peruanos con base en Stephanskirchen (Baviera).
Idiomas: alemán, inglés y español (se detecta el idioma del navegador).

## Secciones
- **Colección** — catálogo con filtros, búsqueda y orden. Los clientes añaden piezas a una *lista de consulta* y la envían por email o WhatsApp.
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

**Fotos reales:** guarda las fotos en una carpeta `img/` y añade `photo: "img/nombre.jpg"` a cada producto. Sin foto se muestra una ilustración de cristal generada.

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
