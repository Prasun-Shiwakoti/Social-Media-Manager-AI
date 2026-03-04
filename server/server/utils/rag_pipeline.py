
from django.conf import settings

from typing import List

import chromadb
import numpy as np
from ollama import Client

from huggingface_hub import InferenceClient
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .utility_functions import (
    check_embedding_exist,
    hash_text,
    logger,
)


class BusinessRAGPipeline:
    def __init__(self, verbose: bool = False):
        self.remote_client = Client(settings.MODEL_ENDPOINT)
        self.generation_client = InferenceClient(api_key=settings.HF_KEY)
        
        self.db = chromadb.PersistentClient(path=settings.BASE_CHROMA_PATH)

        self.embedding_model_name = settings.EMBEDDING_MODEL
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP

        self.llm_model_name = settings.LLM_MODEL
        self.max_tokens = settings.MAX_TOKENS
        self.temperature = settings.TEMPERATURE
        self.system_instruction = settings.LLM_INSTRUCTION
        
        self.verbose = verbose
        logger.info("BusinessRAGPipeline initialized")
    
    def ingest_business(self, business_id: str, text: str = None, force_recreate: bool = False,) -> None:
        """
        Ingests a single business knowledge base into its own Chroma collection.
        Each business is logically isolated for multi-tenant RAG.
        
        Args:
            business_id: Unique identifier for the business
            force_recreate: If True, delete existing collection and recreate. If False, append/update.
        """
        try:
            if text is not None:
                text = text.strip()

            # Chunking (token-aware, recursive)
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
                separators=["\n\n", "\n", "."]
            )

            chunks: List[str] = splitter.split_text(text)

            if force_recreate:
                if any(c.name == business_id for c in self.db.list_collections()):
                    self.db.delete_collection(name=business_id)

            collection = self.db.get_or_create_collection(name=business_id)

            for k, sentence in enumerate(chunks):
                # cleaning sentence
                sentence = sentence.strip()
                if sentence[0] == '.':
                    sentence = sentence[1:].strip()

                logger.info(f"Processing sentence {k+1}/{len(chunks)} for business '{business_id}'")
                if self.verbose:
                    print(f"\t\tProcessing sentence {k+1}/{len(chunks)}: {sentence}")
                
                if not check_embedding_exist(collection, sentence):
                    response = self.remote_client.embed(model=self.embedding_model_name, input=f"search_document: {sentence}")
                    embedding = response["embeddings"][0]

                    collection.add(
                        ids=[hash_text(sentence)],
                        embeddings=[embedding],
                        documents=[sentence],
                        metadatas=[{"source": f"{business_id}_chunk_{k}"}],
                    )
                else:
                    logger.info(f"Skipping existing sentence for business '{business_id}': {sentence[:30]}...")
                    if self.verbose:
                        print(f"\t\t\tSkipping existing sentence: {sentence[:30]}...")
            
            logger.info(f"Finished ingesting business '{business_id}' with {len(chunks)} chunks.")
            if self.verbose:
                print(f"\tFinished ingesting business '{business_id}' with {len(chunks)} chunks.")

        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
            raise
        except Exception as e:
            logger.error(f"Error ingesting business '{business_id}': {e}")
            raise

    def retrieve(self, business_id: str, query: str) -> List[Document]:
        try:
            collection = self.db.get_collection(name=business_id)
            response = self.remote_client.embed(model=self.embedding_model_name, input=f"search_query: {query}")
            query_embedding = response["embeddings"][0]

            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=settings.TOP_K,
                include=["documents", "metadatas", "embeddings"]
            )

            retrieved_docs = []
            for doc, meta, emb in zip(results["documents"][0], results["metadatas"][0], results["embeddings"][0]):
                
                distance = np.linalg.norm(np.array(query_embedding) - np.array(emb))
                
                if distance < settings.DISTANCE_THRESHOLD:
                    retrieved_docs.append(Document(page_content=doc, metadata=meta))
                    
                    logger.info(f"Retrieved doc within threshold (distance={distance:.2f}): {doc}...")
                    if self.verbose:
                        print(f"\tRetrieved doc within threshold (distance={distance:.2f}): {doc}...")
                
                else:
                    logger.info(f"Skipped doc (distance={distance:.2f}): {doc}")
                    if self.verbose:
                        print(f"\tSkipped doc (distance={distance:.2f}): {doc}")

            return retrieved_docs

        except Exception as e:
            logger.error(f"Error retrieving documents for business '{business_id}': {e}")
            return []
        
    def generate_answer(self, query: str, context_docs: List[Document]) -> str:
        try:
            context = f"\n{'='*50}\n".join([doc.page_content for doc in context_docs])

            messages = [
                {"role": "system", "content": self.system_instruction},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"}
            ]
            response = self.generation_client.chat.completions.create(
                model=self.llm_model_name,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            answer = response.choices[0].message['content'].strip()
            logger.info(f"Generated answer: {answer[:30]}...")
            if self.verbose:
                print(f"\tGenerated answer: answer: {answer}...")
            return answer

        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return settings.FALLBACK_MESSAGE
        
    def answer(self, business_id: str, query: str) -> str:
        try:
            retrieved_docs = self.retrieve(business_id, query)
            if not retrieved_docs:
                logger.info("No relevant documents found. Returning fallback message.")
                return settings.FALLBACK_MESSAGE
            
            return self.generate_answer(query, retrieved_docs)

        except Exception as e:
            logger.error(f"Error in answer pipeline: {e}")
            return settings.FALLBACK_MESSAGE


rag_pipeline = BusinessRAGPipeline(verbose=False)