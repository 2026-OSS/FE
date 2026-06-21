/**
 * Vision API
 *
 * 실시간 독서 화면의 객체 탐지 및 손끝 추적 상태를 조회한다.
 */

import { get, post } from "./client";

const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const DEFAULT_READING_STATUS_URL = `/api/${API_VERSION}/reading/status`;
const DEFAULT_INTERACTION_DETECT_URL = "/api/interaction/detect";

export const getReadingStatus = () =>
  get(import.meta.env.VITE_READING_STATUS_ENDPOINT || DEFAULT_READING_STATUS_URL);

export const detectInteraction = ({ frame, voiceType = "child", page, pageNumber }) => {
  const formData = new FormData();
  formData.append("frame", frame, "frame.jpg");
  formData.append("voiceType", voiceType);

  if (page) {
    formData.append("page", page);
  }

  if (pageNumber !== undefined && pageNumber !== null) {
    formData.append("pageNumber", pageNumber);
  }

  return post(
    import.meta.env.VITE_INTERACTION_DETECT_ENDPOINT || DEFAULT_INTERACTION_DETECT_URL,
    formData,
  );
};
