import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import type {
  Canvas,
  Image as FabricImage,
  Rect as FabricRect,
  Textbox,
} from "fabric/fabric-impl";
import styles from "./CoverHero.module.scss";

// PresetKey를 유니온 타입으로 고정하면,
// 오타("perfromance" 같은 값)를 컴파일 단계에서 바로 잡을 수 있다.
type PresetKey = "ux" | "performance" | "interaction";

// 컴포넌트 Props 타입.
// className?: 상위에서 스타일 확장할 때 선택적으로 전달.
// onScrollDown?: 버튼 클릭 동작을 상위(HomePage) 상태 전환과 연결.
// isDark: 테마에 따라 캔버스 텍스트/저장 배경색을 분기하기 위해 필수.
type CoverHeroProps = {
  className?: string;
  onScrollDown?: () => void;
  isDark: boolean;
};

// Record<PresetKey, ...>를 사용하면
// PresetKey의 모든 키가 빠짐없이 정의되어야 하고,
// key 조회 시에도 타입 안전하게 접근 가능하다.
const PRESETS: Record<PresetKey, { title: string; subtitle: string }> = {
  ux: {
    title: "구조로 설계하는 UI",
    subtitle: "요구사항을 정리해 확장 가능한 인터페이스로 구현합니다.",
  },
  performance: {
    title: "운영 환경 최적화",
    subtitle: "리소스 통합과 구조 개선을 통해 비용과 성능을 개선합니다.",
  },
  interaction: {
    title: "사용자 인터랙션 설계",
    subtitle: "Canvas 기반 UI와 복잡한 상호작용을 직접 구현합니다.",
  },
};

// 타이틀은 요청한 Noonnu 폰트(KerisKeduLine)로 분리 적용한다.
const HERO_TITLE_FONT_FAMILY = '"KerisKeduLine", "Pretendard", system-ui, sans-serif';
// 본문(서브타이틀)은 가독성을 위해 기존 Pretendard 계열을 유지한다.
const HERO_BODY_FONT_FAMILY = '"Pretendard", system-ui, -apple-system, sans-serif';

// assets/images 폴더의 이미지를 빌드 시점에 자동 수집한다.
const IMAGE_ASSETS = Object.entries(
  import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp,svg,gif}", {
    eager: true,
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src], index) => {
    const fileName = path.split("/").pop() ?? `image-${index + 1}`;
    return {
      src: src as string,
      // 파일명이 길어도 버튼 UI가 깨지지 않도록 짧은 표시 라벨을 사용한다.
      label: `Image ${index + 1}`,
      fileName,
    };
  });

