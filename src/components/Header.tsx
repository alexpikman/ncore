interface HeaderProps {
  onSelectEconomy: () => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  onEnterGame: () => void;
}

export function Header({ onSelectEconomy, isAuthenticated, authLoading, onEnterGame }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090E1A]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1200px] mx-auto h-full px-5 sm:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-base font-extrabold tracking-[0.14em] text-[#E6EDF7] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] rounded"
        >
          NETWORK <span className="text-[#22D3EE]">CORE</span>
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Основная навигация"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#94A3B8]"
        >
          <a
            href="#concept"
            className="hover:text-[#E6EDF7] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Концепция
          </a>
          <a
            href="#knowledge-base"
            className="hover:text-[#E6EDF7] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Публикации
          </a>
          <a
            href="#concept"
            onClick={onSelectEconomy}
            className="hover:text-[#E6EDF7] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Экономика
          </a>
          <a
            href="#roadmap"
            className="hover:text-[#E6EDF7] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Дорожная карта
          </a>
          <a
            href="#reference"
            className="hover:text-[#E6EDF7] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Справочник
          </a>
        </nav>

        {/* Zone 3: 1 primary CTA action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onEnterGame}
            disabled={authLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#090E1A] bg-[#22D3EE] rounded-lg hover:bg-[#38BDF8] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090E1A]"
          >
            {authLoading ? 'Проверка...' : isAuthenticated ? 'Открыть игру' : 'Войти'}
          </button>
        </div>
      </div>
    </header>
  );
}
