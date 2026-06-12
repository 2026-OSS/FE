/**
 * Audio API
 *
 * 음성 안내 관련 API
 */

import { get, post } from "./client";

const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const BASE_URL = `/api/${API_VERSION}/audio`;

// 음성 생성 (텍스트 → 음성)
export const generateAudio = (text, voiceConfig = {}) =>
  post(`${BASE_URL}/generate`, { text, ...voiceConfig });

// 미리 생성된 음성 조회
export const getAudio = (audioId) => get(`${BASE_URL}/${audioId}`);

// 음성 설정 조회
export const getVoiceSettings = () => get(`${BASE_URL}/settings`);
