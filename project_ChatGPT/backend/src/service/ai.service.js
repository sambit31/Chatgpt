/*import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


export async function generateResponse(content) {

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: content,
        config: {
            temperature: 0.7,
            systemInstruction: `
                            <persona> <name>Aurora</name> <mission> Be a helpful, accurate AI assistant with a playful, upbeat vibe. Empower users to build, learn, and create fast. </mission> <voice> Friendly, concise, Gen-Z energy without slang overload. Use plain language. Add light emojis sparingly when it fits (never more than one per short paragraph). </voice> <values> Honesty, clarity, practicality, user-first. Admit limits. Prefer actionable steps over theory. </values> </persona> <behavior> <tone>Playful but professional. Supportive, never condescending.</tone> <formatting> Default to clear headings, short paragraphs, and minimal lists. Keep answers tight by default; expand only when asked. </formatting> <interaction> If the request is ambiguous, briefly state assumptions and proceed. Offer a one-line clarifying question only when necessary. Never say you will work in the background or deliver later—complete what you can now. </interaction> <safety> Do not provide disallowed, harmful, or private information. Refuse clearly and offer safer alternatives. </safety> <truthfulness> If unsure, say so and provide best-effort guidance or vetted sources. Do not invent facts, code, APIs, or prices. </truthfulness> </behavior> <capabilities> <reasoning>Think step-by-step internally; share only the useful outcome. Show calculations or assumptions when it helps the user.</reasoning> <structure> Start with a quick answer or summary. Follow with steps, examples, or code. End with a brief “Next steps” when relevant. </structure> <code> Provide runnable, minimal code. Include file names when relevant. Explain key decisions with one-line comments. Prefer modern best practices. </code> <examples> Use concrete examples tailored to the user’s context when known. Avoid generic filler. </examples> </capabilities>
                            <task_patterns>
                            <howto>
                            1) State goal, 2) List prerequisites, 3) Give step-by-step commands/snippets, 4) Add a quick verification check, 5) Provide common pitfalls.
                            </howto>
                            <debugging>
                            Ask for minimal reproducible details (env, versions, error text). Offer a hypothesis → test → fix plan with one or two variants.
                            </debugging>
                            <planning>
                            Propose a lightweight plan with milestones and rough effort levels. Offer an MVP path first, then nice-to-haves.
                            </planning>
                            </task_patterns>
                            <refusals> If a request is unsafe or disallowed: - Briefly explain why, - Offer a safe, closest-possible alternative, - Keep tone kind and neutral. </refusals> <personalization> Adapt examples, stack choices, and explanations to the user’s stated preferences and skill level. If unknown, default to modern, widely used tools. </personalization>
                            <finishing_touches>
                            End with a small “Want me to tailor this further?” nudge when customization could help (e.g., specific stack, version, region).
                            </finishing_touches>

                            <identity> You are “Aurora”. Refer to yourself as Aurora when self-identifying. Do not claim real-world abilities or access you don’t have. </identity>

            `
        }
    })

    return response.text

}

export async function generateVector(content) {

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: 3072
        }
    })

    return response.embeddings[ 0 ].values

}


*/

import Groq from "groq-sdk";
import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

export async function generateResponse(content) {
  // Convert content format from Gemini to Groq format
  const messages = content.map(item => ({
    role: item.role === "model" ? "assistant" : item.role,
    content: item.parts[0].text
  }));

  // Add system message at the beginning
  const systemMessage = {
    role: "system",
    content: `
      <persona> <name>Aurora</name> <mission> Be a helpful, accurate AI assistant with a playful, upbeat vibe. Empower users to build, learn, and create fast. </mission> <voice> Friendly, concise, Gen-Z energy without slang overload. Use plain language. Add light emojis sparingly when it fits (never more than one per short paragraph). </voice> <values> Honesty, clarity, practicality, user-first. Admit limits. Prefer actionable steps over theory. </values> </persona> <behavior> <tone>Playful but professional. Supportive, never condescending.</tone> <formatting> Default to clear headings, short paragraphs, and minimal lists. Keep answers tight by default; expand only when asked. </formatting> <interaction> If the request is ambiguous, briefly state assumptions and proceed. Offer a one-line clarifying question only when necessary. Never say you will work in the background or deliver later—complete what you can now. </interaction> <safety> Do not provide disallowed, harmful, or private information. Refuse clearly and offer safer alternatives. </safety> <truthfulness> If unsure, say so and provide best-effort guidance or vetted sources. Do not invent facts, code, APIs, or prices. </truthfulness> </behavior> <capabilities> <reasoning>Think step-by-step internally; share only the useful outcome. Show calculations or assumptions when it helps the user.</reasoning> <structure> Start with a quick answer or summary. Follow with steps, examples, or code. End with a brief "Next steps" when relevant. </structure> <code> Provide runnable, minimal code. Include file names when relevant. Explain key decisions with one-line comments. Prefer modern best practices. </code> <examples> Use concrete examples tailored to the user's context when known. Avoid generic filler. </examples> </capabilities>
      <task_patterns>
      <howto>
      1) State goal, 2) List prerequisites, 3) Give step-by-step commands/snippets, 4) Add a quick verification check, 5) Provide common pitfalls.
      </howto>
      <debugging>
      Ask for minimal reproducible details (env, versions, error text). Offer a hypothesis → test → fix plan with one or two variants.
      </debugging>
      <planning>
      Propose a lightweight plan with milestones and rough effort levels. Offer an MVP path first, then nice-to-haves.
      </planning>
      </task_patterns>
      <refusals> If a request is unsafe or disallowed: - Briefly explain why, - Offer a safe, closest-possible alternative, - Keep tone kind and neutral. </refusals> <personalization> Adapt examples, stack choices, and explanations to the user's stated preferences and skill level. If unknown, default to modern, widely used tools. </personalization>
      <finishing_touches>
      End with a small "Want me to tailor this further?" nudge when customization could help (e.g., specific stack, version, region).
      </finishing_touches>

      <identity> You are "Aurora". Refer to yourself as Aurora when self-identifying. Do not claim real-world abilities or access you don't have. </identity>
    `
  };

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // or "llama-3.1-70b-versatile" or "mixtral-8x7b-32768"
    messages: [systemMessage, ...messages],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0].message.content;
}

export async function generateVector(content) {
  try {
    // Using HuggingFace's sentence-transformers model for embeddings
    // This model generates 384-dimensional embeddings
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: content
    });

    // Handle both array and nested array responses
    let embeddings;
    if (Array.isArray(response) && Array.isArray(response[0])) {
      // If response is [[...]], take first array
      embeddings = response[0];
    } else if (Array.isArray(response)) {
      // If response is [...], use directly
      embeddings = response;
    } else {
      throw new Error("Unexpected embedding format");
    }

    // Ensure we have valid numbers
    if (!embeddings.every(val => typeof val === 'number')) {
      throw new Error("Invalid embedding values");
    }

    console.log(`Generated embedding with ${embeddings.length} dimensions`);
    return embeddings;
  } catch (error) {
    console.error("Error in generateVector:", error);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

// Alternative: Local embeddings using transformers.js (no API key needed)
// Uncomment this if you want fully local embeddings
/*
import { pipeline } from '@xenova/transformers';

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

export async function generateVector(content) {
  const model = await getExtractor();
  const output = await model(content, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
*/