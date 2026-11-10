import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="header">
      <a href="#top" className="brand">
        <span className="brand-mark" aria-hidden="true">
          ♠
        </span>
        {SITE.name}
      </a>

      <nav className="nav" aria-label="Разделы">
        <a href="#nocash">О клубе</a>
        <a href="#format">Формат</a>
        <a href="#menu">Меню</a>
      </nav>

      <a href="#signup" className="btn btn-primary">
        Записаться
      </a>
    </header>
  );
}
