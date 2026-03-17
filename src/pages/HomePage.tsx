import { useCallback, useEffect, useRef, useState } from "react";
import CoverHero from "../components/hero/CoverHero";
import SiteFooter from "../components/layout/SiteFooter";
import SiteHeader from "../components/layout/SiteHeader";
import loginimg from "../assets/portfolio-images/loginpage.png";
import writerimg from "../assets/portfolio-images/writerpage.png";
import mainimg from "../assets/portfolio-images/mainpage.png";
import publishingimg1 from "../assets/portfolio-images/publishingpage1.png";
import publishingimg2 from "../assets/portfolio-images/publishingpage2.png";
import writervideo from "../assets/videos/writerpagevideo.mp4";
import mainvideo from "../assets/videos/mainpagevideo.mp4";
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
  // 포트폴리오 상세 이동 링크가 있을 때만 모달 하단에 버튼을 노출한다.
  link?: string;
  linkLabel?: string;
};

const SECTION_HASHES = ["#main", "#experience", "#portfolio"] as const;

const getSectionIndexFromHash = (hash: string) => {
  const normalized = hash.toLowerCase();
  const index = SECTION_HASHES.findIndex((item) => item === normalized);
  return index >= 0 ? index : 0;
};

const getPortfolioItemById = (id: string | null) =>
  id ? (PORTFOLIO_ITEMS.find((item) => item.id === id) ?? null) : null;

const PORTFOLIO_ITEMS = [
  {
    id: "Project-01",
    title: "Google·Facebook 소셜 로그인",
    description:
      "Google·Facebook 소셜 로그인을 OAuth 기반으로 연동하고, 웹·앱 환경을 고려한 인증 플로우 및 앱 브릿지를 포함해 계정 연결·해제 전반의 인증 라이프사이클을 관리했습니다.",
    type: "image",
    src: loginimg,
    // 실제 배포 링크가 생기면 URL만 교체하면 된다.
    link: "https://www.joara.com/auth/login?return_url=%2Fmain%2Frecommend",
    linkLabel: "로그인페이지 보기",
  },
  {
    id: "Project-02",
    title: "작품 표지관리",
    description:
      "기존 단순 이미지 업로드 방식의 표현 한계를 개선하기 위해, Fabric.js와 react-image-crop을 활용한 작품 표지 제작 페이지를 개발하고 이미지 편집·텍스트 추가 등 사용자 주도의 편집 인터랙션을 구현했습니다.",
    type: "video",
    src: writervideo,
    poster: writerimg,
    link: "https://www.joara.com/latestbooks?store=series&orderby=redate",
    linkLabel: "사용중인 표지 리스트 보기",
  },
  {
    id: "Project-03",
    title: "메인화면 리뉴얼",
    description:
      "리뉴얼 과정에서 UI 구조 변경으로 인한 재작업을 줄이기 위해, 초기 단계에서 React 기반 UI 컴포넌트 구조를 설계하고 퍼블리싱·반응형·다크모드 대응을 선행 구축하여 확장성과 유지보수가 용이한 UI 구조를 마련했습니다.",
    type: "video",
    src: mainvideo,
    poster: mainimg,
    link: "https://www.joara.com/",
    linkLabel: "홈페이지 보기",
  },
  {
    id: "Project-04",
    title: "퍼블리싱 홈페이지1",
    description: "한양대학교 발달의학센터",
    type: "image",
    src: publishingimg1,
    link: "http://dmc.hyumc.com/index.php",
    linkLabel: "홈페이지 보기",
  },
  {
    id: "Project-05",
    title: "퍼블리싱 홈페이지2",
    description: "(주)유성소프트",
    type: "image",
    src: publishingimg2,
    link: "https://ussoft.co.kr/index.php",
    linkLabel: "홈페이지 보기",
  },
] as const satisfies readonly PortfolioItem[];

