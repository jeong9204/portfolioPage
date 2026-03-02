import { useEffect, useRef, useState } from "react";
import CoverHero from "../components/hero/CoverHero";
import SiteHeader from "../components/layout/SiteHeader";
import media01 from "../assets/images/KakaoTalk_Photo_2026-02-28-00-28-05.png";
import media02 from "../assets/images/KakaoTalk_Photo_2026-02-28-00-28-12.png";
import media03 from "../assets/images/KakaoTalk_Photo_2026-02-28-00-28-19.png";
import media04 from "../assets/images/KakaoTalk_Photo_2026-02-28-00-28-26.png";
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

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  type: "image" | "video";
  src: string;
  poster?: string;
};

const PORTFOLIO_ITEMS = [
  {
    id: "media-01",
    title: "Project Image",
    description: "이미지 기반 인터랙션 작업 예시",
    type: "image",
    src: media01,
  },
  {
    id: "media-02",
    title: "Project Image",
    description: "에디터 화면 UI 개선 작업",
    type: "image",
    src: media02,
  },
  {
    id: "media-03",
    title: "Project Image",
    description: "Canvas 편집 흐름 구축",
    type: "image",
    src: media03,
  },
  {
    id: "media-04",
    title: "Project Image",
    description: "다크/라이트 대응 UI",
    type: "image",
    src: media04,
  },
  {
    id: "media-05",
    title: "Project Video",
    description: "샘플 동영상 재생 테스트",
    type: "video",
    // 데모용 외부 샘플 영상. 추후 실제 파일로 교체 가능.
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    poster: media02,
  },
] as const satisfies readonly PortfolioItem[];

