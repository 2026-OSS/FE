/**
 * Book API
 *
 * 그림책 관련 API
 */

import { get, post } from "./client";

const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const BASE_URL = `/api/${API_VERSION}/books`;

// 책 목록 조회
export const getBooks = (params) => get(BASE_URL, { params });

// 책 상세 조회
export const getBook = (bookId) => get(`${BASE_URL}/${bookId}`);

// 책 페이지 조회
export const getBookPages = (bookId) => get(`${BASE_URL}/${bookId}/pages`);

// 페이지 상세 조회 및 AI 설명 조회
export const getPageDescription = (bookId, pageNumber) =>
  get(`${BASE_URL}/${bookId}/pages/${pageNumber}`);

// 책 생성 (관리자용)
export const createBook = (data) => post(BASE_URL, data);