export default function CoverHero({
  className,
  onScrollDown,
  isDark,
}: CoverHeroProps) {
  // DOM 요소 ref 타입을 명시하면 .current 사용 시 자동완성이 정확해지고,
  // null 체크가 강제되어 런타임 오류를 줄일 수 있다.
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  // fabric 인스턴스/오브젝트 ref.
  // state가 아닌 ref를 쓰는 이유:
  // 렌더를 유발하지 않고(성능), 이벤트 핸들러에서 항상 최신 객체를 접근하기 위해.
  const canvasRef = useRef<Canvas | null>(null);
  const bgRef = useRef<FabricRect | null>(null);
  const titleRef = useRef<Textbox | null>(null);
  const subtitleRef = useRef<Textbox | null>(null);
  // 텍스트만 재배치하는 경량 레이아웃(Reset/Preset용)을 보관한다.
  const layoutRef = useRef<(() => void) | null>(null);

  const [ready, setReady] = useState(false);
  // 제네릭 <PresetKey>로 상태 타입을 제한하면 잘못된 문자열 set을 방지할 수 있다.
  const [preset, setPreset] = useState<PresetKey>("ux");

  // fabric 내부 백버퍼 크기 대신 실제 화면에 보이는 좌표계를 반환한다.
  // 반환 객체 타입은 TS가 추론하지만, 입력 타입(Canvas)은 명시해 재사용 안정성을 높인다.
  const getVisibleCanvasSize = (canvas: Canvas) => {
    const zoom = canvas.getZoom?.() || 1;
    return {
      width: canvas.getWidth() / zoom,
      height: canvas.getHeight() / zoom,
    };
  };

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    // 웹폰트 로딩이 지연/실패해도 캔버스 초기화가 멈추지 않도록 타임아웃을 둔다.
    const loadFontWithTimeout = async (fontRule: string, timeoutMs: number) => {
      if (!document.fonts?.load) return;
      await Promise.race([
        // 폰트 URL이 깨져도(404) 초기화가 멈추지 않도록 로딩 에러를 삼킨다.
        document.fonts
          .load(fontRule)
          .then(() => undefined)
          .catch(() => undefined),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, timeoutMs);
        }),
      ]);
    };

    const init = async () => {
      const el = canvasElRef.current;
      if (!el) return;

      // 캔버스 텍스트 생성 전에 폰트를 미리 로드해 첫 프레임 왜곡을 방지한다.
      await Promise.all([
        loadFontWithTimeout("400 42px KerisKeduLine", 1200),
        loadFontWithTimeout("400 18px Pretendard", 1200),
      ]);
      if (disposed) return;

      const c = new fabric.Canvas(el, {
        selection: true,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
      });

      // fabric의 런타임 객체를 앱 전역에서 재사용하려고 ref에 보관.
      // Canvas 타입으로 잡아두면 이후 API 사용 시 타입 힌트를 받을 수 있다.
      canvasRef.current = c as unknown as Canvas;

      const bg = new fabric.Rect({
        left: 0,
        top: 0,
        width: 2000,
        height: 2000,
        selectable: false,
        evented: false,
      });

      // 캔버스 배경을 투명 처리해 페이지 고정 그라데이션이 그대로 보이도록 한다.
      bg.set("fill", "rgba(0,0,0,0)");
      c.add(bg);
      c.sendToBack(bg);
      bgRef.current = bg as unknown as FabricRect;

      const title = new fabric.Textbox(PRESETS.ux.title, {
        left: 80,
        top: 120,
        width: 900,
        fontSize: 42,
        fontFamily: HERO_TITLE_FONT_FAMILY,
        fontWeight: 700,
        fill: isDark ? "rgba(255,255,255,0.96)" : "rgba(18,22,31,0.95)",
        // 자간을 강제로 벌리면 stretched처럼 보일 수 있어 기본값으로 둔다.
        charSpacing: 0,
        lineHeight: 1.1,
        editable: true,
        cornerStyle: "circle",
        cornerSize: 10,
        transparentCorners: false,
        borderColor: "rgba(255,255,255,0.25)",
        cornerColor: "rgba(255,255,255,0.35)",
      });

      const subtitle = new fabric.Textbox(PRESETS.ux.subtitle, {
        left: 80,
        top: 210,
        width: 860,
        fontSize: 18,
        fontFamily: HERO_BODY_FONT_FAMILY,
        fontWeight: 400,
        fill: isDark ? "rgba(255,255,255,0.8)" : "rgba(18,22,31,0.72)",
        charSpacing: 0,
        lineHeight: 1.45,
        editable: true,
        cornerStyle: "circle",
        cornerSize: 10,
        transparentCorners: false,
        borderColor: "rgba(255,255,255,0.20)",
        cornerColor: "rgba(255,255,255,0.30)",
      });

      c.add(title);
      c.add(subtitle);

      // fabric.Textbox 인스턴스를 ref에 저장해 preset/reset에서 직접 조작한다.
      // 타입을 Textbox로 두는 이유는 text/set/initDimensions 등 텍스트 전용 API를 안전하게 쓰기 위해.
      titleRef.current = title as unknown as Textbox;
      subtitleRef.current = subtitle as unknown as Textbox;

      const placeTextObjects = () => {
        // 백버퍼가 아닌 실제 보이는 캔버스 크기 기준으로 텍스트를 배치한다.
        const { width: cw, height: ch } = getVisibleCanvasSize(
          c as unknown as Canvas,
        );
        if (!cw || !ch) return;

        const padX = Math.max(48, Math.floor(cw * 0.08));
        const top = Math.max(72, Math.floor(ch * 0.18));

        title.set({
          left: padX,
          top,
          width: Math.min(980, Math.floor(cw - padX * 2)),
        });

        subtitle.set({
          left: padX,
          // 타이틀과의 간격을 줄여 subtitle을 약 20px 위로 올린다.
          top: top + 70,
          width: Math.min(900, Math.floor(cw - padX * 2)),
        });

        title.initDimensions?.();
        subtitle.initDimensions?.();
        c.requestRenderAll();
      };

      const fitCanvasToWrap = () => {
        const wrap = canvasWrapRef.current;
        if (!wrap) return;

        // 리사이즈 때만 캔버스 버퍼를 재할당해 성능 저하를 줄인다.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = wrap.getBoundingClientRect();
        const wCss = Math.max(320, Math.floor(rect.width));
        const hCss = Math.max(360, Math.floor(rect.height));
        const nextWidth = Math.floor(wCss * dpr);
        const nextHeight = Math.floor(hCss * dpr);

        if (el.width !== nextWidth) el.width = nextWidth;
        if (el.height !== nextHeight) el.height = nextHeight;
        el.style.width = `${wCss}px`;
        el.style.height = `${hCss}px`;

        c.setWidth(nextWidth);
        c.setHeight(nextHeight);
        c.setZoom(dpr);
        bg.set({ left: 0, top: 0, width: nextWidth, height: nextHeight });

        placeTextObjects();
      };

      layoutRef.current = placeTextObjects;
      fitCanvasToWrap();
      window.addEventListener("resize", fitCanvasToWrap);
      setReady(true);

      cleanup = () => {
        window.removeEventListener("resize", fitCanvasToWrap);
        layoutRef.current = null;
        c.dispose();
        canvasRef.current = null;
        bgRef.current = null;
        titleRef.current = null;
        subtitleRef.current = null;
      };
    };

    void init();

    return () => {
      disposed = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (nextPreset: PresetKey) => {
    setPreset(nextPreset);

    // ref.current는 null 가능성이 있으므로, 각 값에 대해 null 체크를 먼저 수행한다.
    const c = canvasRef.current as unknown as Canvas | null;
    const t = titleRef.current as unknown as Textbox | null;
    const s = subtitleRef.current as unknown as Textbox | null;
    if (!c || !t || !s) return;

    t.set("text", PRESETS[nextPreset].title);
    s.set("text", PRESETS[nextPreset].subtitle);
    t.initDimensions?.();
    s.initDimensions?.();
    // 사용자가 옮긴 위치를 유지하기 위해 프리셋 변경 시에는 텍스트만 갱신한다.
    c.requestRenderAll();
  };

  useEffect(() => {
    const c = canvasRef.current as unknown as Canvas | null;
    const t = titleRef.current as unknown as Textbox | null;
    const s = subtitleRef.current as unknown as Textbox | null;
    if (!c || !t || !s) return;

    // 투명 캔버스 위 텍스트만 테마에 맞게 갱신한다.
    t.set("fill", isDark ? "rgba(255,255,255,0.96)" : "rgba(18,22,31,0.95)");
    s.set("fill", isDark ? "rgba(255,255,255,0.8)" : "rgba(18,22,31,0.72)");
    c.requestRenderAll();
  }, [isDark]);

  const reset = () => {
    const c = canvasRef.current as unknown as Canvas | null;
    const bg = bgRef.current as unknown as FabricRect | null;
    const t = titleRef.current as unknown as Textbox | null;
    const s = subtitleRef.current as unknown as Textbox | null;
    if (!c || !bg || !t || !s) return;

    // Reset 시에는 사용자가 추가한 이미지/오브젝트를 제거해 초기 상태로 되돌린다.
    c.getObjects().forEach((obj: unknown) => {
      // 여기서는 속성 접근 없이 비교/전달만 하므로 any 대신 unknown으로 안전하게 처리한다.
      const canvasObject = obj as unknown;
      if (canvasObject !== bg && canvasObject !== t && canvasObject !== s) {
        c.remove(canvasObject);
      }
    });

    // 텍스트 내용도 기본 프리셋으로 복구한다.
    setPreset("ux");
    t.set({
      text: PRESETS.ux.title,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      fill: isDark ? "rgba(255,255,255,0.96)" : "rgba(18,22,31,0.95)",
    });
    s.set({
      text: PRESETS.ux.subtitle,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      fill: isDark ? "rgba(255,255,255,0.8)" : "rgba(18,22,31,0.72)",
    });

    t.initDimensions?.();
    s.initDimensions?.();
    c.discardActiveObject();
    // Reset에서 캔버스 리사이즈를 하지 않고 텍스트/오브젝트만 재정렬해 성능을 안정화한다.
    layoutRef.current?.();
  };

  const exportPNG = () => {
    const c = canvasRef.current as unknown as Canvas | null;
    if (!c) return;

    const { width: canvasWidth, height: canvasHeight } = getVisibleCanvasSize(
      c as unknown as Canvas,
    );
    // 저장 시에는 투명 배경 대신 현재 테마에 맞는 배경색을 임시로 추가한다.
    const exportBg = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
      selectable: false,
      evented: false,
      fill: isDark ? "#0B1020" : "#F4F7FB",
    });

    c.add(exportBg);
    c.sendToBack(exportBg);
    c.discardActiveObject();
    c.requestRenderAll();

    const dataUrl = c.toDataURL({
      format: "png",
      multiplier: 2,
      enableRetinaScaling: false,
    });

    // 다운로드 후 임시 배경을 제거해 에디터 캔버스는 투명 상태를 유지한다.
    c.remove(exportBg);
    c.requestRenderAll();

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "cover-hero.png";
    a.click();
  };

  const addImageToCanvas = (imageSrc: string) => {
    // imageSrc를 string으로 제한해 fromURL 입력 타입을 명확히 한다.
    const c = canvasRef.current as unknown as Canvas | null;
    if (!c) return;

    // 이미지 버튼 클릭 시 랜덤 좌표에 스케일된 오브젝트로 추가한다.
    // 콜백 파라미터를 FabricImage로 명시하면 any 경고 없이
    // width/height/set 같은 이미지 API 접근이 타입 안전해진다.
    fabric.Image.fromURL(imageSrc, (img: FabricImage) => {
      if (!img) return;

      // 이미지 랜덤 좌표는 실제 보이는 캔버스 크기 기준으로 계산한다.
      const { width: canvasWidth, height: canvasHeight } = getVisibleCanvasSize(
        c as unknown as Canvas,
      );
      const maxW = canvasWidth * 0.32;
      const maxH = canvasHeight * 0.32;
      const iw = img.width || 1;
      const ih = img.height || 1;
      const scale = Math.min(maxW / iw, maxH / ih, 1);
      const renderedW = iw * scale;
      const renderedH = ih * scale;

      // 랜덤 배치 시 오브젝트가 캔버스 밖으로 튀지 않도록 안전 범위를 계산한다.
      const margin = 24;
      const minLeft = renderedW / 2 + margin;
      const maxLeft = canvasWidth - renderedW / 2 - margin;
      const minTop = renderedH / 2 + margin;
      const maxTop = canvasHeight - renderedH / 2 - margin;
      const randomInRange = (min: number, max: number) =>
        Math.random() * (Math.max(min, max) - min) + min;

      img.set({
        left: randomInRange(minLeft, maxLeft),
        top: randomInRange(minTop, maxTop),
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        cornerStyle: "circle",
        cornerSize: 10,
        transparentCorners: false,
      });

      c.add(img);
      // 이미지 추가 후에도 title/subtitle이 항상 최상단에 보이도록 레이어를 다시 올린다.
      const t = titleRef.current as unknown as Textbox | null;
      const s = subtitleRef.current as unknown as Textbox | null;
      if (t) c.bringToFront(t as unknown);
      if (s) c.bringToFront(s as unknown);
      c.setActiveObject(img);
      c.requestRenderAll();
    });
  };

  return (
    <section
      className={[styles.coverHero, className].filter(Boolean).join(" ")}
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.badge}>YEZZI Front-End Developer</div>

          {/* <h1 className={styles.title}>
            표지 제작기를 활용한{" "}
            <span className={styles.emph}>인터랙티브 대문</span>
          </h1> */}

          {/* <p className={styles.desc}>버튼을 클릭해 보세요</p> */}

          <div className={styles.buttons}>
            <button
              className={preset === "ux" ? styles.isOn : ""}
              onClick={() => applyPreset("ux")}
              disabled={!ready}
            >
              UI/UX
            </button>
            <button
              className={preset === "performance" ? styles.isOn : ""}
              onClick={() => applyPreset("performance")}
              disabled={!ready}
            >
              Performance
            </button>
            <button
              className={preset === "interaction" ? styles.isOn : ""}
              onClick={() => applyPreset("interaction")}
              disabled={!ready}
            >
              Interaction
            </button>
            {IMAGE_ASSETS.length > 0 &&
              IMAGE_ASSETS.map((asset) => (
                <button
                  key={asset.src}
                  className={styles.imageButton}
                  onClick={() => addImageToCanvas(asset.src)}
                  disabled={!ready}
                  title={asset.fileName}
                  aria-label={`${asset.fileName} 이미지 추가`}
                >
                  <img src={asset.src} alt="" />
                  {/* <span>{asset.label}</span> */}
                </button>
              ))}

            <span className={styles.spacer} />

            <button onClick={reset} disabled={!ready}>
              Reset
            </button>
            <button onClick={exportPNG} disabled={!ready}>
              Export PNG
            </button>
          </div>
        </div>

        <button
          className={styles.scrollHint}
          type="button"
          onClick={onScrollDown}
        >
          Scroll Down
        </button>
      </div>

      <div ref={canvasWrapRef} className={styles.canvas}>
        <canvas ref={canvasElRef} />
        {!ready && <div className={styles.loading}>Loading…</div>}
      </div>
    </section>
  );
}
