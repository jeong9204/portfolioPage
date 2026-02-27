import styles from "./SiteHeader.module.scss";

// Header가 외부(HomePage)와 통신하는 인터페이스.
// isDark: 아이콘/라벨 분기용 상태값.
// onToggleTheme, onLogoClick: 부모 상태 변경을 위한 콜백.
type SiteHeaderProps = {
  isDark: boolean;
  onToggleTheme: () => void;
  onLogoClick: () => void;
};

export default function SiteHeader({ isDark, onToggleTheme, onLogoClick }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button type="button" className={styles.logo} onClick={onLogoClick}>
          YEZZI
        </button>
        <button
          type="button"
          className={styles.themeButton}
          onClick={onToggleTheme}
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M4.93 19.07l1.41-1.41" />
              <path d="M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
