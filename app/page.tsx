import Header from "@/components/Header";
import Scene from "@/components/Scene";
import SignupForm from "@/components/SignupForm";
import { SITE } from "@/lib/site";

// Тексты, меню и цены ниже — заглушки для макета. Замените на реальные.
const STEPS = [
  { n: "01", title: "Записываетесь", text: "Выбираете вечер и оставляете контакт. Мест за столами ограниченное число." },
  { n: "02", title: "Получаете стек", text: "У всех игроков одинаковый стартовый набор турнирных фишек." },
  { n: "03", title: "Играете турнир", text: "Техасский холдем с дилером и блайндами по таймеру. Выбыли — можно остаться в зале." },
  { n: "04", title: "Растёте в рейтинге", text: "За каждое место начисляются очки. Таблица сезона обновляется после каждой игры." },
];

const MENU = [
  {
    title: "Напитки",
    items: [
      ["Фильтр-кофе", "250 ₽"],
      ["Капучино", "320 ₽"],
      ["Чай в чайнике", "400 ₽"],
      ["Домашний лимонад", "380 ₽"],
      ["Безалкогольный спритц", "450 ₽"],
    ],
  },
  {
    title: "К столу",
    items: [
      ["Клаб-сэндвич", "590 ₽"],
      ["Брускетты, сет из трёх", "520 ₽"],
      ["Картофель с трюфельным соусом", "390 ₽"],
      ["Сырная тарелка", "690 ₽"],
      ["Орехи и оливки", "350 ₽"],
    ],
  },
];

export default function Home() {
  return (
    <main className="page" id="top">
      <Scene />
      <Header />

      <div className="story">
        {/* Заставка */}
        <section className="hero" data-cue="hero">
          <div className="hero-copy">
            <p className="eyebrow">{SITE.tagline}</p>
            <h1 className="hero-title">{SITE.name}</h1>
            <p className="hero-lead">
              Турнирный холдем как спорт: стратегия, рейтинг и живая игра за одним столом. Без денежных ставок.
            </p>
            <a href="#signup" className="btn btn-primary btn-big">
              Записаться на игру <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="scroll-hint" data-hint>
            <span>Листайте</span>
            <i />
          </div>
        </section>

        {/* 3D-сцена: фишки, короли, ALL-IN. Высота секции — длина «фильма». */}
        <section className="stage" data-cue="stage" aria-label="Раздача">
          <div className="stage-pin">
            <div className="cap" data-cap data-from="0.56" data-to="0.75">
              <h2>Два короля.</h2>
              <p>Вторая по силе стартовая рука в холдеме. Сыграть её правильно — уже мастерство.</p>
            </div>
            <div className="cap cap-allin" data-cap data-from="0.8" data-to="0.915">
              <h2>All-in.</h2>
              <p>Самое громкое слово за столом. На кону — только рейтинг.</p>
            </div>
          </div>
        </section>

        {/* Не на деньги */}
        <section className="panel panel-left" data-cue="nocash" id="nocash">
          <div className="panel-body">
            <p className="eyebrow" data-reveal>
              Главное правило
            </p>
            <h2 data-reveal>
              Игра идёт
              <br />
              не на деньги.
            </h2>
            <p className="lead" data-reveal>
              Спортивный покер — это турнир, а не казино. Фишки не имеют денежной стоимости: их нельзя купить, продать
              или обменять. Мы не принимаем ставки и не разыгрываем денежные призы.
            </p>
            <ul className="facts" data-reveal>
              <li>
                <b>0 ₽</b>
                <span>ставок за столом</span>
              </li>
              <li>
                <b>Рейтинг</b>
                <span>вместо банка</span>
              </li>
              <li>
                <b>18+</b>
                <span>вход для взрослых</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Формат */}
        <section className="panel panel-right" data-cue="format" id="format">
          <div className="panel-body">
            <p className="eyebrow" data-reveal>
              Как проходит вечер
            </p>
            <h2 data-reveal>Четыре шага от входа до финального стола.</h2>
            <ol className="steps">
              {STEPS.map((s) => (
                <li key={s.n} data-reveal>
                  <span className="step-n">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Меню */}
        <section className="panel panel-left" data-cue="menu" id="menu">
          <div className="panel-body panel-body-wide">
            <p className="eyebrow" data-reveal>
              Бар и кухня
            </p>
            <h2 data-reveal>Меню, которое не отвлекает от игры.</h2>
            <p className="lead" data-reveal>
              Всё подаётся прямо к столу и удобно есть одной рукой — вторая занята картами.
            </p>
            <div className="menu">
              {MENU.map((group) => (
                <div key={group.title} className="menu-group" data-reveal>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map(([name, price]) => (
                      <li key={name}>
                        <span>{name}</span>
                        <i />
                        <b>{price}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Запись */}
        <section className="panel panel-right" data-cue="signup" id="signup">
          <div className="panel-body">
            <p className="eyebrow" data-reveal>
              Запись на игру
            </p>
            <h2 data-reveal>Займите место за столом.</h2>
            <p className="lead" data-reveal>
              Выберите вечер, укажите имя и ник — кнопка откроет чат с менеджером с готовым сообщением. Опыт не
              обязателен: правила объясним.
            </p>
            <div data-reveal>
              <SignupForm />
            </div>
          </div>
        </section>

        <footer className="footer" data-cue="footer">
          <div className="footer-top">
            <div>
              <p className="footer-name">{SITE.name}</p>
              <p className="muted">{SITE.tagline}</p>
            </div>
            <dl className="footer-info">
              <div>
                <dt>Адрес</dt>
                <dd>
                  {SITE.city}, {SITE.address}
                </dd>
              </div>
              <div>
                <dt>Часы</dt>
                <dd>{SITE.hours}</dd>
              </div>
              <div>
                <dt>Связь</dt>
                <dd>
                  {SITE.phone} · {SITE.telegram}
                </dd>
              </div>
            </dl>
          </div>
          <p className="legal">
            Клуб не организует и не проводит азартные игры. Игра ведётся на турнирные фишки без денежного эквивалента,
            денежные ставки и выигрыши отсутствуют. 18+
          </p>
        </footer>
      </div>
    </main>
  );
}
