import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { fabric } from "fabric";
import type { Canvas, Image as FabricImage } from "fabric/fabric-impl";
import heroImage1 from "../../assets/hero-images/KakaoTalk_Photo_2026-02-28-00-28-05.png";
import heroImage2 from "../../assets/hero-images/KakaoTalk_Photo_2026-02-28-00-28-12.png";
import heroImage3 from "../../assets/hero-images/KakaoTalk_Photo_2026-02-28-00-28-19.png";
import heroImage4 from "../../assets/hero-images/KakaoTalk_Photo_2026-02-28-00-28-26.png";
import algoimg from "../../assets/portfolio-images/algoimg.png";
import aiChatbotImg from "../../assets/portfolio-images/ai-chatbot.png";
import loginimg from "../../assets/portfolio-images/loginpage.png";
import mainimg from "../../assets/portfolio-images/mainpage.png";
import publishingimg1 from "../../assets/portfolio-images/publishingpage1.png";
import publishingimg2 from "../../assets/portfolio-images/publishingpage2.png";
import studyPageImg from "../../assets/portfolio-images/study-page.png";
import writerimg from "../../assets/portfolio-images/writerpage.png";
import mainvideo from "../../assets/videos/mainpagevideo.mp4";
import writervideo from "../../assets/videos/writerpagevideo.mp4";
import styles from "./HomePageV2.module.scss";

type ExperienceHighlight = {
  title: string;
  problem: string;
  solutions: string[];
  results: string[];
};

type ExperienceItem = {
  id: string;
  company: string;
  roles: {
    period: string;
    title: string;
  }[];
  overview?: string;
  highlights?: ExperienceHighlight[];
  works?: string[];
  skills?: string[];
};

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  type: "image" | "video";
  src?: string;
  poster?: string;
  link?: string;
  linkLabel?: string;
};

const STICKER_IMAGES = [heroImage1, heroImage2, heroImage3, heroImage4];

const NATURE_BACKGROUNDS = {
  hero:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
  experience:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80",
  portfolio:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
} as const;

const CONTACT_LINKS = {
  email: "mailto:jeong9204@gmail.com",
  github: "https://github.com/jeong9204",
  linkedin: "https://www.linkedin.com/in/jeong9204",
} as const;

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const SECTION_HASHES = ["#main", "#experience", "#portfolio"] as const;

const getSectionIndexFromHash = (hash: string) => {
  const index = SECTION_HASHES.findIndex((item) => item === hash.toLowerCase());
  return index >= 0 ? index : 0;
};

