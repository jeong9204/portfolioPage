import { useEffect, useRef, useState, type WheelEvent } from "react";
import CoverHero from "../components/hero/CoverHero";
import SiteHeader from "../components/layout/SiteHeader";
import styles from "./HomePage.module.scss";

// 초기 테마 판별 유틸.
// 반환 타입을 boolean(다크 여부)로 단순화해 컴포넌트 상태와 1:1로 맞춘다.
const getInitialTheme = () => {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  // 저장값이 없을 때는 시스템 설정과 무관하게 라이트를 기본값으로 사용한다.
  return false;
};

export default function HomePage() {
  // 섹션 전환 상태: true면 About, false면 Hero.
  const [showAbout, setShowAbout] = useState(false);
  // 다크 여부를 boolean 상태로 유지해 스타일 토큰 분기와 직접 연결한다.
  const [isDark, setIsDark] = useState(getInitialTheme);

  // ref는 렌더를 유발하지 않는 값 저장소이므로,
  // 휠 이벤트 누적/락 제어처럼 고빈도 값에 적합하다.
  const wheelLockRef = useRef(false);
  const wheelAccumRef = useRef(0);

  const moveToNext = () => {
    if (!showAbout) setShowAbout(true);
  };

  const moveToPrev = () => {
    if (showAbout) setShowAbout(false);
  };

  // WheelEvent<HTMLElement>를 명시하면 deltaY/pointer 관련 프로퍼티 타입이 정확해진다.
  const handleWheelCapture = (event: WheelEvent<HTMLElement>) => {
    event.preventDefault();

    if (wheelLockRef.current) return;

    wheelAccumRef.current += event.deltaY;
    if (Math.abs(wheelAccumRef.current) < 56) return;

    if (wheelAccumRef.current > 0) moveToNext();
    if (wheelAccumRef.current < 0) moveToPrev();

    wheelAccumRef.current = 0;
    wheelLockRef.current = true;
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 650);
  };

  // 현재 테마를 문서 루트와 localStorage에 동기화한다.
  // 헤더 버튼 클릭 시 전체 페이지 색상 토큰이 즉시 바뀐다.
  useEffect(() => {
    const nextTheme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  }, [isDark]);

  return (
    <main className={styles.main} onWheelCapture={handleWheelCapture}>
      <SiteHeader
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        // 로고 클릭 시 항상 메인(Hero) 상태로 복귀한다.
        onLogoClick={moveToPrev}
      />
      <div className={`${styles.track} ${showAbout ? styles.showAbout : ""}`}>
        <CoverHero className={styles.section} onScrollDown={moveToNext} isDark={isDark} />

        <section id="home-next-section" className={`${styles.section} ${styles.nextSection}`}>
          <div className={styles.nextInner}>
            <p className={styles.kicker}>About</p>
            <h2>About Section</h2>
            <p>헤더 로고 클릭으로 언제든 Hero 섹션으로 돌아갈 수 있습니다.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