export default function HomePage() {
  // 섹션 전환 상태: 0=Main, 1=Experience, 2=Portfolio.
  const [sectionIndex, setSectionIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    // media 쿼리로 직접 접근하면 포트폴리오 섹션부터 보여준다.
    const mediaFromQuery = new URLSearchParams(window.location.search).get(
      "media",
    );
    if (getPortfolioItemById(mediaFromQuery)) return 2;
    // 새로고침 시 URL 해시를 읽어 해당 섹션에서 시작한다.
    return getSectionIndexFromHash(window.location.hash);
  });
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
  const [selectedMedia, setSelectedMedia] = useState<PortfolioItem | null>(
    () => {
      if (typeof window === "undefined") return null;
      // URL에 media 쿼리가 있으면 해당 포트폴리오 모달을 초기 오픈한다.
      const mediaFromQuery = new URLSearchParams(window.location.search).get(
        "media",
      );
      return getPortfolioItemById(mediaFromQuery);
    },
  );

  const moveToNext = useCallback(() => {
    setSectionIndex((prev) => Math.min(prev + 1, 2));
  }, []);

  const moveToPrev = useCallback(() => {
    setSectionIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // 이벤트 타겟에서 가장 가까운 "내부 스크롤 허용" 컨테이너를 찾는다.
  const findScrollableHost = useCallback((target: EventTarget | null) => {
    if (!(target instanceof Element)) return null;
    return target.closest('[data-scrollable="true"]') as HTMLElement | null;
  }, []);

  // 방향(deltaY) 기준으로 내부 컨테이너가 아직 더 스크롤 가능한지 확인한다.
  const canScrollInside = useCallback((el: HTMLElement, deltaY: number) => {
    if (deltaY > 0) return el.scrollTop + el.clientHeight < el.scrollHeight;
    if (deltaY < 0) return el.scrollTop > 0;
    return false;
  }, []);

  // native WheelEvent를 직접 사용해 휠 입력을 섹션 전환 로직으로 변환한다.
  const handleWheel = useCallback(
    (event: globalThis.WheelEvent) => {
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
    },
    [
      selectedMedia,
      findScrollableHost,
      canScrollInside,
      moveToNext,
      moveToPrev,
    ],
  );

  const handleTouchStart = useCallback(
    (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartYRef.current = touch.clientY;
      touchScrollHostRef.current = findScrollableHost(event.target);
    },
    [findScrollableHost],
  );

  const handleTouchEnd = useCallback(
    (event: globalThis.TouchEvent) => {
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
      if (scrollHost && canScrollInside(scrollHost, intendedScrollDelta))
        return;

      if (deltaY < 0) moveToNext();
      if (deltaY > 0) moveToPrev();
    },
    [selectedMedia, canScrollInside, moveToNext, moveToPrev],
  );

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
  }, [selectedMedia, handleWheel, handleTouchStart, handleTouchEnd]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMedia(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      // 주소창 해시(뒤로가기/직접 입력 포함)가 바뀌면 섹션 인덱스를 동기화한다.
      setSectionIndex(getSectionIndexFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const nextHash = SECTION_HASHES[sectionIndex] ?? SECTION_HASHES[0];
    if (window.location.hash === nextHash) return;
    // 섹션 이동마다 history를 과도하게 쌓지 않도록 replaceState를 사용한다.
    window.history.replaceState(null, "", nextHash);
  }, [sectionIndex]);

  useEffect(() => {
    const url = new URL(window.location.href);
    // 모달 오픈 상태를 URL 쿼리(media)로 동기화해 직접 링크 공유가 가능하게 만든다.
    if (selectedMedia) {
      url.searchParams.set("media", selectedMedia.id);
    } else {
      url.searchParams.delete("media");
    }
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [selectedMedia]);

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
        // 로고 클릭 시 항상 Main 섹션으로 복귀한다.
        onLogoClick={() => setSectionIndex(0)}
      />
      <SiteFooter />
      <div
        className={styles.track}
        style={{ transform: `translateY(-${sectionIndex * 100}svh)` }}
      >
        <CoverHero
          className={styles.section}
          onScrollDown={moveToNext}
          isDark={isDark}
          isActive={sectionIndex === 0}
        />

        <section
          id="home-next-section"
          className={`${styles.section} ${styles.sectionOffset} ${styles.nextSection}`}
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
                    - Google·Facebook 소셜 로그인을 OAuth 기반으로 연동하고,
                    웹·앱 환경을 고려한 인증 플로우 및 앱 브릿지를 포함해 계정
                    연결·해제 전반의 인증 라이프사이클을 관리했습니다.
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
                    - 리뉴얼 과정에서 UI 구조 변경으로 인한 재작업을 줄이기
                    위해, 초기 단계에서 React 기반 UI 컴포넌트 구조를 설계하고
                    <br />
                    퍼블리싱·반응형·다크모드 대응을 선행 구축하여 확장성과
                    유지보수가 용이한 UI 구조를 마련했습니다.
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
                  <div className={styles.title}>
                    <div className={styles.year}>
                      2014.11 - 2019.03 (4년 5개월)
                    </div>
                    <span>Web Publisher</span>
                  </div>
                  <p className={styles.dot}>
                    - 웹·모바일 환경에서 적응형·반응형 UI 퍼블리싱을 수행하고
                    크로스브라우징 대응을 진행했습니다.
                  </p>
                  <p className={styles.dot}>
                    - 유지보수 업무를 통해 기존 코드를 분석하고 기능 수정 및
                    개선을 수행했습니다.
                  </p>
                  <p className={styles.dot}>
                    - 고객과의 직접 커뮤니케이션을 통해 요구사항을 구조화하고
                    기능을 정의했습니다.
                  </p>
                  <p className={styles.dot}>
                    - 디자이너 경험을 기반으로 UI 수정 사항을 시각적·구조적으로
                    반영했습니다.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.sectionOffset} ${styles.portfolioSection}`}
        >
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
                      src={
                        item.type === "video"
                          ? (item.poster ?? item.src)
                          : item.src
                      }
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
                // 자동 재생 정책 대응을 위해 초기 음소거 상태로 재생한다.
                muted
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
              {selectedMedia.link && (
                <a
                  className={styles.modalLinkButton}
                  href={selectedMedia.link}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {selectedMedia.linkLabel ?? "링크 이동"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
