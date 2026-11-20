import { useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import {
  BASELINE_GLOSSARY,
  GLOSSARY_DOMAIN_LABELS,
  MVP_SCOPE,
  REFERENCE_GROUPS,
  ROADMAP_PHASES,
} from '../data/conceptData';
import { isAdminUser } from '../lib/firebase';
import {
  deleteGlossaryTerm,
  deleteRoadmapItem,
  updateRoadmapItemState,
} from '../services/portalService';
import type {
  GlossaryDomain,
  GlossaryTerm,
  RoadmapItem,
  RoadmapPhaseId,
  RoadmapState,
} from '../types/portal';

interface RoadmapAndReferenceProps {
  roadmapItems: RoadmapItem[];
  glossaryTerms: GlossaryTerm[];
  user: User | null;
  onAddRoadmapItem: (phaseId: RoadmapPhaseId) => void;
  onAddGlossaryTerm: () => void;
}

const ROADMAP_STATE_LABELS: Record<RoadmapState, string> = {
  planned: 'Запланировано',
  in_progress: 'В работе',
  done: 'Готово',
};

const NEXT_STATE: Record<RoadmapState, RoadmapState> = {
  planned: 'in_progress',
  in_progress: 'done',
  done: 'planned',
};

export function RoadmapAndReference({
  roadmapItems,
  glossaryTerms,
  user,
  onAddRoadmapItem,
  onAddGlossaryTerm,
}: RoadmapAndReferenceProps) {
  const [glossarySearch, setGlossarySearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<'all' | GlossaryDomain>('all');

  const admin = isAdminUser(user);

  const combinedGlossary = useMemo(() => {
    const all = [...glossaryTerms, ...BASELINE_GLOSSARY];
    const q = glossarySearch.trim().toLowerCase();
    return all.filter((item) => {
      if (domainFilter !== 'all' && item.domain !== domainFilter) return false;
      if (q) {
        const text = `${item.term} ${item.definition}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [glossaryTerms, glossarySearch, domainFilter]);

  return (
    <>
      {/* Roadmap Section */}
      <section id="roadmap" className="py-16 sm:py-20 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-2">
                План развития портала и системы
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#E6EDF7] text-balance">
                Дорожная карта: от информационного ядра к рабочей сети
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                Переход к следующему этапу определяется не календарём, а работающими критериями приёмки. В любую фазу можно добавлять конкретные задачи дальнейшего развития.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddRoadmapItem('phase1')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#101726] border border-white/15 rounded-lg text-[#E6EDF7] hover:border-[#22D3EE]/50 hover:text-[#22D3EE] transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Добавить задачу развития
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROADMAP_PHASES.map((phase) => {
              const customItems = roadmapItems.filter((r) => r.phaseId === phase.id);
              return (
                <div
                  key={phase.id}
                  className="bg-[#101726] border border-white/10 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: phase.accent }}
                      >
                        {phase.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAddRoadmapItem(phase.id)}
                        aria-label={`Добавить задачу в ${phase.title}`}
                        className="text-xs text-[#94A3B8] hover:text-[#22D3EE] transition-colors cursor-pointer"
                      >
                        + Задача
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-[#E6EDF7] mb-3">{phase.title}</h3>
                    <ul className="space-y-1.5 text-sm text-[#CBD5E1] mb-4">
                      {phase.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>

                    {customItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
                        <p className="text-xs font-medium text-[#22D3EE]">
                          Добавленные задачи ({customItems.length})
                        </p>
                        {customItems.map((ci) => {
                          const canEdit = user && (admin || user.uid === ci.authorId);
                          return (
                            <div
                              key={ci.id}
                              className="bg-[#090E1A] border border-white/10 rounded-lg p-3 text-xs space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-[#E6EDF7]">{ci.title}</span>
                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => void deleteRoadmapItem(ci.id)}
                                    aria-label={`Удалить ${ci.title}`}
                                    className="text-[#64748B] hover:text-[#F87171] shrink-0 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-[#94A3B8] leading-relaxed">{ci.description}</p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[#64748B]">{ci.authorName}</span>
                                {canEdit ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateRoadmapItemState(ci.id, NEXT_STATE[ci.state])
                                    }
                                    className="font-mono text-[#22D3EE] hover:underline cursor-pointer"
                                  >
                                    {ROADMAP_STATE_LABELS[ci.state]}
                                  </button>
                                ) : (
                                  <span className="font-mono text-[#94A3B8]">
                                    {ROADMAP_STATE_LABELS[ci.state]}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <p className="mt-4 pt-3 border-t border-white/10 text-xs text-[#64748B]">
                    {phase.criterion}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
              <h3 className="text-base font-bold text-[#34D399] mb-3">
                Включить в первый интерактивный релиз
              </h3>
              <ul className="space-y-2 text-sm text-[#CBD5E1]">
                {MVP_SCOPE.include.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>
            <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
              <h3 className="text-base font-bold text-[#F87171] mb-3">
                Не включать без отдельного аудита
              </h3>
              <ul className="space-y-2 text-sm text-[#CBD5E1]">
                {MVP_SCOPE.exclude.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reference Desk: Glossary & Technical Sources */}
      <section id="reference" className="py-16 sm:py-20 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 space-y-14">
          {/* Glossary */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
              <div className="max-w-2xl">
                <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-2">
                  Справочник проекта
                </p>
                <h2 className="text-2xl sm:text-4xl font-bold text-[#E6EDF7]">
                  Глоссарий терминов
                </h2>
              </div>
              <button
                type="button"
                onClick={onAddGlossaryTerm}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#101726] border border-white/15 rounded-lg text-[#E6EDF7] hover:border-[#22D3EE]/50 hover:text-[#22D3EE] transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Добавить термин
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Найти термин..."
                  aria-label="Поиск по глоссарию"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#101726] border border-white/10 rounded-lg text-[#E6EDF7] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#101726] border border-white/10 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDomainFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer ${
                    domainFilter === 'all' ? 'bg-[#1A263D] text-[#E6EDF7]' : 'text-[#94A3B8]'
                  }`}
                >
                  Все
                </button>
                {(Object.keys(GLOSSARY_DOMAIN_LABELS) as GlossaryDomain[]).map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => setDomainFilter(dom)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer ${
                      domainFilter === dom ? 'bg-[#1A263D] text-[#E6EDF7]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {GLOSSARY_DOMAIN_LABELS[dom]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combinedGlossary.map((item) => {
                const canDelete =
                  !item.isBaseline && user && (admin || user.uid === item.authorId);
                return (
                  <div
                    key={item.id}
                    className="bg-[#101726] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <h3 className="text-base font-bold text-[#E6EDF7]">{item.term}</h3>
                        <div className="flex items-center gap-2 text-xs text-[#64748B] shrink-0">
                          <span>{GLOSSARY_DOMAIN_LABELS[item.domain]}</span>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void deleteGlossaryTerm(item.id)}
                              aria-label={`Удалить термин ${item.term}`}
                              className="text-[#64748B] hover:text-[#F87171] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-[#94A3B8] leading-relaxed">{item.definition}</p>
                    </div>
                    {!item.isBaseline && (
                      <p className="text-xs text-[#64748B] pt-2 border-t border-white/5">
                        Добавил: {item.authorName}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical References */}
          <div className="pt-8 border-t border-white/10">
            <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
              Технические справочники и первоисточники
            </h3>
            <p className="text-sm text-[#94A3B8] max-w-3xl mb-6 leading-relaxed">
              Отправные точки для проектирования. Каждая технология оценивается по требованиям, угрозам, лицензии, зрелости и стоимости эксплуатации.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {REFERENCE_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className="bg-[#101726] border border-white/10 rounded-xl p-6"
                >
                  <h4 className="text-base font-bold text-[#E6EDF7] mb-4">{group.title}</h4>
                  <ul className="space-y-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#22D3EE] hover:underline"
                        >
                          {link.label}
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{link.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
