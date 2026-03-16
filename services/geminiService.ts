import { GoogleGenAI, Type, Schema } from "@google/genai";

// Use specific models as per guidelines
const MODEL_REFINER = "gemini-3-pro-preview"; 
const MODEL_GROUNDING = "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const refinerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: "Headline: Destino + Tipo de Experiência + Diferencial." },
    openingParagraph: { type: Type.STRING, description: "Opening paragraph (2–3 lines)." },
    whatToExpect: { type: Type.STRING, description: "Content for 'O que esperar' section in Markdown." },
    highlights: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of highlights (bullet points)." 
    },
    importantInfo: { type: Type.STRING, description: "Explicit important information only. Markdown supported." },
    idealFor: { type: Type.STRING, description: "Brief description of the ideal traveler." },
    seoKeywords: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Strategic SEO keywords." 
    },
    hasMissingOperationalInfo: { type: Type.BOOLEAN, description: "True if critical operational details like duration or logistics were missing from input." },
    auditTrail: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          change: { type: Type.STRING, description: "Specific improvement made." },
          reason: { type: Type.STRING, description: "Marketing or clarity reason." },
          factualConfirmation: { type: Type.STRING, description: "Evidence that no data was invented." }
        },
        required: ["change", "reason", "factualConfirmation"]
      }
    }
  },
  required: [
    "headline", 
    "openingParagraph", 
    "whatToExpect", 
    "highlights", 
    "importantInfo", 
    "idealFor", 
    "seoKeywords", 
    "hasMissingOperationalInfo", 
    "auditTrail"
  ]
};

export const refineProductText = async (originalText: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_REFINER,
      contents: `
        Você é o iFriend Experience Refiner. Sua função é transformar descrições cruas de experiências turísticas em textos profissionais, claros, confiáveis e prontos para marketplace.

        REGRAS OBRIGATÓRIAS:
        - NÃO invente informações (preços, horários, duração ou logística se não estiverem explícitos).
        - NÃO presuma dados que não estejam no texto original.
        - NÃO mencione concorrentes.
        - Linguagem: Português profissional, sem adjetivos exagerados ou promessas artificiais.
        - Destaque diferenciais iFriend (tours locais, tempo estendido, visitas internas, equipamento premium).

        ESTRUTURA FIXA DO OUTPUT (Deve seguir esta lógica na sua resposta JSON):
        1. Headline: Destino + Tipo de Experiência + Diferencial.
        2. Parágrafo de abertura: Curto (2-3 linhas).
        3. O que esperar: Texto descritivo e persuasivo.
        4. Destaques: Lista de benefícios/pontos fortes.
        5. Informações importantes: Apenas dados explícitos e factuais.
        6. Ideal para: Perfil do viajante.
        7. SEO Keywords: Lista estratégica.

        Se alguma informação operacional estiver faltando (ex: duração não informada), marque 'hasMissingOperationalInfo' como true.

        Input Text:
        "${originalText}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: refinerSchema,
        temperature: 0.1, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
};

export const verifyLocationWithMaps = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_GROUNDING,
      contents: `Verifique a existência deste local: ${query}. Responda em Português.`,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const uris = chunks?.map((c: any) => ({
      uri: c.maps?.uri || '',
      title: c.maps?.title || 'Ver no Maps'
    })).filter((u: any) => u.uri) || [];

    return {
      text: response.text || "Verificação de localização não disponível.",
      uris
    };
  } catch (error) {
    console.error("Maps Error:", error);
    return { text: "Erro ao verificar localização.", uris: [] };
  }
};

export const checkFactsWithSearch = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_GROUNDING,
      contents: `Valide os fatos desta experiência: ${query}. Responda em Português.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const uris = chunks?.map((c: any) => ({
      uri: c.web?.uri || '',
      title: c.web?.title || 'Fonte'
    })).filter((u: any) => u.uri) || [];

    return {
      text: response.text || "Pesquisa não disponível.",
      uris
    };
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "Erro ao realizar busca de fatos.", uris: [] };
  }
};
