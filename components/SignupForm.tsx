"use client";

import { useEffect, useRef, useState } from "react";
import { emit } from "@/lib/bus";
import { SITE } from "@/lib/site";

// Форматы игр клуба. Описания — заглушки, поправьте под свои правила.
const GAMES = [
  { id: "classic", name: "Классик Техас Холдем", note: "Классический турнир: играем, пока все фишки не соберёт один игрок" },
  { id: "pko", name: "Progressive Knockout", note: "За каждого выбитого соперника — бонусные очки, и с каждым разом их больше" },
];

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // запасной путь для старых браузеров и страниц без HTTPS
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function SignupForm() {
  const [game, setGame] = useState("classic");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{ name?: string; username?: string }>({});
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nick = username.trim().replace(/^@+/, "");
    const err: typeof errors = {};
    if (name.trim().length < 2) err.name = "Как к вам обращаться?";
    if (!/^[A-Za-z0-9_]{4,32}$/.test(nick)) err.username = "Ник в Telegram: латиница, цифры и _";
    setErrors(err);
    if (Object.keys(err).length) return;

    const g = GAMES.find((x) => x.id === game)!;
    const message = `Здравствуйте! Хочу записаться на игру.\nФормат: ${g.name}\nИмя: ${name.trim()}\nTelegram: @${nick}`;
    // Открываем личку менеджера с уже набранным сообщением — игроку остаётся нажать «Отправить».
    window.open(`https://t.me/${SITE.managerTelegram}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    emit("burst");
  };

  const copyPhone = async () => {
    if (!(await copyText(SITE.phone))) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <form className="signup" noValidate onSubmit={submit}>
      <fieldset className="games">
        <legend className="field-label">Формат игры</legend>
        {GAMES.map((g) => (
          <label key={g.id} className={`game ${game === g.id ? "game-on" : ""}`}>
            <input type="radio" name="game" value={g.id} checked={game === g.id} onChange={() => setGame(g.id)} />
            <span className="game-what">
              <b>{g.name}</b>
              {g.note}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="fields">
        <label className="field">
          <span className="field-label">Имя</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
            aria-invalid={!!errors.name}
            placeholder="Алексей"
          />
          {errors.name && <em className="field-error">{errors.name}</em>}
        </label>
        <label className="field">
          <span className="field-label">Ник в Telegram</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={!!errors.username}
            placeholder="@username"
          />
          {errors.username && <em className="field-error">{errors.username}</em>}
        </label>
      </div>

      <div className="signup-actions">
        <button type="submit" className="btn btn-primary btn-big">
          Написать менеджеру <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="btn phone" onClick={copyPhone} aria-live="polite">
          {SITE.phone}
          <small>{copied ? "Скопировано" : "Нажмите, чтобы скопировать"}</small>
        </button>
      </div>
    </form>
  );
}
