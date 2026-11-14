/* =====================================================================
   DATOS DEL SITIO — edita este archivo para actualizar la web.
   No hace falta tocar HTML ni CSS.
   ===================================================================== */

/* ---------- Configuración general / datos de contacto ---------- */
const CONFIG = {
  brand: "Zavaleta Mineralien",
  owner: "Victor Zavaleta",
  email: "zavaletamineralien@gmx.de",
  phone: "+49 8036 9085020",
  mobile: "+49 160 97967431",
  whatsapp: "4916097967431",                  // solo dígitos, con prefijo de país
  address: "Kirschenweg 3, 83071 Stephanskirchen, Deutschland",
  instagram: "",                               // ← pega aquí tu perfil si tienes (https://instagram.com/...)
  instagramHandle: "",
  currency: "EUR",
  /* Formulario: si pegas aquí un endpoint de Formspree (https://formspree.io/f/xxxx)
     los mensajes llegan directo a tu email. Vacío = abre el programa de correo. */
  formEndpoint: ""
};

/* ---------- Categorías del catálogo ---------- */
const CATEGORIES = ["specimen", "polished", "carving", "rough"];

/* ---------- Productos ----------
   category: "specimen" (piezas de colección) | "polished" (pulidos/placas) | "carving" (tallas/esferas) | "rough" (en bruto / por kilo)
   shape: "cube" | "prism" | "cluster" | "rhombo" | "nodule"  → dibujo cuando no hay foto
   color: color del dibujo
   photo: (opcional) ruta a una foto real, p.ej. "img/crisocola.jpg" — sustituye al dibujo
   price: número en € (opcional). Si lo dejas en null se muestra "Precio a consultar".
   unit: "kg" si el precio es por kilo (opcional)
   sale: "piece" | "kg" | "both"
   status: "available" | "reserved" | "sold"
*/
const PRODUCTS = [
  {
    id: "ZM-01", featured: 1, category: "specimen", shape: "cube", color: "#c9a227",
    name: { es: "Pirita «Chispa»", en: "Pyrite “Chispa”", de: "Pyrit „Chispa“" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Drusas y piezas sueltas", en: "Clusters and single pieces", de: "Stufen und Einzelstücke" },
    desc: {
      es: "Pirita peruana de cristales pequeños y muy brillantes que «chispean» con la luz. Muy decorativa y apreciada en tiendas.",
      en: "Peruvian pyrite with small, highly lustrous crystals that sparkle in the light. Very decorative and popular with shops.",
      de: "Peruanischer Pyrit mit kleinen, stark glänzenden Kristallen, die im Licht funkeln. Sehr dekorativ und im Handel beliebt."
    }
  },
  {
    id: "ZM-02", featured: 2, category: "carving", shape: "nodule", color: "#b9973c",
    name: { es: "Pirita «Cocada»", en: "Pyrite “Cocada”", de: "Pyrit „Cocada“" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Esferas, tallas y bloques", en: "Spheres, carvings and blocks", de: "Kugeln, Figuren und Blöcke" },
    desc: {
      es: "Pirita compacta y entrelazada, ideal para pulir: esferas, huevos, figuras y piezas de decoración.",
      en: "Compact, intergrown pyrite that takes a great polish — spheres, eggs, figurines and décor pieces.",
      de: "Kompakter, verwachsener Pyrit, ideal zum Polieren — Kugeln, Eier, Figuren und Dekostücke."
    }
  },
  {
    id: "ZM-03", featured: 3, category: "specimen", shape: "rhombo", color: "#e0566f", photo: "img/p-rodocrosita.webp",
    name: { es: "Rodocrosita", en: "Rhodochrosite", de: "Rhodochrosit" },
    locality: "Perú", sale: "piece", price: null, status: "available",
    formats: { es: "Piezas de colección y pulidos", en: "Collector pieces and polished", de: "Sammlerstücke und poliert" },
    desc: {
      es: "El mineral rosa de los Andes. Cristales y piezas pulidas en tonos frambuesa y rosa.",
      en: "The pink mineral of the Andes. Crystals and polished pieces in raspberry and rose tones.",
      de: "Das rosa Mineral der Anden. Kristalle und polierte Stücke in Himbeer- und Rosatönen."
    }
  },
  {
    id: "ZM-04", featured: 4, category: "polished", shape: "nodule", color: "#f0b9c9",
    name: { es: "Mangano calcita", en: "Mangano calcite", de: "Manganocalcit" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "En bruto, pulidos y esferas", en: "Rough, polished and spheres", de: "Roh, poliert und Kugeln" },
    desc: {
      es: "Calcita rosa pálido con bandas blancas. Bajo luz ultravioleta brilla en rosa intenso.",
      en: "Pale pink calcite with white banding. Glows bright pink under UV light.",
      de: "Zartrosa Calcit mit weißen Bändern. Leuchtet unter UV-Licht kräftig pink."
    }
  },
  {
    id: "ZM-05", featured: 5, category: "polished", shape: "nodule", color: "#2fa3a0", photo: "img/p-crisocola.webp",
    name: { es: "Crisocola", en: "Chrysocolla", de: "Chrysokoll" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Placas, cabujones y en bruto", en: "Slabs, cabochons and rough", de: "Platten, Cabochons und roh" },
    desc: {
      es: "Tonos turquesa y azul intenso, a menudo con cuarzo. Muy usada en joyería y decoración.",
      en: "Turquoise and deep blue tones, often with quartz. Widely used in jewellery and décor.",
      de: "Türkis und tiefes Blau, oft mit Quarz. Beliebt für Schmuck und Dekoration."
    }
  },
  {
    id: "ZM-06", featured: 6, category: "polished", shape: "nodule", color: "#8fcfd8",
    name: { es: "Ópalo andino", en: "Andean opal", de: "Andenopal" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Rosa y azul · pulidos y en bruto", en: "Pink and blue · polished and rough", de: "Rosa und blau · poliert und roh" },
    desc: {
      es: "Ópalo común peruano en tonos rosa suave y azul verdoso. Piedra emblemática del Perú.",
      en: "Peruvian common opal in soft pink and blue-green tones. An emblematic stone of Peru.",
      de: "Peruanischer Opal in zartem Rosa und Blaugrün. Ein Symbolstein Perus."
    }
  },
  {
    id: "ZM-07", featured: 7, category: "polished", shape: "nodule", color: "#4fbfa8",
    name: { es: "Amazonita", en: "Amazonite", de: "Amazonit" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "En bruto, pulidos y esferas", en: "Rough, polished and spheres", de: "Roh, poliert und Kugeln" },
    desc: {
      es: "Feldespato verde azulado con vetas claras. Muy decorativa pulida.",
      en: "Blue-green feldspar with light veining. Beautiful when polished.",
      de: "Blaugrüner Feldspat mit hellen Adern. Poliert besonders schön."
    }
  },
  {
    id: "ZM-08", featured: 8, category: "carving", shape: "nodule", color: "#3d52a6",
    name: { es: "Dumortierita", en: "Dumortierite", de: "Dumortierit" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Bloques, esferas y tallas", en: "Blocks, spheres and carvings", de: "Blöcke, Kugeln und Figuren" },
    desc: {
      es: "Piedra azul profundo, dura y compacta, muy buena para tallar y pulir.",
      en: "Deep blue, hard and compact stone — excellent for carving and polishing.",
      de: "Tiefblauer, harter und kompakter Stein — hervorragend zum Schnitzen und Polieren."
    }
  },
  {
    id: "ZM-09", featured: 9, category: "carving", shape: "nodule", color: "#6f9440",
    name: { es: "Serpentina", en: "Serpentine", de: "Serpentin" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Bloques y tallas", en: "Blocks and carvings", de: "Blöcke und Figuren" },
    desc: {
      es: "Piedra verde jaspeada y fácil de trabajar, clásica para esculturas y objetos tallados.",
      en: "Mottled green stone that is easy to work — a classic for sculptures and carved objects.",
      de: "Gesprenkelter grüner Stein, leicht zu bearbeiten — ein Klassiker für Skulpturen."
    }
  },
  {
    id: "ZM-10", featured: 10, category: "rough", shape: "cube", color: "#cbbfa8",
    name: { es: "Piedra para tallar", en: "Carving stone", de: "Schnitzstein" },
    locality: "Perú", sale: "kg", price: null, status: "available",
    formats: { es: "Bloques en bruto por kilo", en: "Rough blocks by the kilo", de: "Rohblöcke nach Kilo" },
    desc: {
      es: "Bloques de piedra peruana para escultores, talleres y artesanos. Pregunta por tamaños y cantidades.",
      en: "Blocks of Peruvian stone for sculptors, workshops and artisans. Ask us about sizes and quantities.",
      de: "Peruanische Steinblöcke für Bildhauer, Werkstätten und Kunsthandwerker. Fragen Sie nach Größen und Mengen."
    }
  },
  {
    id: "ZM-12", featured: 2.5, category: "carving", shape: "nodule", color: "#e9e4dc", photo: "img/p-llamas.webp",
    name: { es: "Llamas talladas en piedra", en: "Stone-carved llamas", de: "Steinlamas" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Figuras con carga de minerales", en: "Figurines carrying mineral chips", de: "Figuren mit Mineralienladung" },
    desc: {
      es: "Llamas talladas a mano en piedra blanca, con una carga de pequeños trozos de minerales de colores. Un recuerdo muy peruano.",
      en: "Hand-carved llamas in white stone, carrying a load of small colourful mineral chips. A truly Peruvian keepsake.",
      de: "Handgeschnitzte Lamas aus weißem Stein mit einer Ladung kleiner bunter Mineralstücke. Ein typisch peruanisches Andenken."
    }
  },
  {
    id: "ZM-13", featured: 2.6, category: "carving", shape: "nodule", color: "#d9a86c", photo: "img/p-aves.webp",
    name: { es: "Aves talladas en piedra", en: "Stone-carved birds", de: "Vögel aus Stein" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Figuras sobre base de mineral", en: "Figurines on a mineral base", de: "Figuren auf Mineralsockel" },
    desc: {
      es: "Pájaros tallados a mano en piedras de distintos colores, con ojos y picos incrustados, sobre una base de mineral. Cada uno es distinto.",
      en: "Hand-carved birds in stones of different colours, with inlaid eyes and beaks, set on a mineral base. Each one is different.",
      de: "Handgeschnitzte Vögel aus verschiedenfarbigen Steinen, mit eingesetzten Augen und Schnäbeln, auf einem Mineralsockel. Jeder ist ein Unikat."
    }
  },
  {
    id: "ZM-14", featured: 2.7, category: "carving", shape: "nodule", color: "#c9d84a", photo: "img/p-loro.webp",
    name: { es: "Escultura de guacamayo", en: "Macaw sculpture", de: "Ara-Skulptur" },
    locality: "Perú", sale: "piece", price: null, status: "available",
    formats: { es: "Pieza grande sobre roca", en: "Large piece on a rock base", de: "Großes Stück auf Felssockel" },
    desc: {
      es: "Guacamayo tallado en piedra verde moteada, con alas y cola incrustadas en piedras de colores, posado sobre una roca. Pieza de exposición.",
      en: "Macaw carved in mottled green stone, with wings and tail inlaid in coloured stones, perched on a rock. A showpiece.",
      de: "Ara aus gesprenkeltem grünem Stein, Flügel und Schwanz mit farbigen Steinen eingelegt, auf einem Felsen sitzend. Ein Schaustück."
    }
  },
  {
    id: "ZM-15", featured: 2.8, category: "carving", shape: "nodule", color: "#b9a24a", photo: "img/p-calaveras.webp",
    name: { es: "Calaveras talladas", en: "Carved skulls", de: "Geschnitzte Schädel" },
    locality: "Perú", sale: "both", price: null, status: "available",
    formats: { es: "Pirita y piedras de colores", en: "Pyrite and coloured stones", de: "Pyrit und farbige Steine" },
    desc: {
      es: "Calaveras talladas y pulidas a mano en pirita, piedra verde moteada y otras piedras de colores. Muy buscadas en ferias.",
      en: "Skulls hand-carved and polished in pyrite, mottled green stone and other coloured stones. Very popular at shows.",
      de: "Handgeschnitzte und polierte Schädel aus Pyrit, gesprenkeltem grünem Stein und anderen farbigen Steinen. Auf Messen sehr gefragt."
    }
  },
  {
    id: "ZM-16", featured: 6.5, category: "polished", shape: "nodule", color: "#2b2b33", photo: "img/p-obsidiana.webp",
    name: { es: "Esferas de obsidiana", en: "Obsidian spheres", de: "Obsidian-Kugeln" },
    locality: "México", sale: "piece", price: null, status: "available",
    formats: { es: "Obsidiana negra y arcoíris", en: "Black and rainbow obsidian", de: "Schwarzer und Regenbogen-Obsidian" },
    desc: {
      es: "Esferas pulidas de obsidiana negra y de obsidiana arcoíris, que muestra bandas de colores con la luz. Origen: México.",
      en: "Polished spheres of black obsidian and rainbow obsidian, which shows coloured bands in the light. Origin: Mexico.",
      de: "Polierte Kugeln aus schwarzem Obsidian und Regenbogen-Obsidian, der im Licht farbige Bänder zeigt. Herkunft: Mexiko."
    }
  },
  {
    id: "ZM-11", featured: 11, mixed: true, category: "rough", shape: "cluster", color: "#d9a3b3",
    name: { es: "Lotes mixtos al por mayor", en: "Mixed wholesale lots", de: "Gemischte Großhandels-Lots" },
    locality: "Perú", sale: "kg", price: null, status: "available",
    formats: { es: "Surtido por kilo, a medida", en: "Assorted by the kilo, made to order", de: "Sortiert nach Kilo, nach Wunsch" },
    desc: {
      es: "Combinamos los minerales de nuestro catálogo según lo que necesites para tu tienda o feria.",
      en: "We combine minerals from our range to match what you need for your shop or show.",
      de: "Wir stellen Mineralien aus unserem Sortiment nach Ihrem Bedarf für Laden oder Messe zusammen."
    }
  }
];

/* ---------- Ferias y eventos ----------
   Fechas en formato AAAA-MM-DD. Los eventos pasados se mueven solos a "Ferias anteriores".
   status: "confirmed" | "tbc"
   ⚠ Las fechas de ejemplo son orientativas: compruébalas con cada organizador antes de publicar.
*/
const EVENTS = [
  {
    name: "Mineralientage München — The Munich Show",
    city: "München", country: "DE", flag: "🇩🇪",
    venue: "Messe München", start: "2026-10-23", end: "2026-10-25",
    booth: "B6 · 214", status: "confirmed", url: "https://munichshow.com"
  },
  {
    name: "Mineralien Hamburg",
    city: "Hamburg", country: "DE", flag: "🇩🇪",
    venue: "Hamburg Messe", start: "2026-12-11", end: "2026-12-13",
    booth: "", status: "tbc", url: ""
  },
  {
    name: "Burza minerálů Praha",
    city: "Praha", country: "CZ", flag: "🇨🇿",
    venue: "", start: "2027-03-13", end: "2027-03-14",
    booth: "", status: "tbc", url: ""
  },
  {
    name: "Mineralientage Wien",
    city: "Wien", country: "AT", flag: "🇦🇹",
    venue: "", start: "2027-04-17", end: "2027-04-18",
    booth: "", status: "tbc", url: ""
  },
  {
    name: "Mineral & Gem — Sainte-Marie-aux-Mines",
    city: "Sainte-Marie-aux-Mines", country: "FR", flag: "🇫🇷",
    venue: "Alsace", start: "2027-06-24", end: "2027-06-27",
    booth: "", status: "confirmed", url: "https://www.sainte-marie-mineral.com"
  },
  {
    name: "Burza minerálů Praha (podzim)",
    city: "Praha", country: "CZ", flag: "🇨🇿",
    venue: "", start: "2027-09-18", end: "2027-09-19",
    booth: "", status: "tbc", url: ""
  },
  {
    name: "Mineralientage München — The Munich Show",
    city: "München", country: "DE", flag: "🇩🇪",
    venue: "Messe München", start: "2027-10-29", end: "2027-10-31",
    booth: "", status: "tbc", url: "https://munichshow.com"
  }
];

/* ---------- Distribuidores ----------
   type: "shop" | "wholesale" | "gallery" | "online"
   placeholder: true muestra la etiqueta "Ejemplo" — bórrala al poner datos reales.
*/
const DISTRIBUTORS = [
  { name: "Kristallgalerie Schwabing", city: "München", country: "DE", flag: "🇩🇪", type: "gallery",
    contact: "kontakt@example.de", web: "", placeholder: true },
  { name: "Steinreich Hamburg", city: "Hamburg", country: "DE", flag: "🇩🇪", type: "shop",
    contact: "info@example.de", web: "", placeholder: true },
  { name: "Krystal Praha s.r.o.", city: "Praha", country: "CZ", flag: "🇨🇿", type: "wholesale",
    contact: "obchod@example.cz", web: "", placeholder: true },
  { name: "Minerály Brno", city: "Brno", country: "CZ", flag: "🇨🇿", type: "shop",
    contact: "info@example.cz", web: "", placeholder: true },
  { name: "Cristaux d'Alsace", city: "Strasbourg", country: "FR", flag: "🇫🇷", type: "shop",
    contact: "contact@example.fr", web: "", placeholder: true },
  { name: "Galerie Minérale Paris", city: "Paris", country: "FR", flag: "🇫🇷", type: "gallery",
    contact: "bonjour@example.fr", web: "", placeholder: true },
  { name: "Andes Stones Online", city: "Wien", country: "AT", flag: "🇦🇹", type: "online",
    contact: "office@example.at", web: "", placeholder: true }
];
