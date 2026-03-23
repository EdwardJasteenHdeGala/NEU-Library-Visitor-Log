"use client";

import { useState, useCallback } from "react";

export interface BookMetadata {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverImage: string;
  categories: string[];
  publishedDate: string;
  publisher: string;
  pageCount: number;
}

export function useBooks() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = useCallback(async (query: string): Promise<BookMetadata[]> => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
      );
      
      if (!response.ok) throw new Error("Catalog synchronization failed");
      
      const data = await response.json();
      
      return (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ["Unknown Author"],
        description: item.volumeInfo.description || "No description available.",
        coverImage: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || "",
        categories: item.volumeInfo.categories || [],
        publishedDate: item.volumeInfo.publishedDate || "",
        publisher: item.volumeInfo.publisher || "",
        pageCount: item.volumeInfo.pageCount || 0,
      }));
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookById = useCallback(async (bookId: string): Promise<BookMetadata | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
      if (!response.ok) throw new Error("Metadata retrieval failed");
      
      const item = await response.json();
      
      return {
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ["Unknown Author"],
        description: item.volumeInfo.description || "No description available.",
        coverImage: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || "",
        categories: item.volumeInfo.categories || [],
        publishedDate: item.volumeInfo.publishedDate || "",
        publisher: item.volumeInfo.publisher || "",
        pageCount: item.volumeInfo.pageCount || 0,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchBooks,
    getBookById,
    isLoading,
    error,
  };
}
