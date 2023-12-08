import { openai } from './openai.js';
import { Document } from 'langchain/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube';

const question = process.argv[2] || 'What is the meaning of life?';
const video = `https://www.youtube.com/watch?v=J8TgKxomS2g`;

const createStore = async (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

const docsFromYoutube = async (video) => {
  const loader = YoutubeLoader.createFromUrl(video, {
    language: 'en',
    addVideoInfo: true,
  });
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 2000,
      chunkOverlap: 100,
    })
  );
};

const docsFromPDF = async (path = 'xbox.pdf') => {
  const loader = new PDFLoader(path, {
    language: 'en',
    addPageInfo: true,
  });
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: '. ',
      chunkSize: 2000,
      chunkOverlap: 150,
    })
  );
};

const loadStore = async () => {
  const videoDocs = await docsFromYoutube(video);
  const pdfDocs = await docsFromPDF();
  //   console.log(videoDocs[0], pdfDocs[0]);
  return createStore([...videoDocs, ...pdfDocs]);
};

const query = async () => {
  const store = await loadStore();
  const results = await store.similaritySearch(question, 2);
  //   console.log(results);
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    message: [
      {
        role: 'assistant',
        content:
          'You are a helpful AI assistant. Answser questions to your best ability.',
      },
      {
        role: 'user',
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
        Question: ${question}
  
        Context: ${results.map((r) => r.pageContent).join('\n')}`,
      },
    ],
  });
  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${results
      .map((r) => r.metadata.source)
      .join(', ')}`
  );
};

query();
