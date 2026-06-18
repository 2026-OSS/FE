/**
 * Vision API
 *
 * 실시간 독서 화면의 객체 탐지 및 손끝 추적 상태를 조회한다.
 */

import { get } from "./client";

const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const DEFAULT_READING_STATUS_URL = `/api/${API_VERSION}/reading/status`;

export const getReadingStatus = () =>
  get(import.meta.env.VITE_READING_STATUS_ENDPOINT || DEFAULT_READING_STATUS_URL);
