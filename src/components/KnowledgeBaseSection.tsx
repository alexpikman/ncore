import { useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { Download, LogIn, LogOut, Plus, Search } from 'lucide-react';
import { CATEGORY_LABELS, STATUS_LABELS } from '../data/conceptData';
import type { EntryCategory, PortalEntry } from '../types/portal';

interface KnowledgeBaseSectionProps {
  entries: PortalEntry[];
  user: User | null;
  authLoading: boolean;
  isAdmin: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onNewEntry: () => void;
  onSelectEntry: (entry: PortalEntry) => void;
  onExportPortal: () => void;
}

const FILTER_OPTIONS: { id: 'all' | EntryCategory; label: string }[] = [
  { id: 'all', label: 'Все материалы' },
  { id: 'concept', label: 'Концепция' },
  { id: 'network', label: 'Сеть и узлы' },
  { id: 'simulator', label: 'Симулятор' },
  { id: 'ai', label: 'ИИ и знания' },
  { id: 'economy', label: 'Экономика' },
  { id: 'proposal', label: 'Предложения' },
];

export function KnowledgeBaseSection({
  entries,
  user,
  authLoading,
  isAdmin,
  onSignIn,
  onSignOut,
  onNewEntry,
  onSelectEntry,
  onExportPortal,
}: KnowledgeBaseSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | EntryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (onlyMine && user && item.authorId !== user.uid) return false;
      if (q) {
        const hay = `${item.title} ${item.summary} ${item.body} ${item.authorName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, categoryFilter, searchQuery, onlyMine, user]);

  return (
    <section id="knowledge-base" className="py-16 sm:py-20 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-2">
              База знаний и публикации
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#E6EDF7] text-balance">
              Живой архив материалов и развития проекта
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Здесь публикуются новые разделы, технические заметки, архитектурные решения и предложения сообщества. Все записи сохраняются в облачном хранилище и доступны для обсуждения.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onExportPortal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium bg-[#101726] border border-white/15 rounded-lg text-[#CBD5E1] hover:text-[#E6EDF7] hover:border-white/30 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Экспорт JSON
            </button>
            <button
              type="button"
              onClick={onNewEntry}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#22D3EE] text-[#090E1A] rounded-lg hover:bg-[#38BDF8] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Новая публикация
            </button>
          </div>
        </div>

        {/* Workspace Account & Search Toolbar */}
        <div className="bg-[#101726] border border-white/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по заголовкам, тексту и авторам..."
              aria-label="Поиск по базе знаний"
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#090E1A] border border-white/10 rounded-lg text-[#E6EDF7] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            {authLoading ? (
              <span className="text-[#94A3B8]">Проверка сессии...</span>
            ) : user ? (
              <>
                <label className="inline-flex items-center gap-2 text-[#CBD5E1] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyMine}
                    onChange={(e) => setOnlyMine(e.target.checked)}
                    className="rounded border-white/20 bg-[#090E1A] accent-[#22D3EE]"
                  />
                  Только мои записи
                </label>
                <span className="text-[#64748B]" aria-hidden="true">·</span>
                <span className="text-[#CBD5E1] truncate max-w-[180px]">
                  {user.displayName || user.email}
                  {isAdmin ? ' (Редактор)' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => void onSignOut()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#141D30] border border-white/10 rounded-lg text-[#94A3B8] hover:text-[#E6EDF7] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Выйти
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void onSignIn()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium bg-[#141D30] border border-white/15 rounded-lg text-[#E6EDF7] hover:border-[#22D3EE]/60 transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
                Войти через Google для публикаций
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101726] border border-white/10 rounded-xl overflow-x-auto mb-8">
          {FILTER_OPTIONS.map((opt) => {
            const active = categoryFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCategoryFilter(opt.id)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1A263D] text-[#E6EDF7]'
                    : 'text-[#94A3B8] hover:text-[#E6EDF7]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Entries Grid */}
        {filtered.length === 0 ? (
          <div className="bg-[#101726] border border-white/10 rounded-xl p-10 text-center">
            <p className="text-base font-medium text-[#E6EDF7] mb-2">
              Материалы по заданному фильтру не найдены
            </p>
            <p className="text-sm text-[#94A3B8] mb-5">
              Попробуйте изменить поисковый запрос или добавьте новую публикацию в выбранную категорию.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setSearchQuery('');
                setOnlyMine(false);
              }}
              className="px-4 py-2 text-xs font-medium bg-[#141D30] border border-white/15 rounded-lg text-[#E6EDF7] hover:border-[#22D3EE]/50 cursor-pointer"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="bg-[#101726] border border-white/10 hover:border-[#22D3EE]/40 rounded-xl p-6 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3 flex-wrap">
                    <span className="text-[#22D3EE] font-medium">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{STATUS_LABELS[entry.status]}</span>
                    {entry.visibility === 'private' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#FBBF24]">Приватный черновик</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-[#E6EDF7] leading-snug mb-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectEntry(entry)}
                      className="text-left hover:text-[#22D3EE] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
                    >
                      {entry.title}
                    </button>
                  </h3>

                  <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3">
                    {entry.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs text-[#64748B]">
                  <span className="truncate">{entry.authorName}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="tabular-nums">
                      {new Date(entry.updatedAtMs).toLocaleDateString('ru-RU')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectEntry(entry)}
                      className="font-medium text-[#22D3EE] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Читать
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
