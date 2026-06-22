/**
 * Constants
 *
 * 앱 전역 상수
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || "2026 OSS FE";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "0.1.0";

// 음성 설정
export const VOICE_SPEEDS = {
  SLOW: 0.8,
  NORMAL: 1.0,
  FAST: 1.2,
};

// 페이지 크기
export const PAGE_SIZES = {
  MOBILE: "mobile",
  TABLET: "tablet",
  DESKTOP: "desktop",
};

// 그림책 상태
export const BOOK_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};