export default function HomePage() {
  // 섹션 전환 상태: 0=Hero, 1=Experience, 2=Portfolio.
  const [sectionIndex, setSectionIndex] = useState(0);
  // 다크 여부를 boolean 상태로 유지해 스타일 토큰 분기와 직접 연결한다.
  const [isDark, setIsDark] = useState(getInitialTheme);

  // ref는 렌더를 유발하지 않는 값 저장소이므로,
  // 휠 이벤트 누적/락 제어처럼 고빈도 값에 적합하다.
  const wheelLockRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const mainRef = useRef<HTMLElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchScrollHostRef = useRef<HTMLElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<PortfolioItem | null>(null);

  const moveToNext = () => {
    setSectionIndex((prev) => Math.min(prev + 1, 2));
  };

  const moveToPrev = () => {
    setSectionIndex((prev) => Math.max(prev - 1, 0));
  };

  // 이벤트 타겟에서 가장 가까운 "내부 스크롤 허용" 컨테이너를 찾는다.
  const findScrollableHost = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null;
    return target.closest('[data-scrollable="true"]') as HTMLElement | null;
  };

  // 방향(deltaY) 기준으로 내부 컨테이너가 아직 더 스크롤 가능한지 확인한다.
  const canScrollInside = (el: HTMLElement, deltaY: number) => {
    if (deltaY > 0) return el.scrollTop + el.clientHeight < el.scrollHeight;
    if (deltaY < 0) return el.scrollTop > 0;
    return false;
  };

  // native WheelEvent를 직접 사용해 휠 입력을 섹션 전환 로직으로 변환한다.
  const handleWheel = (event: globalThis.WheelEvent) => {
    // 모달이 열려 있을 땐 배경 섹션 전환을 잠시 막는다.
    if (selectedMedia) return;
    // 내부 스크롤 영역에서 아직 스크롤 여지가 있으면 섹션 전환보다 내부 스크롤을 우선한다.
    const scrollHost = findScrollableHost(event.target);
    if (scrollHost && canScrollInside(scrollHost, event.deltaY)) return;

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

  const handleTouchStart = (event: globalThis.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartYRef.current = touch.clientY;
    touchScrollHostRef.current = findScrollableHost(event.target);
  };

  const handleTouchEnd = (event: globalThis.TouchEvent) => {
    if (selectedMedia) return;
    const startY = touchStartYRef.current;
    const touch = event.changedTouches[0];
    touchStartYRef.current = null;
    if (startY === null || !touch) return;

    const deltaY = touch.clientY - startY;
    if (Math.abs(deltaY) < 50) return;

    // 손가락이 위로 이동(deltaY < 0)하면 콘텐츠는 아래로 이동(다음 섹션) 의도로 해석한다.
    const intendedScrollDelta = deltaY < 0 ? 1 : -1;
    const scrollHost = touchScrollHostRef.current;
    touchScrollHostRef.current = null;
    if (scrollHost && canScrollInside(scrollHost, intendedScrollDelta)) return;

    if (deltaY < 0) moveToNext();
    if (deltaY > 0) moveToPrev();
  };

  const handleMediaTouchStart = (mediaId: string) => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }
    // 모바일에서는 길게 누를 때만 자동 슬라이드가 시작되도록 한다.
    longPressTimerRef.current = window.setTimeout(() => {
      setActiveMediaId(mediaId);
    }, 280);
  };

  const handleMediaTouchEnd = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setActiveMediaId(null);
  };

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    // 모달이 열려 있을 때는 배경 섹션 전환 리스너를 잠시 꺼서
    // 이미지/영상 팝업 내부 스크롤과 충돌하지 않게 한다.
    if (selectedMedia) return;

    // React synthetic wheel 이벤트는 브라우저 환경에 따라 passive로 처리될 수 있어
    // preventDefault() 호출 시 경고가 발생한다.
    // native addEventListener + { passive: false }로 등록하면 기본 스크롤 차단이 안정적으로 동작한다.
    el.addEventListener("wheel", handleWheel, { passive: false });
    // 모바일 스와이프 제스처로 섹션 이동을 지원한다.
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [selectedMedia]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMedia(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 현재 테마를 문서 루트와 localStorage에 동기화한다.
  // 헤더 버튼 클릭 시 전체 페이지 색상 토큰이 즉시 바뀐다.
  useEffect(() => {
    const nextTheme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  }, [isDark]);

  return (
    <main ref={mainRef} className={styles.main}>
      <SiteHeader
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        // 로고 클릭 시 항상 Hero 섹션으로 복귀한다.
        onLogoClick={() => setSectionIndex(0)}
      />
      <div
        className={styles.track}
        style={{ transform: `translateY(-${sectionIndex * 100}svh)` }}
      >
        <CoverHero
          className={styles.section}
          onScrollDown={moveToNext}
          isDark={isDark}
        />

        <section
          id="home-next-section"
          className={`${styles.section} ${styles.nextSection}`}
        >
          <div className={styles.nextInner} data-scrollable="true">
            <p className={styles.kicker}>Experience</p>
            <ul className={styles.experienceList}>
              <li>
                <div className={styles.box}>
                  <div className={styles.name}>(주)조아라</div>
                  <div className={styles.title}>
                    <div className={styles.year}>
                      2022.11 - 2026.01 (3년 3개월)
                    </div>
                    <span>Frontend Developer</span>
                  </div>
                  <p className={styles.dot}>
                    - 리뉴얼 과정에서 UI 구조 변경으로 인한 재작업을 줄이기
                    위해, 초기 단계에서 React 기반 UI 컴포넌트 구조를 설계하고
                    <br />
                    퍼블리싱·반응형·다크모드 대응을 선행 구축하여 확장성과
                    유지보수가 용이한 UI 구조를 마련했습니다.
                  </p>
                  <p className={styles.dot}>
                    - 기존 단순 이미지 업로드 방식의 표현 한계를 개선하기 위해,
                    Fabric.js와 react-image-crop을 활용한 작품 표지 제작
                    페이지를 개발하고
                    <br />
                    이미지 편집·텍스트 추가 등 사용자 주도의 편집 인터랙션을
                    구현했습니다.
                  </p>
                  <p className={styles.dot}>
                    - 반복 사용되는 아이콘으로 인한 CDN 비용 증가 문제를
                    해결하기 위해 아이콘 리소스를 스프라이트 이미지로 통합하고
                    CSS background-image 방식으로 적용하여,
                    <br />
                    CloudFront 및 cf-image 평균 비용을 50% 이상 절감했습니다.
                  </p>
                  <p className={styles.dot}>
                    - Google·Facebook 소셜 로그인을 OAuth 기반으로 연동하고,
                    웹·앱 환경을 고려한 인증 플로우 및 앱 브릿지를 포함해 계정
                    연결·해제 전반의 인증 라이프사이클을 관리했습니다.
                  </p>
                </div>
              </li>
              <li>
                <div className={styles.box}>
                  <div className={styles.name}>주식회사쓰리애니아이앤시</div>
                  <div className={styles.title}>
                    <div className={styles.year}>2019.05 - 2022.04 (3년)</div>
                    <span>Web Publisher</span>
                  </div>
                  <p>
                    웹·모바일 환경에서 적응형·반응형 UI 퍼블리싱을 수행하며,
                    다양한 디바이스 해상도와 브라우저 대응 경험을 쌓았습니다.
                  </p>
                </div>
              </li>
              <li>
                <div className={styles.box}>
                  <div className={styles.name}>주식회사쓰리애니아이앤시</div>
                  <div className={styles.title}>
                    <div className={styles.year}>
                      2014.11 - 2019.03 (4년 5개월)
                    </div>
                    <span>Web Publisher</span>
                  </div>
                  <p>
                    웹·모바일 UI 퍼블리싱 전반을 담당하며 실무 경험을
                    축적했습니다.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.portfolioSection}`}>
          <div className={styles.nextInner} data-scrollable="true">
            <p className={styles.kicker}>Portfolio</p>
            <div className={styles.mediaGrid}>
              {PORTFOLIO_ITEMS.map((item) => (
                <article
                  key={item.id}
                  className={`${styles.mediaCard} ${activeMediaId === item.id ? styles.mediaActive : ""}`}
                  onClick={() => setSelectedMedia(item)}
                  onTouchStart={() => handleMediaTouchStart(item.id)}
                  onTouchEnd={handleMediaTouchEnd}
                  onTouchCancel={handleMediaTouchEnd}
                >
                  <div className={styles.mediaViewport}>
                    <img
                      // 비디오 카드는 영상 src 대신 poster를 미리보기로 사용해야 썸네일이 정상 노출된다.
                      src={item.type === "video" ? (item.poster ?? item.src) : item.src}
                      alt={item.title}
                      className={styles.mediaImage}
                    />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {selectedMedia && (
        <div className={styles.mediaModal} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.modalBackdrop}
            aria-label="팝업 닫기"
            onClick={() => setSelectedMedia(null)}
          />
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setSelectedMedia(null)}
              aria-label="닫기"
            >
              ×
            </button>

            {selectedMedia.type === "video" ? (
              <video
                className={styles.modalMedia}
                src={selectedMedia.src}
                poster={selectedMedia.poster}
                controls
                // 비디오 모달 오픈 즉시 재생되도록 자동 재생을 켠다.
                autoPlay
                playsInline
                // 모달 내부 휠이 배경 섹션 전환으로 전달되지 않게 전파를 막는다.
                onWheel={(event) => event.stopPropagation()}
              />
            ) : (
              <div
                className={styles.modalImageScroll}
                // 모달 내부 스크롤을 우선 처리하고, 상위 섹션 전환으로 이벤트가 새지 않게 막는다.
                onWheel={(event) => event.stopPropagation()}
                onTouchMove={(event) => event.stopPropagation()}
              >
                <img
                  className={styles.modalImage}
                  src={selectedMedia.src}
                  alt={selectedMedia.title}
                />
              </div>
            )}

            <div className={styles.modalInfo}>
              <h3>{selectedMedia.title}</h3>
              <p>{selectedMedia.description}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
