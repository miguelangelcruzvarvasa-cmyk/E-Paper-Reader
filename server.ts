import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// ── In-memory user-provided API keys (set via /api/set-keys) ──
const userKeys: Record<string, string> = {};

function getApiKey(provider: AIProvider): string {
  // 1. User-provided key (via UI)
  if (userKeys[provider]) return userKeys[provider];
  // 2. Environment variable
  const envMap: Record<AIProvider, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
  };
  return envMap[provider] || "";
}

function isProviderAvailable(provider: AIProvider): boolean {
  return !!getApiKey(provider);
}

// ── AI Provider types ──
type AIProvider = "gemini" | "groq" | "deepseek";

interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

const AVAILABLE_MODELS: AIModel[] = [
  // Gemini
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "gemini" },
  // Groq
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", provider: "groq" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", provider: "groq" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "groq" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B", provider: "groq" },
  { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B (Groq)", provider: "groq" },
  // DeepSeek (via DeepSeek API)
  { id: "deepseek-chat", name: "DeepSeek V3 (Chat)", provider: "deepseek" },
  { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoner)", provider: "deepseek" },
];

function getDefaultModel(provider: AIProvider): string {
  const defaults: Record<AIProvider, string> = {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    deepseek: "deepseek-chat",
  };
  return defaults[provider];
}

function getActiveProvider(): AIProvider {
  const env = process.env.AI_PROVIDER?.toLowerCase();
  if (env === "groq") return "groq";
  if (env === "deepseek") return "deepseek";
  return "gemini";
}

// ── Unified AI call ──
async function callAI(params: {
  provider: AIProvider;
  model: string;
  prompt: string;
  systemInstruction?: string;
}): Promise<string> {
  const { provider, model, prompt, systemInstruction } = params;

  if (provider === "gemini") {
    const apiKey = getApiKey("gemini");
    if (!apiKey) throw new Error("GEMINI_API_KEY no configurada. Usa el panel de configuración para agregar tu clave.");
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    return res.text || "";
  }

  if (provider === "groq") {
    const apiKey = getApiKey("groq");
    if (!apiKey) throw new Error("GROQ_API_KEY no configurada. Usa el panel de configuración para agregar tu clave.");
    const groq = new Groq({ apiKey });
    const messages: any[] = [{ role: "user", content: prompt }];
    if (systemInstruction) messages.unshift({ role: "system", content: systemInstruction });
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    });
    return completion.choices[0]?.message?.content || "";
  }

  if (provider === "deepseek") {
    const apiKey = getApiKey("deepseek");
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY no configurada. Usa el panel de configuración para agregar tu clave.");
    const deepseek = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });
    const messages: any[] = [{ role: "user", content: prompt }];
    if (systemInstruction) messages.unshift({ role: "system", content: systemInstruction });
    const completion = await deepseek.chat.completions.create({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    });
    return completion.choices[0]?.message?.content || "";
  }

  throw new Error(`Proveedor IA no soportado: ${provider}`);
}

// Helper to extract titles from raw html pages
function getTitleFromPage(html: string, url: string): string {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (match && match[1]) {
    // Unescape common HTML entities
    return match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.hostname + u.pathname;
  } catch {
    return url;
  }
}

