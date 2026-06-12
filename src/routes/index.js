/**
 * Route Configuration
 *
 * 앱의 라우팅 설정
 */

import HomePage from "../pages/HomePage";
import GuidePage from "../pages/GuidePage";
import ReadingPage from "../pages/ReadingPage";

export const routes = [
  {
    path: "/",
    component: HomePage,
    label: "홈",
  },
  {
    path: "/guide",
    component: GuidePage,
    label: "가이드",
  },
  {
    path: "/reading",
    component: ReadingPage,
    label: "독서",
  },
];
