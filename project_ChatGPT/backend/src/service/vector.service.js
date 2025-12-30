import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});
const index = pc.index('chatgpt');


export async function createMemoryVector({ vector, metadata, messageId }) {
    await index.upsert([{
        id: messageId,
        values: vector,
        metadata
    } ])
}

export async function queryMemoryVector({ queryVector, limit = 5, metadata }) {
  const data = await index.query({
    vector: queryVector,
    topK: limit,
    includeMetadata: true,
    filter: metadata ? {
      userId: { "$eq": metadata.userId },
      chatId: { "$eq": metadata.chatId }
    } : undefined
  });

  return data.matches || [];
}