const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: "joara",
    company: "(주)조아라",
    roles: [
      {
        period: "2022.11 - 2026.01 (3년 3개월)",
        title: "Frontend Developer",
      },
    ],
    overview:
      "웹소설 플랫폼 서비스의 콘텐츠 제작 및 계정 관리 기능을 중심으로 UI 설계, 기능 개발, 운영 이슈 대응 및 서비스 고도화를 담당",
    highlights: [
      {
        title: "사용자 참여를 높이기 위한 ‘작품 표지 에디터’ 개발",
        problem:
          "기존 단순 이미지 업로드 방식으로는 작가가 원하는 형태의 콘텐츠 제작에 제약이 있었고, 배경 컬러 및 디자인 요소 확장에 대한 요구사항이 지속적으로 발생",
        solutions: [
          "Fabric.js와 react-image-crop을 활용하여 웹 환경에서 이미지 크롭, 배경컬러 추가 및 그라데이션 설정, 텍스트 삽입 및 텍스트 효과 추가 기능이 가능한 인터랙티브 에디터 구현",
          "표지 에디터의 초기 요구사항을 분석하고 구현 가능성을 검토하여 프로토타입을 제작했으며, 기획·디자인 부서와의 협의를 통해 기능 방향성을 수립",
          "초기 도입 경험이 없었던 Fabric.js를 요구사항에 맞게 검토하고 적용하는 과정에서 공식 문서와 AI 기반 개발 도구를 활용하여 기능 검증 및 구현",
        ],
        results: [
          "사용자 주도의 표지 제작이 가능해지며 콘텐츠 표현 자유도 확대",
          "에디터 이용률 증가 및 제작 과정 체류 시간 증가에 기여",
          "사용자 요구사항을 지속 반영하며 운영 중 기능을 고도화",
          "운영 환경에서도 안정적으로 사용할 수 있도록 유지보수 수행",
        ],
      },
      {
        title: "소셜 로그인 확장 및 인증 안정성 개선",
        problem:
          "기존 카카오, 네이버, 애플 로그인만 지원되어 사용자 유입 확장에 한계가 있었음",
        solutions: [
          "Google/Facebook OAuth 로그인 기능 개발",
          "Facebook 로그인 과정에서 iOS/Android 간 인증 처리 방식 차이를 고려하여 플랫폼별 분기 처리 구현",
          "Facebook내 연동해제 시 이동하는 페이지 제작 및 기능추가",
          "운영 중 발생하는 인증 오류를 분석하고 예외 처리 로직을 개선",
          "중복 요청 및 인증 실패 방지를 위한 안정성 강화",
        ],
        results: [
          "Google, Facebook 로그인 추가를 통한 신규 가입 경로 확대",
          "플랫폼별 인증 흐름 및 예외 상황 대응을 통해 로그인 안정성 개선",
          "WebView 환경에서도 일관된 인증 경험을 제공할 수 있는 구조 구축",
          "운영 이슈 감소",
        ],
      },
      {
        title: "이미지 최적화를 통한 성능 및 비용 절감",
        problem:
          "반복적으로 호출되는 아이콘 이미지로 인해 네트워크 요청 증가 및 CDN 비용 상승 발생",
        solutions: [
          "개별 아이콘 이미지를 스프라이트 이미지로 통합하고 CSS background-image 방식으로 변경",
          "스프라이트 이미지 적용 과정에서 발생한 스크린리더 인식 이슈를 개선하여 접근성을 함께 고려한 UI 구조 적용",
          "작품 표지 이미지를 태그 기반 구조로 개선하고 WebP 포맷을 적용하여 디바이스별 최적 이미지를 제공",
        ],
        results: [
          "HTTP 요청 수 감소 및 CloudFront 이미지 비용 약 50% 절감과 함께 서비스 운영 비용 감소에 기여",
          "디바이스별 최적 이미지 제공 및 렌더링 성능 개선",
        ],
      },
      {
        title: "확장성을 고려한 UI 구조 설계 및 공통 컴포넌트화",
        problem:
          "반복되는 UI 구조로 인해 유지보수 비용 증가 및 기능 확장 시 개발 효율 저하",
        solutions: [
          "약 300페이지 규모의 UI 퍼블리싱을 단독으로 수행하며 전체 화면 구조를 설계",
          "반복되는 UI 요소를 공통 컴포넌트로 분리하고, 반응형 및 다크모드를 고려한 구조로 재설계",
          "이를 통해 코드 중복을 줄이고 개발 효율 및 유지보수성을 개선",
        ],
        results: [
          "코드 중복 감소 및 개발 효율 향상, 기능 확장 시 재작업 비용 절감",
        ],
      },
      {
        title: "서비스 운영 및 장애 대응",
        problem: "실서비스 운영 중 다양한 UI 및 기능 오류 발생",
        solutions: [
          "실서비스 운영 중 발생한 UI 및 기능 오류를 분석하고 원인을 파악하여 수정",
          "사용자 문의(CS)와 운영 이슈를 기반으로 문제를 재현하고 개선",
          "다양한 디바이스 및 브라우저 환경에서 발생하는 오류를 대응",
          "배포 이후 발생하는 이슈를 모니터링하고 Hot Fix 적용",
        ],
        results: [
          "반복적으로 발생하던 운영 이슈 감소",
          "사용자 불편 사항을 선제적으로 개선",
          "서비스 안정성 향상",
        ],
      },
    ],
    skills: [
      "React",
      "JavaScript",
      "Axios",
      "SWR",
      "Context API",
      "scss",
      "chatGPT",
      "codex",
      "GitHub",
      "Slack",
      "Notion",
      "Google Docs",
      "Adobe Photoshop",
      "Figma",
    ],
  },
  {
    id: "threeany",
    company: "주식회사쓰리애니아이앤시",
    roles: [
      {
        period: "2019.05 - 2022.04 (3년)",
        title: "Web Publisher",
      },
      {
        period: "2014.11 - 2019.03 (4년 5개월)",
        title: "Web Publisher",
      },
    ],
    overview:
      "다양한 산업군의 웹사이트 구축 및 유지보수 프로젝트에서 UI 퍼블리싱을 담당하며, 반응형 웹 구현, 크로스브라우징 대응, 웹접근성 개선 및 운영 업무를 수행",
    works: [
      "시각장애인 대상 웹사이트 유지보수를 수행하며, 스크린리더 환경에서의 실제 사용성을 고려한 접근성 개선 및 UI 수정 작업을 진행했습니다.",
      "시맨틱 마크업과 웹접근성 기준을 고려한 퍼블리싱을 수행하고, 접근성 준수가 필요한 서비스의 유지보수 및 기능 개선 업무를 담당했습니다.",
      "100개 이상의 웹사이트 퍼블리싱 및 유지보수를 수행하며 공공·의료·기업 등 다양한 산업군 프로젝트를 경험했습니다.",
      "PC, Mobile, Tablet 등 다양한 디바이스 환경에 대응하는 반응형·적응형 UI를 구현했습니다.",
      "브라우저별 렌더링 이슈를 분석하고 개선하여 안정적인 사용자 경험을 제공했습니다.",
      "레거시 코드 분석 및 구조 개선을 통해 유지보수 효율을 높였습니다.",
      "기획자, 디자이너 및 고객사와 협업하며 요구사항을 UI로 구현했습니다.",
    ],
  },
];

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "Project-07",
    title: "AI 연인 대화형 서비스 프로토타입",
    description:
      "Next.js App Router와 TypeScript 기반으로 Anthropic Claude API를 연동해 사용자와 캐릭터 간 대화를 구현하고, 감정 상태와 시간 경과에 따라 관계 변화가 드러나도록 설계한 AI 챗봇 프로토타입입니다.",
    type: "image",
    src: aiChatbotImg,
    link: "https://ai-lover-silk.vercel.app/",
    linkLabel: "서비스 보기",
  },
  {
    id: "Project-08",
    title: "TypeScript·Next.js 맞춤형 학습 페이지",
    description:
      "AI와 대화하며 학습한 TypeScript·Next.js 내용을 웹 기반 학습 콘텐츠로 구조화하고, 개념 설명과 코드 예제, 단계별 문제 풀이를 연결해 복습할 수 있도록 만든 반응형 학습 페이지입니다.",
    type: "image",
    src: studyPageImg,
    link: "https://typescript-next-study-page.vercel.app/",
    linkLabel: "학습 페이지 보기",
  },
  {
    id: "Project-01",
    title: "알고리즘 회상 기반 학습 관리 서비스",
    description:
      "알고리즘 문제 풀이 후 시간이 지나면 풀이 아이디어를 잊어버리는 문제를 해결하기 위해, '회상(Recall) 중심 학습' 프로세스를 직접 설계하고 구현한 프로젝트입니다.",
    type: "image",
    src: algoimg,
    link: "https://algo-review-system.vercel.app/",
    linkLabel: "이용해보기",
  },
  {
    id: "Project-02",
    title: "Google·Facebook 소셜 로그인",
    description:
      "Google·Facebook 소셜 로그인을 OAuth 기반으로 연동하고, 웹·앱 환경을 고려한 인증 플로우 및 앱 브릿지를 포함해 계정 연결·해제 전반의 인증 라이프사이클을 관리했습니다.",
    type: "image",
    src: loginimg,
    link: "https://www.joara.com/auth/login?return_url=%2Fmain%2Frecommend",
    linkLabel: "로그인페이지 보기",
  },
  {
    id: "Project-03",
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
    id: "Project-04",
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
    id: "Project-05",
    title: "퍼블리싱 홈페이지1",
    description: "한양대학교 발달의학센터",
    type: "image",
    src: publishingimg1,
    link: "http://dmc.hyumc.com/index.php",
    linkLabel: "홈페이지 보기",
  },
  {
    id: "Project-06",
    title: "퍼블리싱 홈페이지2",
    description: "(주)유성소프트",
    type: "image",
    src: publishingimg2,
    link: "https://ussoft.co.kr/index.php",
    linkLabel: "홈페이지 보기",
  },
];

