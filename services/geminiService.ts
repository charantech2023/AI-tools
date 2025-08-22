import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        pageIntent: { type: Type.STRING, description: "A concise, one-sentence summary of the page's core purpose from the publisher's perspective." },
        keyTakeaways: {
            type: Type.ARRAY,
            description: "3-5 essential bullet points that summarize the article's main arguments and conclusions.",
            items: { type: Type.STRING }
        },
        siblingLinks: {
            type: Type.ARRAY,
            description: "Up to 3 recommended sibling pages from the same domain. The placement sentence must logically lead into the topic of the suggested link.",
            items: {
                type: Type.OBJECT,
                properties: {
                    anchorText: { type: Type.STRING, description: "3-6 words, verb-driven, unique anchor text." },
                    placement: {
                        type: Type.OBJECT,
                        properties: {
                            quote: { type: Type.STRING, description: "The exact sentence from the page where the link should be inserted." },
                            nearestHeading: { type: Type.STRING, description: "The nearest H2/H3 heading above the placement sentence." },
                        },
                        required: ["quote", "nearestHeading"],
                    },
                    url: { type: Type.STRING, description: "Direct URL to the sibling page." },
                },
                required: ["anchorText", "placement", "url"],
            },
        },
        statsAndKeyFacts: {
            type: Type.ARRAY,
            description: "3-5 authoritative data points. Prioritize stats from post-2023 from high-authority sources, but also extract key figures presented in the article itself.",
            items: {
                type: Type.OBJECT,
                properties: {
                    metricAndValue: { type: Type.STRING, description: "The data point or key fact." },
                    yearAndGeography: { type: Type.STRING, description: "Year and geography (e.g., '2024, US'). If not available, state 'Not specified'." },
                    sourceCitation: { type: Type.STRING, description: "Full source citation. This field is MANDATORY. If cited in-text, use that. Otherwise, state 'Source: The analyzed article'." },
                },
                 required: ["metricAndValue", "yearAndGeography", "sourceCitation"],
            },
        },
        proTips: {
            type: Type.ARRAY,
            description: "2-3 actionable 'pro tips' for the reader, derived from the webpage's core advice, including a contextual placement for each tip.",
            items: {
                type: Type.OBJECT,
                properties: {
                    tip: { type: Type.STRING, description: "The actionable advice or pro tip." },
                    placement: {
                        type: Type.OBJECT,
                        properties: {
                            quote: { type: Type.STRING, description: "The exact sentence from the article that inspires the tip, providing context." },
                            nearestHeading: { type: Type.STRING, description: "The nearest H2/H3 heading above the placement sentence." },
                        },
                        required: ["quote", "nearestHeading"],
                    }
                },
                required: ["tip", "placement"]
            }
        },
        conclusion: {
            type: Type.STRING,
            description: "A brief, powerful conclusion (2-3 sentences) that synthesizes the article's main arguments and gives the reader a clear final thought."
        },
        aiSEOCapsule: { type: Type.STRING, description: "A 40-55 word direct-answer capsule suitable for a featured snippet, written in a helpful, expert tone." },
    },
    required: ["pageIntent", "keyTakeaways", "siblingLinks", "statsAndKeyFacts", "proTips", "conclusion", "aiSEOCapsule"],
};


