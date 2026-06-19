/**
 * useAudio Hook
 *
 * 음성 재생 관련 로직을 담당하는 커스텀 훅
 */

import { useState, useCallback } from "react";

function useAudio(_audioUrl) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(0);

  const play = useCallback(() => {
    setIsPlaying(true);
    // TODO: 음성 재생 로직 구현
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    // TODO: 음성 일시정지 로직 구현
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    // TODO: 음성 정지 로직 구현
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    stop,
  };
}

export default useAudio;
