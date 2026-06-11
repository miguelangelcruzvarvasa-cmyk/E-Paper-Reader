export const defaultTextContent = `# Bienvenidos a Tinta Papel E-Ink 📖

Este es un lector digital de confort visual diseñado específicamente para combatir la **fatiga ocular digital** (asteno-opía), reducir el estrés de la córnea y ayudarte a leer largos textos, libros o artículos de internet de una manera amigable y segura para tus ojos.

---

## ¿Por qué tenemos fatiga visual con dispositivos convencionales?
Las pantallas tradicionales tipo LED u OLED emiten luz mediante diodos que disparan haces directamente a tus ojos. Para el cerebro, esto equivale a mirar fijamente una bombilla atenuada durante horas. Esta emisión constante de **luz azul de alta energía** y el parpadeo incesante genera:
1. **Reducción de parpadeo**: Parpadeamos un 60% menos al mirar pantallas, desecando la película lagrimal.
2. **Fatiga acomodativa**: El enfoque estático del contraste extremo de los píxeles digitales agota tu músculo biliar en poco tiempo.
3. **Pérdida del sueño**: La luz azul de noche inhibe la secreción de melatonina, impidiendo conciliar el sueño profundo.

---

## Cómo usar este Lector Inteligente
Para empezar, selecciona una de las tres pestañas superiores en el cargador:
* **Pegar Texto o Notas**: Pega cualquier texto libre, novela o apuntes académicos aquí mismo para convertirlos instantáneamente al formato de confort.
* **Convertir Enlace Web**: Introduce un enlace de un blog, periódico o Wikipedia. Nuestro backend procesará el sitio y la **Inteligencia Artificial (Gemini)** extraerá solo el cuerpo útil del artículo en Markdown impecable, descartando ventanas emergentes molestas o anuncios.
* **Cargar Documento PDF**: Arrastra o sube cualquier libro o diapositiva en PDF. Renderizaremos cada página sobre un lienzo digital aplicando todos los filtros protectores de escala de grises y papel mate.

---

## Explora el Panel de Configuración Lateral
Ajusta la interfaz según la sensibilidad de tus ojos:
* **Tipos de Papel**: Elige entre *Papel Claro* (Kindle Pearl), *Sepia Cálido* (Paperwhite cálido ideal para leer de noche), *Gris Slate* (Kobo clásico) o *Tinta Invertida* (Modo noche mate).
* **Simulación de Hardware**: Activa el **Efecto Ghosting** para añadir un sutil residuo del texto anterior, o la **Textura Granulada Mate** para dispersar visualmente el haz de luz de tu monitor tradicional.
* **Refrescar Pantalla**: Haz clic en el botón de refresco para simular el destello electromagnético de limpieza que purga cualquier residuo en las pantallas de tinta electrónica real.

Disfruta de una lectura saludable y protege tu visión. ¡El conocimiento no tiene por qué doler!`;

export const uiThemeClasses: Record<string, {
  rootBg: string;
  headerBg: string;
  headerIcon: string;
  tabSelected: string;
  tabUnselected: string;
  loadersBg: string;
  notebookBg: string;
  floatingBtn: string;
  select: string;
}> = {
  "paper-white": {
    rootBg: "bg-[#e5e5e0]",
    headerBg: "bg-[#dcdcd7] text-neutral-800 border-b border-[#c2c2bd]",
    headerIcon: "bg-[#fcfbf9] text-neutral-800 border-[#c2c2bd]",
    tabSelected: "bg-[#fcfbf9] text-neutral-900 shadow",
    tabUnselected: "text-[#4b5563] hover:text-neutral-900 hover:bg-[#d8d8d3]",
    loadersBg: "bg-[#ecebe6] border-[#d8d7d3]",
    notebookBg: "bg-[#ecebe6] border-[#d8d7d3]",
    floatingBtn: "bg-[#fcfbf9] border-[#d8d7d3] hover:bg-[#ecebe6] text-neutral-800 hover:text-neutral-900",
    select: "bg-[#fcfbf9] border-[#c2c2bd] text-[#111213] focus:ring-neutral-700"
  },
  "warm-sepia": {
    rootBg: "bg-[#ebdfce]",
    headerBg: "bg-[#decfa7] text-[#2c2b26] border-b border-[#c8bfa3]",
    headerIcon: "bg-[#f4ebd0] text-[#2c2b26] border-[#c8bfa3]",
    tabSelected: "bg-[#f4ebd0] text-[#2c2b26] shadow",
    tabUnselected: "text-[#5c523f] hover:text-[#2c2b26] hover:bg-[#decfa7]/60",
    loadersBg: "bg-[#ebdcca] border-[#dacfb9]",
    notebookBg: "bg-[#ebdcca] border-[#dacfb9]",
    floatingBtn: "bg-[#f4ebd0] border-[#dacfb9] hover:bg-[#ebdcca] text-[#2c2b26]",
    select: "bg-[#f4ebd0] border-[#c8bfa3] text-[#2c2b26] focus:ring-[#80765c]"
  },
  "cool-grey": {
    rootBg: "bg-[#cbd5e1]",
    headerBg: "bg-[#b8c2cc] text-neutral-800 border-b border-[#9aa4b3]",
    headerIcon: "bg-[#e5e7eb] text-neutral-800 border-[#9aa4b3]",
    tabSelected: "bg-[#e5e7eb] text-neutral-900 shadow",
    tabUnselected: "text-neutral-600 hover:text-neutral-900 hover:bg-[#b0bac2]",
    loadersBg: "bg-[#d8dbdf] border-[#cbd5e1]",
    notebookBg: "bg-[#d8dbdf] border-[#cbd5e1]",
    floatingBtn: "bg-[#e5e7eb] border-[#cbd5e1] hover:bg-[#d8dbdf] text-neutral-800 hover:text-neutral-900",
    select: "bg-[#e5e7eb] border-[#9aa4b3] text-neutral-800 focus:ring-neutral-700"
  },
  "dark-ink": {
    rootBg: "bg-[#111213]",
    headerBg: "bg-[#18191b] text-[#cfcfcf] border-b border-[#2d2e30]",
    headerIcon: "bg-[#1d1e20] text-[#cfcfcf] border-[#2d2e30]",
    tabSelected: "bg-[#1d1e20] text-[#dedede] shadow",
    tabUnselected: "text-neutral-400 hover:text-white hover:bg-neutral-850",
    loadersBg: "bg-[#1c1d1f] border-[#2d2e30]",
    notebookBg: "bg-[#1c1d1f] border-[#2d2e30]",
    floatingBtn: "bg-[#1d1e20] border-[#2d2e30] hover:bg-[#2a2b2d] text-[#dedede] hover:text-white",
    select: "bg-[#1d1e20] border-[#2d2e30] text-[#cfcfcf] focus:ring-neutral-600"
  }
};