const getAnalysisPrompt = (content: string, existingLinks: string[]) => {
    const existingLinksString = existingLinks.length > 0 
        ? existingLinks.join('\n')
        : 'No links found.';

    return `
    As a Senior Content Strategist, your task is to perform a deep analysis of the provided webpage content. Your output must be a structured JSON object and all fields must be deeply rooted in the provided text, demonstrating a comprehensive understanding of its nuances, arguments, and key takeaways. The provided content has been programmatically cleaned to remove headers, footers, navigation, and other non-essential blocks.

    **Webpage Content:**
    """
    ${content}
    """

    **Existing Links on the Page (to be excluded from suggestions):**
    """
    ${existingLinksString}
    """

    **Analysis Instructions & Formatting Rules (Strictly Enforced):**

    You must return a single, valid JSON object that conforms to the provided schema. Do not include any commentary, markdown formatting, or text outside of the JSON object.

    1.  **Page Intent**: Identify the primary goal of this page from the perspective of its publisher. What action or understanding are they trying to drive? Summarize this in one concise sentence.
    2.  **Key Takeaways**: Distill the article into its 3-5 most critical points. These should be the essential arguments or conclusions a reader must not miss.
    3.  **Up to 3 Sibling Links**: Recommend up to 3 relevant sibling pages from the same domain. The chosen placement sentence must create a logical and smooth transition to the linked page's topic. Enforce a balanced mix: at least one product page if relevant, plus a blog/guide/case study. **Crucially, you must NOT suggest any URLs that are already present in the "Existing Links on the Page" list provided above.**
    4.  **Stats & Key Facts**: Extract 3–5 of the most impactful data points. Strongly prioritize recent stats (post-2023) from authoritative sources. However, if the article presents data directly (e.g., '55% of users...'), extract it. **For every stat, you MUST provide a 'sourceCitation'. If an external source is cited, use it. If no source is cited, you MUST write 'Source: The analyzed article'. This field cannot be empty.**
    5.  **Pro Tips**: Based *only* on the advice within the article, formulate 2-3 actionable 'pro tips'. For each tip, identify the exact sentence from the article that inspires it and the nearest heading above it to provide context.
    6.  **Conclusion**: Write a powerful conclusion of 2-3 sentences that synthesizes the article's core message and gives the reader a definitive final thought.
    7.  **AI/SEO Capsule**: Write a 40–55 word direct-answer capsule suitable for a featured snippet. It should be helpful, concise, and written in an expert tone.
    8.  **Strict Enforcement**: If strong, contextually relevant items for links, stats, or tips don't exist, return empty arrays. No filler content.
    `;
};


export const fetchAndParseUrl = async (url: string): Promise<{ textContent: string; existingLinks: string[] }> => {
    // Using a CORS proxy to fetch URL content from the client-side.
    // This is for demonstration purposes. A production app would use a server-side endpoint.
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch URL. Status: ${response.status}`);
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // 1. Get all existing links before modifying the DOM
    const existingLinks = Array.from(doc.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href && (href.startsWith('http') || href.startsWith('/')));

    // 2. Remove non-essential sections to isolate main content
    const selectorsToRemove = [
        'script', 'style', 'nav', 'footer', 'header', 'aside', 'form',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]', '[role="complementary"]',
        '.header', '.footer', '#header', '#footer',
        '.sidebar', '#sidebar', '.nav', '#nav', '.menu', '#menu',
        '.ad', '.ads', '.advertisement', '.popup', '.modal'
    ];
    doc.querySelectorAll(selectorsToRemove.join(', ')).forEach(el => el.remove());
    
    // 3. Get text content from the cleaned body and clean up whitespace
    let textContent = doc.body.textContent || '';
    textContent = textContent.replace(/\s\s+/g, ' ').trim();

    // 4. Limit content size to avoid overly large API requests
    const MAX_LENGTH = 15000;
    
    return { 
        textContent: textContent.substring(0, MAX_LENGTH),
        existingLinks: [...new Set(existingLinks)] // Return unique links
    };
};


export const analyzeWebpageContent = async (pageContent: string, existingLinks: string[]): Promise<AnalysisResult> => {
    if (!pageContent.trim()) {
        throw new Error("Webpage content is empty or could not be parsed.");
    }

    const prompt = getAnalysisPrompt(pageContent, existingLinks);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
                temperature: 0.2,
                topP: 0.95,
                seed: 42,
                maxOutputTokens: 2048,
                thinkingConfig: { thinkingBudget: 1024 },
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from AI. The model may have had an issue processing the content.");
    }
};