// Simple text-extraction reader mode that preserves formatting, code blocks, and images
function stripHtmlBasic(html: string): string {
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Convert raw <img> tags to markdown format so figures/screenshots are retained in fast mode
  clean = clean.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, "\n\n![$2]($1)\n\n");
  clean = clean.replace(/<img\s+[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi, "\n\n![$1]($2)\n\n");
  clean = clean.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, "\n\n![Ilustración técnica]($1)\n\n");

  // Convert raw code blocks <pre><code> to markdown blocks safely before stripping tags
  clean = clean.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (match, codeBlock) => {
    // Strip inner <code> tag tags if active
    let innerText = codeBlock.replace(/<code\b[^>]*>/gi, "").replace(/<\/code>/gi, "");
    // Decode common entities inside code
    innerText = innerText
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return `\n\n\`\`\`\n${innerText}\n\`\`\`\n\n`;
  });

  // Convert inline <code> to inline markdown backticks
  clean = clean.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (match, inlineCode) => {
    return ` \`${inlineCode.replace(/<[^>]+>/g, "")}\` `;
  });

  // Match useful reading blocks including images and converted code
  const matches = clean.match(/<(p|h1|h2|h3|h4|h5|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>|!\[[^\]]*\]\([^\)]+\)|```[\s\S]*?```/gi);
  if (!matches) {
    // Fallback: strip standard tags but keep converted code and images
    const fallback = clean.replace(/<(?!img|pre|code)[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return fallback.slice(0, 15000);
  }

  return matches
    .map((tag) => {
      if (tag.startsWith("![") || tag.startsWith("```")) {
        return tag + "\n\n";
      }

      const stripped = tag.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (stripped.length < 3) return "";
      
      const lowercaseTag = tag.substring(0, 10).toLowerCase();
      if (lowercaseTag.includes("<h1") || lowercaseTag.includes("<h2")) {
        return `\n## ${stripped}\n\n`;
      }
      if (lowercaseTag.includes("<h3") || lowercaseTag.includes("<h4") || lowercaseTag.includes("<h5")) {
        return `\n### ${stripped}\n\n`;
      }
      if (lowercaseTag.includes("<blockquote")) {
        return `\n> ${stripped}\n\n`;
      }
      if (lowercaseTag.includes("<li")) {
        return `* ${stripped}\n`;
      }
      return `${stripped}\n\n`;
    })
    .filter(Boolean)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // ── API Routes ──

  // List available AI models
  app.get("/api/models", (_req, res) => {
    const activeProvider = getActiveProvider();
    const models = AVAILABLE_MODELS.filter(m => m.provider === activeProvider);
    const allModels = AVAILABLE_MODELS.map(m => ({
      ...m,
      active: m.provider === activeProvider,
    }));
    return res.json({ provider: activeProvider, models, allModels });
  });

  // Endpoint to fetch web article from link
  app.post("/api/fetch-url", async (req, res) => {
    const { url, useAi, provider: reqProvider, model: reqModel } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Por favor proporciona un enlace web válido." });
    }

    const provider: AIProvider = reqProvider || getActiveProvider();
    const model = reqModel || getDefaultModel(provider);

    try {
      const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
      new URL(formattedUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(formattedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const pageTitle = getTitleFromPage(html, url);

      if (useAi) {
        const preStripped = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
          .replace(/<!--[\s\S]*?-->/g, "");

        const truncatedHtml = preStripped.slice(0, 60000);

        const prompt = `Analiza el siguiente código HTML de un artículo web, blog o lección de curso y extrae ÚNICAMENTE el título principal, subtítulos, autores, fecha y todo el cuerpo útil del contenido estructurado.
REQUISITOS IMPORTANTES:
1. Bloques de código: Conserva intactos todos los bloques de código o comandos explicativos (usando sintaxis de Markdown \`\`\`tipo_lenguaje... \`\`\`). No elimines ni resumas el código técnico, ya que es vital para el estudiante.
2. Imágenes e Ilustraciones Técnicas: Conserva las etiquetas de imágenes útiles que expliquen configuraciones, diagramas o pasos visuales escribiéndolas como enlaces markdown: ![descripción de la imagen o captura](URL_absoluta_de_la_imagen).
3. Descarta anuncios publicitarios, videos de spam, barras laterales de widgets, menús de navegación superior y pies de página.
DEVUELVE EL CONTENIDO EXACTO FORMATEADO ESTRICTAMENTE EN MARKDOWN en español, enfocado en el aprendizaje fluido y alta legibilidad visual.

HTML del sitio web:
${truncatedHtml}`;

        const markdownText = await callAI({
          provider,
          model,
          prompt,
          systemInstruction: "Eres un lector web inteligente especializado en e-Ink y educación técnica. Tu misión es limpiar el HTML de cursos o artículos extrayendo un manuscrito hermoso en Markdown. Preservas metódicamente el código técnico completo y las imágenes instruccionales, dándoles un formato óptimo pero limpio de ruidos de publicidad o marketing."
        });

        return res.json({ markdown: markdownText, title: pageTitle, provider, model });
      } else {
        const rawBody = stripHtmlBasic(html);
        const headerMd = `# ${pageTitle}\n\n*Texto extraído directamente de la web (Modo Rápido)*\n\n---\n\n`;
        return res.json({ markdown: headerMd + rawBody, title: pageTitle });
      }
    } catch (err: any) {
      console.error("Error al rastrear la url:", err);
      return res.status(500).json({
        error: `Error al acceder al sitio web: ${err.message || err}. Asegúrate de que el enlace sea correcto y permita accesos externos.`,
      });
    }
  });

  // ── API Key Management ──

  // Get status of all providers (which have keys configured)
  app.get("/api/status", (_req, res) => {
    const providers: AIProvider[] = ["gemini", "groq", "deepseek"];
    const status = providers.map(p => ({
      provider: p,
      available: isProviderAvailable(p),
      source: userKeys[p] ? "user" : (process.env[`${p.toUpperCase()}_API_KEY`] ? "env" : "none"),
    }));
    return res.json({ providers: status, activeProvider: getActiveProvider() });
  });

  // Set user-provided API key
  app.post("/api/set-keys", (req, res) => {
    const { provider, apiKey } = req.body;
    if (!provider || !apiKey) {
      return res.status(400).json({ error: "Falta provider o apiKey." });
    }
    const validProviders: AIProvider[] = ["gemini", "groq", "deepseek"];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({ error: `Provider no válido: ${provider}. Usa: gemini, groq, deepseek.` });
    }
    userKeys[provider] = apiKey.trim();
    console.log(`[E-Ink] Clave API configurada para ${provider} por el usuario.`);
    return res.json({ success: true, provider, available: true });
  });

  // AI Assist: summarize / simplify / explain
  app.post("/api/ai/assist", async (req, res) => {
    const { text, type, provider: reqProvider, model: reqModel } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Falta el texto de lectura." });
    }

    const provider: AIProvider = reqProvider || getActiveProvider();
    const model = reqModel || getDefaultModel(provider);

    try {
      let prompt = "";
      let systemDef = "Eres un asistente de lectura de tinta electrónica rápido y simplificado. Responde en español.";

      if (type === "summarize") {
        prompt = `Resume el siguiente fragmento en 3 o 4 viñetas cortas, muy claras y fáciles de leer:\n\n"${text}"`;
        systemDef = "Creas resúmenes concisos en español en formato de viñetas claras.";
      } else if (type === "simplify") {
        prompt = `Reescribe o explica de forma extremadamente sencilla, didáctica y en español con un tono cercano, evitando jerga técnica, el siguiente texto:\n\n"${text}"`;
        systemDef = "Simplificas textos complejos con un lenguaje amigable y comprensible para cualquier persona.";
      } else if (type === "synthesis") {
        prompt = `El usuario ha recopilado las siguientes notas y apuntes en su libreta durante la lectura. Analízalas y genera una guía de estudio estructurada en español que contenga:
1. Un resumen ejecutivo unificado de los temas.
2. Conceptos clave definidos de forma didáctica.
3. 3 preguntas de autoevaluación con respuestas ocultas en un bloque desplegable (<details><summary>Ver Respuesta</summary>...</details>) para que el estudiante pueda evaluarse.

Notas del usuario a sintetizar:
${text}`;
        systemDef = "Eres un tutor académico de alto rendimiento. Creas guías de estudio, síntesis educativas y exámenes de autoevaluación premium y ordenados a partir de las notas de un estudiante.";
      } else {
        prompt = `Explica brevemente los conceptos clave del siguiente texto en un párrafo corto y claro:\n\n"${text}"`;
        systemDef = "Das explicaciones breves, sabias y pedagógicas sobre cualquier fragmento de lectura.";
      }

      const result = await callAI({ provider, model, prompt, systemInstruction: systemDef });
      return res.json({ response: result, provider, model });
    } catch (err: any) {
      console.error("Error in AI Assistant:", err);
      return res.status(500).json({ error: `Error en Asistente IA: ${err.message || err}` });
    }
  });

  // --- Vite Dev Server Middleware / Static Serving ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[E-Ink Backend] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
