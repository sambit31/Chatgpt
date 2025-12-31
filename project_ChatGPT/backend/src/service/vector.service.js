// Import the Pinecone library
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const cohortChatGptIndex = pc.Index('chatgpt');

export async function createMemory({ vectors, metadata, messageId }) {
    await cohortChatGptIndex.upsert([ {
        id: messageId,
        values: vectors,
        metadata
    } ])
}


export async function queryMemory({ queryVector, limit = 5, metadata }) {

    const data = await cohortChatGptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches

}

