/**
 * Utility Functions
 *
 * 자주 사용되는 유틸 함수들
 */

// 텍스트 잘라내기
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// URL 파라미터 파싱
export const parseQueryParams = (searchString) => {
  const params = new URLSearchParams(searchString);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// 디바운스 함수
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// 로컬 스토리지 헬퍼
export const localStorage = {
  getItem: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Failed to get item from localStorage:", error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to set item in localStorage:", error);
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove item from localStorage:", error);
    }
  },
};
