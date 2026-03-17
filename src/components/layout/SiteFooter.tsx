import styles from "./SiteFooter.module.scss";

const CONTACT_LINKS = {
  email: "mailto:jeong9204@gmail.com",
  github: "https://github.com/jeong9204",
  linkedin:
    "https://www.linkedin.com/in/%EC%98%88%EC%A7%80-%EC%A0%95-56210924a/",
} as const;

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav aria-label="Contact links">
        <ul className={styles.iconList}>
          <li>
            <a
              href={CONTACT_LINKS.email}
              aria-label="이메일 보내기"
              title="Email"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.2L8 8.8.1 4.2V4Z" />
                <path d="M0 5.4v6.6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4L8.5 9.7a1 1 0 0 1-1 0L0 5.4Z" />
              </svg>
            </a>
          </li>
          <li>
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
          </li>
          <li>
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
          </li>
        </ul>
      </nav>
    </footer>
  );
}
