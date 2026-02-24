import { useEffect, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import type { Canvas, Textbox } from "fabric/fabric-impl";
import "./CoverHero.scss";

type PresetKey = "ux" | "performance" | "auth";

const PRESETS: Record<PresetKey, { title: string; subtitle: string }> = {
  ux: {
    title: "UI/UX를 설계하는 Front-End Developer",
    subtitle: "복잡함을 구조로 정리하고, 경험을 디테일로 완성합니다.",
  },
  performance: {
    title: "Performance-driven UI Engineering",
    subtitle: "로딩과 체감 속도를 설계합니다.",
  },
  auth: {
    title: "OAuth · WebView 브릿지까지",
    subtitle: "실서비스 인증 플로우를 끝까지 책임집니다.",
  },
};

export default function CoverHero() {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  // ✅ 타입은 fabric/fabric-impl 에서 가져온 Canvas/Textbox로 잡는다
  const canvasRef = useRef<Canvas | null>(null);
  const titleRef = useRef<Textbox | null>(null);
  const subtitleRef = useRef<Textbox | null>(null);

  const [ready, setReady] = useState(false);
  const [preset, setPreset] = useState<PresetKey>("ux");

  const text = useMemo(() => PRESETS[preset], [preset]);

  useEffect(() => {
    const el = canvasElRef.current;
    if (!el) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // fabric.Canvas는 런타임 객체
    const c = new fabric.Canvas(el, {
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
    });

    canvasRef.current = c as unknown as Canvas;

    // 배경
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: 2000,
      height: 2000,
      selectable: false,
      evented: false,
    });

    const grad = new fabric.Gradient({
      type: "linear",
      gradientUnits: "pixels",
      coords: { x1: 0, y1: 0, x2: 800, y2: 600 },
      colorStops: [
        { offset: 0, color: "#0B1020" },
        { offset: 0.5, color: "#111A33" },
        { offset: 1, color: "#0B1020" },
      ],
    });

    bg.set("fill", grad);
    c.add(bg);
    c.sendToBack(bg);

    // 텍스트
    const title = new fabric.Textbox(text.title, {
      left: 80,
      top: 120,
      width: 900,
      fontSize: 42,
      fontWeight: 700,
      fill: "rgba(255,255,255,0.96)",
      charSpacing: 20,
      lineHeight: 1.1,
      editable: true,
      cornerStyle: "circle",
      cornerSize: 10,
      transparentCorners: false,
      borderColor: "rgba(255,255,255,0.25)",
      cornerColor: "rgba(255,255,255,0.35)",
    });

    const subtitle = new fabric.Textbox(text.subtitle, {
      left: 80,
      top: 210,
      width: 860,
      fontSize: 18,
      fontWeight: 400,
      fill: "rgba(255,255,255,0.80)",
      charSpacing: 10,
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

    titleRef.current = title as unknown as Textbox;
    subtitleRef.current = subtitle as unknown as Textbox;

    // 레이아웃/리사이즈 (CSS 크기에 맞춰 캔버스 내부 해상도도 맞추기)
    const layout = () => {
      const parent = el.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const wCss = Math.max(320, Math.floor(rect.width));
      const hCss = Math.max(360, Math.floor(rect.height));

      // 캔버스 내부 픽셀 크기
      el.width = Math.floor(wCss * dpr);
      el.height = Math.floor(hCss * dpr);

      // 화면에 보이는 크기
      el.style.width = `${wCss}px`;
      el.style.height = `${hCss}px`;

      c.setWidth(el.width);
      c.setHeight(el.height);
      c.setZoom(dpr);

      // 배경 커버
      bg.set({ left: 0, top: 0, width: el.width, height: el.height });

      // 보기 좋은 텍스트 배치
      const padX = Math.max(48, Math.floor(el.width * 0.08));
      const top = Math.max(72, Math.floor(el.height * 0.18));

      title.set({
        left: padX,
        top,
        width: Math.min(980, Math.floor(el.width - padX * 2)),
      });

      subtitle.set({
        left: padX,
        top: top + 90,
        width: Math.min(900, Math.floor(el.width - padX * 2)),
      });

      c.requestRenderAll();
    };

    layout();
    window.addEventListener("resize", layout);
    setReady(true);

    return () => {
      window.removeEventListener("resize", layout);
      c.dispose();
      canvasRef.current = null;
      titleRef.current = null;
      subtitleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // preset 바뀌면 텍스트만 업데이트
  useEffect(() => {
    const c = canvasRef.current as unknown as Canvas | null;
    const t = titleRef.current as unknown as Textbox | null;
    const s = subtitleRef.current as unknown as Textbox | null;
    if (!c || !t || !s) return;

    t.text = PRESETS[preset].title;
    s.text = PRESETS[preset].subtitle;

    // 텍스트 길이에 따른 크기 재계산
    t.initDimensions?.();
    s.initDimensions?.();

    c.requestRenderAll();
  }, [preset]);

  const reset = () => {
    const c = canvasRef.current as unknown as Canvas | null;
    const t = titleRef.current as unknown as Textbox | null;
    const s = subtitleRef.current as unknown as Textbox | null;
    if (!c || !t || !s) return;

    t.set({ angle: 0, scaleX: 1, scaleY: 1 });
    s.set({ angle: 0, scaleX: 1, scaleY: 1 });

    c.discardActiveObject();
    window.dispatchEvent(new Event("resize")); // 레이아웃 재정렬
    c.requestRenderAll();
  };

  const exportPNG = () => {
    const c = canvasRef.current as unknown as Canvas | null;
    if (!c) return;

    c.discardActiveObject();
    c.requestRenderAll();

    const dataUrl = c.toDataURL({
      format: "png",
      multiplier: 2,
      enableRetinaScaling: false,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "cover-hero.png";
    a.click();
  };

  return (
    <section className="cover-hero">
      <div className="cover-hero__inner">
        <div className="cover-hero__left">
          <div className="cover-hero__badge">Cover-style Intro • fabric.js</div>

          <h1 className="cover-hero__title">
            표지 제작기를 활용한{" "}
            <span className="cover-hero__emph">인터랙티브 대문</span>
          </h1>

          <p className="cover-hero__desc">
            텍스트를 드래그로 옮기고, 더블클릭해서 문구를 수정해봐. 내가
            만들었던 표지 제작 흐름을 축소한 체험판이야.
          </p>

          <div className="cover-hero__buttons">
            <button
              className={preset === "ux" ? "is-on" : ""}
              onClick={() => setPreset("ux")}
              disabled={!ready}
            >
              UI/UX
            </button>
            <button
              className={preset === "performance" ? "is-on" : ""}
              onClick={() => setPreset("performance")}
              disabled={!ready}
            >
              Performance
            </button>
            <button
              className={preset === "auth" ? "is-on" : ""}
              onClick={() => setPreset("auth")}
              disabled={!ready}
            >
              Auth
            </button>

            <span className="cover-hero__spacer" />

            <button onClick={reset} disabled={!ready}>
              Reset
            </button>
            <button onClick={exportPNG} disabled={!ready}>
              Export PNG
            </button>
          </div>
        </div>

        <div className="cover-hero__canvas">
          <canvas ref={canvasElRef} />
          {!ready && <div className="cover-hero__loading">Loading…</div>}
        </div>
      </div>
    </section>
  );
}