const PORTFOLIO_LOOP_COUNT = 5;
const PORTFOLIO_LOOP_MIDDLE = Math.floor(PORTFOLIO_LOOP_COUNT / 2);
const LOOPED_PORTFOLIO_ITEMS = Array.from(
  { length: PORTFOLIO_LOOP_COUNT },
  (_, loopIndex) =>
    PORTFOLIO_ITEMS.map((item, itemIndex) => ({
      item,
      virtualIndex: loopIndex * PORTFOLIO_ITEMS.length + itemIndex,
    })),
).flat();

const getLoopedIndex = (index: number) =>
  ((index % PORTFOLIO_ITEMS.length) + PORTFOLIO_ITEMS.length) %
  PORTFOLIO_ITEMS.length;

export default function HomePageV2() {
  const mainRef = useRef<HTMLElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const receiptScrollRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const wheelLockRef = useRef(false);
  const wheelReleaseTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchScrollHostRef = useRef<HTMLElement | null>(null);
  const portfolioDragPointerIdRef = useRef<number | null>(null);
  const portfolioDragStartXRef = useRef<number | null>(null);
  const portfolioDragCurrentXRef = useRef<number | null>(null);
  const portfolioPressedItemRef = useRef<{
    item: PortfolioItem;
    virtualIndex: number;
  } | null>(null);
  const hasDraggedPortfolioRef = useRef(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isReceiptGuideVisible, setIsReceiptGuideVisible] = useState(true);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(
    PORTFOLIO_ITEMS.length * PORTFOLIO_LOOP_MIDDLE,
  );
  const [portfolioDragOffset, setPortfolioDragOffset] = useState(0);
  const [isPortfolioDragging, setIsPortfolioDragging] = useState(false);
  const [isPortfolioJumping, setIsPortfolioJumping] = useState(false);
  const [isPortfolioMobile, setIsPortfolioMobile] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioItem | null>(null);
  const [sectionIndex, setSectionIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getSectionIndexFromHash(window.location.hash);
  });
  const activePortfolioRealIndex = getLoopedIndex(activePortfolioIndex);
  const portfolioSlideWidth = isPortfolioMobile ? 70 : 28;

  useEffect(() => {
    const canvasEl = canvasElRef.current;
    if (!canvasEl) return;
    let disposed = false;

    const canvas = new fabric.Canvas(canvasEl, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: "rgba(0, 0, 0, 0)",
    }) as unknown as Canvas;

    canvasRef.current = canvas;

    const fitCanvas = () => {
      if (disposed) return;
      const wrap = canvasWrapRef.current;
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(280, Math.floor(rect.width));
      const height = Math.max(280, Math.floor(rect.height));

      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;

      canvas.setWidth(Math.floor(width * dpr));
      canvas.setHeight(Math.floor(height * dpr));
      canvas.setZoom(dpr);
      canvas.requestRenderAll();
    };

    const addInitialImage = (imageSrc: string, index: number) => {
      fabric.Image.fromURL(imageSrc, (image: FabricImage) => {
        if (disposed || canvasRef.current !== canvas) return;

        const zoom = canvas.getZoom?.() || 1;
        const canvasWidth = canvas.getWidth() / zoom;
        const canvasHeight = canvas.getHeight() / zoom;
        const imageWidth = image.width || 1;
        const imageHeight = image.height || 1;
        const maxWidth = canvasWidth * randomInRange(0.12, 0.2);
        const maxHeight = canvasHeight * randomInRange(0.12, 0.22);
        const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1);
        const imageRenderedWidth = imageWidth * scale;
        const imageRenderedHeight = imageHeight * scale;
        const margin = Math.max(28, Math.min(canvasWidth, canvasHeight) * 0.06);

        image.set({
          left: randomInRange(margin + imageRenderedWidth / 2, canvasWidth - margin),
          top: randomInRange(margin + imageRenderedHeight / 2, canvasHeight - margin),
          originX: "center",
          originY: "center",
          angle: randomInRange(-16, 16),
          scaleX: scale,
          scaleY: scale,
          cornerStyle: "circle",
          cornerSize: 10,
          transparentCorners: false,
        });

        canvas.add(image);
        if (index === 0) canvas.setActiveObject(image);
        canvas.requestRenderAll();
      });
    };

    const rafId = window.requestAnimationFrame(() => {
      if (disposed) return;
      fitCanvas();
      [...STICKER_IMAGES, heroImage2, heroImage4].forEach(addInitialImage);
      setIsCanvasReady(true);
    });
    window.addEventListener("resize", fitCanvas);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", fitCanvas);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const updatePortfolioViewport = () => {
      setIsPortfolioMobile(window.innerWidth <= 760);
    };

    updatePortfolioViewport();
    window.addEventListener("resize", updatePortfolioViewport);
    return () => {
      window.removeEventListener("resize", updatePortfolioViewport);
    };
  }, []);

  const addImageToCanvas = (imageSrc: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    fabric.Image.fromURL(imageSrc, (image: FabricImage) => {
      if (canvasRef.current !== canvas) return;

      const zoom = canvas.getZoom?.() || 1;
      const canvasWidth = canvas.getWidth() / zoom;
      const canvasHeight = canvas.getHeight() / zoom;
      const imageWidth = image.width || 1;
      const imageHeight = image.height || 1;
      const maxWidth = canvasWidth * randomInRange(0.16, 0.3);
      const maxHeight = canvasHeight * randomInRange(0.16, 0.3);
      const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1);
      const imageRenderedWidth = imageWidth * scale;
      const imageRenderedHeight = imageHeight * scale;
      const margin = Math.max(24, Math.min(canvasWidth, canvasHeight) * 0.05);

      image.set({
        left: randomInRange(
          margin + imageRenderedWidth / 2,
          canvasWidth - margin - imageRenderedWidth / 2,
        ),
        top: randomInRange(
          margin + imageRenderedHeight / 2,
          canvasHeight - margin - imageRenderedHeight / 2,
        ),
        originX: "center",
        originY: "center",
        angle: randomInRange(-18, 18),
        scaleX: scale,
        scaleY: scale,
        cornerStyle: "circle",
        cornerSize: 10,
        transparentCorners: false,
      });

      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.requestRenderAll();
    });
  };

  const movePortfolioSlide = (direction: -1 | 1) => {
    setActivePortfolioIndex((prev) => prev + direction);
  };

  const startPortfolioDrag = (clientX: number) => {
    portfolioDragStartXRef.current = clientX;
    portfolioDragCurrentXRef.current = clientX;
    hasDraggedPortfolioRef.current = false;
    setPortfolioDragOffset(0);
    setIsPortfolioDragging(true);
  };

  const movePortfolioDrag = (clientX: number) => {
    const startX = portfolioDragStartXRef.current;
    if (startX === null) return;
    const deltaX = clientX - startX;
    portfolioDragCurrentXRef.current = clientX;
    setPortfolioDragOffset(deltaX);
    if (Math.abs(deltaX) > 8) {
      hasDraggedPortfolioRef.current = true;
    }
  };

  const endPortfolioDrag = (clientX = portfolioDragCurrentXRef.current) => {
    const startX = portfolioDragStartXRef.current;
    const wasDragged = hasDraggedPortfolioRef.current;
    portfolioDragStartXRef.current = null;
    portfolioDragCurrentXRef.current = null;
    setPortfolioDragOffset(0);
    setIsPortfolioDragging(false);

    if (startX === null || clientX === null) return false;
    const deltaX = clientX - startX;
    if (Math.abs(deltaX) < 45) {
      hasDraggedPortfolioRef.current = false;
      return false;
    }

    movePortfolioSlide(deltaX < 0 ? 1 : -1);
    if (wasDragged) {
      window.setTimeout(() => {
        hasDraggedPortfolioRef.current = false;
      }, 80);
    }
    return true;
  };

  const handlePortfolioPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!event.isPrimary) return;
    portfolioDragPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    startPortfolioDrag(event.clientX);
  };

  const handlePortfolioPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (portfolioDragPointerIdRef.current !== event.pointerId) return;
    movePortfolioDrag(event.clientX);
  };

  const handlePortfolioPointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (portfolioDragPointerIdRef.current !== event.pointerId) return;
    const wasDraggingCard = hasDraggedPortfolioRef.current;
    portfolioDragPointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const didMoveSlide = endPortfolioDrag(event.clientX);
    const pressedItem = portfolioPressedItemRef.current;
    portfolioPressedItemRef.current = null;

    if (!didMoveSlide && !wasDraggingCard && pressedItem) {
      setActivePortfolioIndex(pressedItem.virtualIndex);
      setSelectedPortfolio(pressedItem.item);
    }
  };

  const normalizePortfolioPosition = (
    event: ReactTransitionEvent<HTMLDivElement>,
  ) => {
    if (
      event.currentTarget !== event.target ||
      event.propertyName !== "transform"
    ) {
      return;
    }

    if (
      activePortfolioIndex >= PORTFOLIO_ITEMS.length &&
      activePortfolioIndex < PORTFOLIO_ITEMS.length * (PORTFOLIO_LOOP_COUNT - 1)
    ) {
      return;
    }

    setIsPortfolioJumping(true);
    setActivePortfolioIndex(
      PORTFOLIO_ITEMS.length * PORTFOLIO_LOOP_MIDDLE +
        activePortfolioRealIndex,
    );

    window.requestAnimationFrame(() => {
      setIsPortfolioJumping(false);
    });
  };

  useEffect(() => {
    const findScrollableHost = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      return target.closest('[data-scrollable="true"]') as HTMLElement | null;
    };

    const canScrollInside = (el: HTMLElement, deltaY: number) => {
      if (deltaY > 0) {
        return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      }
      if (deltaY < 0) return el.scrollTop > 0;
      return false;
    };

    const lockWheelBriefly = () => {
      wheelLockRef.current = true;
      if (wheelReleaseTimerRef.current) {
        window.clearTimeout(wheelReleaseTimerRef.current);
      }
      wheelReleaseTimerRef.current = window.setTimeout(() => {
        wheelLockRef.current = false;
        wheelReleaseTimerRef.current = null;
      }, 780);
    };

    const moveToNext = () => {
      setIsReceiptGuideVisible(true);
      setSectionIndex((prev) => Math.min(prev + 1, SECTION_HASHES.length - 1));
      lockWheelBriefly();
    };

    const moveToPrev = () => {
      setSectionIndex((prev) => Math.max(prev - 1, 0));
      lockWheelBriefly();
    };

    const handleWheel = (event: globalThis.WheelEvent) => {
      if (wheelLockRef.current) {
        event.preventDefault();
        return;
      }

      const scrollHost = findScrollableHost(event.target);
      if (scrollHost) {
        if (canScrollInside(scrollHost, event.deltaY)) return;
        event.preventDefault();
        if (wheelLockRef.current || Math.abs(event.deltaY) < 18) return;
        if (event.deltaY > 0) moveToNext();
        if (event.deltaY < 0) moveToPrev();
        return;
      }

      event.preventDefault();
      if (wheelLockRef.current || Math.abs(event.deltaY) < 18) return;

      if (event.deltaY > 0) moveToNext();
      if (event.deltaY < 0) moveToPrev();
    };

    const handleTouchStart = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartYRef.current = touch.clientY;
      touchScrollHostRef.current = findScrollableHost(event.target);
    };

    const handleTouchEnd = (event: globalThis.TouchEvent) => {
      const startY = touchStartYRef.current;
      const touch = event.changedTouches[0];
      touchStartYRef.current = null;
      if (startY === null || !touch) return;

      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaY) < 48) return;

      const scrollHost = touchScrollHostRef.current;
      touchScrollHostRef.current = null;
      if (scrollHost) {
        const canMoveInside =
          deltaY < 0
            ? scrollHost.scrollTop + scrollHost.clientHeight <
              scrollHost.scrollHeight - 1
            : scrollHost.scrollTop > 0;
        if (canMoveInside) return;
      }

      if (deltaY < 0) moveToNext();
      if (deltaY > 0) moveToPrev();
    };

    const main = mainRef.current;
    if (!main) return;

    main.addEventListener("wheel", handleWheel, { passive: false });
    main.addEventListener("touchstart", handleTouchStart, { passive: true });
    main.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      if (wheelReleaseTimerRef.current) {
        window.clearTimeout(wheelReleaseTimerRef.current);
      }
      main.removeEventListener("wheel", handleWheel);
      main.removeEventListener("touchstart", handleTouchStart);
      main.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const nextHash = SECTION_HASHES[sectionIndex];
    if (sectionIndex === 1 && receiptScrollRef.current) {
      receiptScrollRef.current.scrollTop = 0;
    }
    if (window.location.hash === nextHash) return;
    window.history.replaceState(null, "", nextHash);
  }, [sectionIndex]);

  useEffect(() => {
    const handleHashChange = () => {
      const isExperience = window.location.hash === "#experience";
      if (isExperience) setIsReceiptGuideVisible(true);
      setSectionIndex(getSectionIndexFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className={styles.page}
      style={
        {
          "--hero-bg": `url("${NATURE_BACKGROUNDS.hero}")`,
          "--experience-bg": `url("${NATURE_BACKGROUNDS.experience}")`,
          "--portfolio-bg": `url("${NATURE_BACKGROUNDS.portfolio}")`,
        } as CSSProperties
      }
    >
      <nav
        className={`${styles.topContact} ${
          sectionIndex === 2 ? styles.topContactPortfolio : ""
        }`}
        aria-label="Contact links"
      >
        <a href={CONTACT_LINKS.email} aria-label="이메일 보내기" title="Email">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.2L8 8.8.1 4.2V4Z" />
            <path d="M0 5.4v6.6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4L8.5 9.7a1 1 0 0 1-1 0L0 5.4Z" />
          </svg>
        </a>
        <a
          href={CONTACT_LINKS.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub 프로필 열기"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.9.1 1.4.9 1.4.9.8 1.3 2.1 1 2.6.7.1-.6.3-1 .6-1.3-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 7 8.9a3.5 3.5 0 0 1 .1-2.6s.8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .4 1 .2 2 .1 2.6a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .3.3.7.9.7 1.8v2.6c0 .3.2.7.7.5a9.5 9.5 0 0 0-3-18.5Z" />
          </svg>
        </a>
        <a
          href={CONTACT_LINKS.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn 프로필 열기"
          title="LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5.3 8.5a1.6 1.6 0 1 1 0-3.1 1.6 1.6 0 0 1 0 3.1ZM3.9 9.8h2.8V20H3.9zM10.3 9.8H13v1.4h.1c.4-.7 1.3-1.6 2.8-1.6 3 0 3.6 2 3.6 4.5V20h-2.9v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-2.8z" />
          </svg>
        </a>
      </nav>

      <div
        className={styles.track}
        style={{ transform: `translateY(-${sectionIndex * 100}svh)` }}
      >
        <section id="main" className={styles.heroSection} aria-label="Main">
          <div className={styles.heroShell}>
            <div ref={canvasWrapRef} className={styles.canvasWrap}>
              <canvas ref={canvasElRef} />
            </div>

            <div className={styles.frame}>
              <div className={styles.frameGrid} aria-hidden="true" />
              <header className={styles.frameHeader}>
                <span>YEZZI Front-End Developer</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsReceiptGuideVisible(true);
                    setSectionIndex(1);
                  }}
                >
                  Scroll Down
                </button>
              </header>

              <div className={styles.stickerTray} aria-label="스티커 이미지">
                {STICKER_IMAGES.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    disabled={!isCanvasReady}
                    onClick={() => addImageToCanvas(src)}
                    aria-label={`Image ${index + 1} 추가`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>

              <footer className={styles.frameFooter}>
                <span>UI Design</span>
                <span>YEZZI</span>
              </footer>
            </div>
          </div>
        </section>

        <section
          id="experience"
          className={styles.experienceSection}
          aria-label="Experience"
        >
          <div className={styles.experienceWrap}>
            {/* <p className={styles.sideCaption}>Portfolio / Experience</p>
            <p className={styles.sideCaptionRight}>Frontend Developer</p> */}

            <div className={styles.receiptScrollFrame}>
              <div
                ref={receiptScrollRef}
                className={styles.receiptScroll}
                data-scrollable="true"
                onScroll={(event) => {
                  if (
                    isReceiptGuideVisible &&
                    event.currentTarget.scrollTop > 4
                  ) {
                    setIsReceiptGuideVisible(false);
                  }
                }}
              >
                <div className={styles.receiptStack}>
                  {EXPERIENCE_ITEMS.map((item, index) => (
                    <article className={styles.receipt} key={item.id}>
                    <div className={styles.receiptHeader}>
                      <p className={styles.receiptKicker}>Experience</p>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <h2>{item.company}</h2>

                    <div className={styles.dottedLine} />

                    <div className={styles.roleList}>
                      {item.roles.map((role) => (
                        <div key={`${item.id}-${role.period}`}>
                          <span>{role.period}</span>
                          <strong>{role.title}</strong>
                        </div>
                      ))}
                    </div>

                    <div className={styles.dottedLine} />

                    {item.overview && (
                      <section className={styles.experienceBlock}>
                        <h3>개요</h3>
                        <p>{item.overview}</p>
                      </section>
                    )}

                    {item.highlights && (
                      <section className={styles.experienceBlock}>
                        <h3>주요 경험 및 성과</h3>
                        <div className={styles.highlightList}>
                          {item.highlights.map((highlight, highlightIndex) => (
                            <article
                              className={styles.highlightItem}
                              key={highlight.title}
                            >
                              <h4>
                                {highlightIndex + 1}. {highlight.title}
                              </h4>
                              <dl className={styles.detailList}>
                                <div>
                                  <dt>문제</dt>
                                  <dd>{highlight.problem}</dd>
                                </div>
                                <div>
                                  <dt>해결</dt>
                                  <dd>
                                    <ul>
                                      {highlight.solutions.map((solution) => (
                                        <li key={solution}>{solution}</li>
                                      ))}
                                    </ul>
                                  </dd>
                                </div>
                                <div>
                                  <dt>성과</dt>
                                  <dd>
                                    <ul>
                                      {highlight.results.map((result) => (
                                        <li key={result}>{result}</li>
                                      ))}
                                    </ul>
                                  </dd>
                                </div>
                              </dl>
                            </article>
                          ))}
                        </div>
                      </section>
                    )}

                    {item.works && (
                      <div className={styles.workList}>
                        {item.works.map((work) => (
                          <p key={work}>- {work}</p>
                        ))}
                      </div>
                    )}

                    {item.skills && (
                      <section className={styles.experienceBlock}>
                        <h3>사용스킬</h3>
                        <ul className={styles.skillList}>
                          {item.skills.map((skill) => (
                            <li key={skill}>{skill}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                    </article>
                  ))}
                </div>
              </div>

              {isReceiptGuideVisible && (
                <div className={styles.receiptScrollGuide} aria-hidden="true">
                  <span className={styles.scrollIcon} />
                  <span className={styles.scrollGuideText}>Scroll Down</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          id="portfolio"
          className={styles.portfolioSection}
          aria-label="Portfolio"
        >
          <div className={styles.portfolioStage}>
            <div className={styles.portfolioPanel}>
              <header className={styles.portfolioHeader}>
                <strong>Portfolio</strong>
                <nav aria-label="Portfolio slide navigation">
                  {PORTFOLIO_ITEMS.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        activePortfolioRealIndex === index ? styles.isActive : ""
                      }
                      onClick={() =>
                        setActivePortfolioIndex(
                          PORTFOLIO_ITEMS.length * PORTFOLIO_LOOP_MIDDLE +
                            index,
                        )
                      }
                      aria-label={`${index + 1}번 포트폴리오 보기`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </button>
                  ))}
                </nav>
              </header>

              <div
                className={styles.portfolioSlider}
                onPointerDown={handlePortfolioPointerDown}
                onPointerMove={handlePortfolioPointerMove}
                onPointerUp={handlePortfolioPointerUp}
                onPointerCancel={handlePortfolioPointerUp}
              >
                <div
                  className={`${styles.portfolioTrack} ${
                    isPortfolioDragging || isPortfolioJumping
                      ? styles.portfolioTrackDragging
                      : ""
                  }`}
                  onTransitionEnd={normalizePortfolioPosition}
                  style={{
                    transform: `translateX(calc(-${
                      portfolioSlideWidth / 2
                    }vw - ${
                      activePortfolioIndex * portfolioSlideWidth
                    }vw + ${portfolioDragOffset}px))`,
                  }}
                >
                  {LOOPED_PORTFOLIO_ITEMS.map(
                    ({ item, virtualIndex }) => (
                      <article
                        key={virtualIndex}
                        className={`${styles.portfolioCard} ${
                          activePortfolioIndex === virtualIndex
                            ? styles.portfolioCardActive
                            : ""
                        }`}
                        onPointerDownCapture={() => {
                          portfolioPressedItemRef.current = {
                            item,
                            virtualIndex,
                          };
                        }}
                      >
                        <div className={styles.portfolioCopy}>
                          <h2>{item.title}</h2>
                          <span>{item.description}</span>
                          {/* <p>{item.id}</p> */}
                        </div>
                        <div className={styles.portfolioMedia}>
                          {item.src ? (
                            <img
                              src={
                                item.type === "video"
                                  ? (item.poster ?? item.src)
                                  : item.src
                              }
                              alt={item.title}
                              draggable={false}
                            />
                          ) : (
                            <div className={styles.portfolioBlank}>
                              {item.id}
                            </div>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedPortfolio && (
        <div className={styles.portfolioModal} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.modalBackdrop}
            aria-label="팝업 닫기"
            onClick={() => setSelectedPortfolio(null)}
          />
          <div
            className={styles.modalContent}
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setSelectedPortfolio(null)}
              aria-label="닫기"
            >
              ×
            </button>

            {selectedPortfolio.type === "video" && selectedPortfolio.src ? (
              <video
                className={styles.modalMedia}
                src={selectedPortfolio.src}
                poster={selectedPortfolio.poster}
                controls
                autoPlay
                muted
                playsInline
                onWheel={(event) => event.stopPropagation()}
              />
            ) : selectedPortfolio.src ? (
              <div
                className={styles.modalImageScroll}
                onWheel={(event) => event.stopPropagation()}
                onTouchMove={(event) => event.stopPropagation()}
              >
                <img
                  className={styles.modalImage}
                  src={selectedPortfolio.src}
                  alt={selectedPortfolio.title}
                />
              </div>
            ) : (
              <div className={styles.modalBlank}>
                <span>{selectedPortfolio.id}</span>
              </div>
            )}

            <div className={styles.modalInfo}>
              <h3>{selectedPortfolio.title}</h3>
              <p>{selectedPortfolio.description}</p>
              {selectedPortfolio.link && (
                <a
                  className={styles.modalLinkButton}
                  href={selectedPortfolio.link}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {selectedPortfolio.linkLabel ?? "링크 이동"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
