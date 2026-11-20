import { useState } from 'react';
import type { User } from 'firebase/auth';
import { Plus, Trash2 } from 'lucide-react';
import { isAdminUser } from '../lib/firebase';
import {
  ADDENDUM_KIND_LABELS,
  AI_KNOWLEDGE_FLOW,
  AI_PILLARS,
  GAME_CYCLE,
  GAME_MISSIONS,
  GOVERNANCE_PILLARS,
  LEDGER_COMPARISON,
  MARKETPLACE_TIERS,
  NETWORK_LAYERS,
  NETWORK_TECHNOLOGIES,
  PROTOCOL_CHECKS,
  PROTOCOL_LIFECYCLE,
  REVENUE_ALLOCATION,
  SAFETY_PRINCIPLES,
  SECTION_LABELS,
  TECH_STACK,
  VISION_CARDS,
} from '../data/conceptData';
import type { ConceptAddendum, ConceptSectionId } from '../types/portal';
import {
  AiOrchestratorDiagram,
  NetworkLayersDiagram,
  ServerAssemblyDiagram,
  SystemArchitectureDiagram,
} from './NetworkDiagrams';

export type ChapterKey =
  | 'vision_game'
  | 'network_protocols'
  | 'ai_ledger'
  | 'economy_market'
  | 'arch_safety';

interface ChapterMeta {
  key: ChapterKey;
  label: string;
  sectionIds: ConceptSectionId[];
  defaultSection: ConceptSectionId;
}

const CHAPTERS: ChapterMeta[] = [
  {
    key: 'vision_game',
    label: '01. Видение и симулятор',
    sectionIds: ['vision', 'game'],
    defaultSection: 'vision',
  },
  {
    key: 'network_protocols',
    label: '02. Сеть и протоколы',
    sectionIds: ['network', 'protocols'],
    defaultSection: 'network',
  },
  {
    key: 'ai_ledger',
    label: '03. ИИ и реестр',
    sectionIds: ['ai', 'ledger'],
    defaultSection: 'ai',
  },
  {
    key: 'economy_market',
    label: '04. Экономика и рынок',
    sectionIds: ['economy', 'market'],
    defaultSection: 'economy',
  },
  {
    key: 'arch_safety',
    label: '05. Архитектура и защита',
    sectionIds: ['architecture', 'security', 'governance'],
    defaultSection: 'architecture',
  },
];

interface ConceptExplorerProps {
  activeChapter: ChapterKey;
  onSelectChapter: (chapter: ChapterKey) => void;
  addenda: ConceptAddendum[];
  user: User | null;
  onAddAddendum: (sectionId: ConceptSectionId) => void;
  onDeleteAddendum: (addendumId: string) => Promise<void>;
}

export function ConceptExplorer({
  activeChapter,
  onSelectChapter,
  addenda,
  user,
  onAddAddendum,
  onDeleteAddendum,
}: ConceptExplorerProps) {
  const [hypotheticalRevenue, setHypotheticalRevenue] = useState<number>(10000);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentChapter = CHAPTERS.find((c) => c.key === activeChapter) ?? CHAPTERS[0];
  const chapterAddenda = addenda.filter((a) =>
    currentChapter.sectionIds.includes(a.sectionId),
  );
  const admin = isAdminUser(user);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteAddendum(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="concept" className="py-16 sm:py-20 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-2">
              Архитектура концепции
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#E6EDF7] text-balance">
              Как устроена экосистема NETWORK CORE
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Полный разбор концепции разбит на пять инженерных глав. В любой раздел можно добавить авторское дополнение, архитектурную заметку или предложение по развитию.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAddAddendum(currentChapter.defaultSection)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#101726] border border-white/15 rounded-lg text-[#E6EDF7] hover:border-[#22D3EE]/50 hover:text-[#22D3EE] transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Дополнить раздел
          </button>
        </div>

        {/* Interactive Chapter Filter Bar */}
        <div
          role="tablist"
          aria-label="Разделы концепции"
          className="flex items-center gap-1.5 p-1.5 bg-[#101726] border border-white/10 rounded-xl overflow-x-auto mb-10"
        >
          {CHAPTERS.map((ch) => {
            const isActive = ch.key === activeChapter;
            const count = addenda.filter((a) => ch.sectionIds.includes(a.sectionId)).length;
            return (
              <button
                key={ch.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectChapter(ch.key)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1A263D] text-[#E6EDF7] border border-white/10'
                    : 'text-[#94A3B8] hover:text-[#E6EDF7] border border-transparent'
                }`}
              >
                {ch.label}
                {count > 0 && (
                  <span className="ml-2 font-mono text-xs text-[#22D3EE] tabular-nums">
                    +{count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chapter 01: Vision & Simulator */}
        {activeChapter === 'vision_game' && (
          <div className="space-y-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
                Не игра вокруг сети. Игра как способ построить сеть.
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] max-w-3xl leading-relaxed mb-7">
                В привычной игре пользователь потребляет заранее созданный контент. В NETWORK CORE он получает инструменты, чтобы создавать инфраструктуру, знания, протоколы, автоматизацию и сервисы, которые могут быть полезны за пределами игрового мира.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {VISION_CARDS.map((card) => (
                  <div
                    key={card.index}
                    className="bg-[#101726] border border-white/10 rounded-xl p-6"
                  >
                    <p className="font-mono text-xs text-[#22D3EE] mb-2 tabular-nums">
                      {card.index}
                    </p>
                    <h4 className="text-lg font-semibold text-[#E6EDF7] mb-2">
                      {card.title}
                    </h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-[#101726] border border-white/10 rounded-xl p-5 text-sm text-[#CBD5E1] leading-relaxed">
                <strong className="text-[#E6EDF7]">Большая идея:</strong> превратить интерес к программированию, сетям и искусственному интеллекту в коллективный процесс создания открытой инфраструктуры. Не обещать магическую «неотключаемость», а инженерно повышать устойчивость за счёт независимых узлов, репликации, открытых протоколов и отсутствия единственной точки отказа.
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <ServerAssemblyDiagram />
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#22D3EE] mb-2">
                    Виртуальная лаборатория
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
                    Сборка узла из компонентов
                  </h3>
                  <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-5">
                    Первый пользовательский опыт — не настройка сложного реального сервера, а понятная инженерная игра. CPU, RAM, NVMe, GPU, сетевые карты, охлаждение и энергопотребление формируют характеристики виртуального узла. Система проверяет совместимость и рассчитывает стоимость.
                  </p>
                  <ul className="space-y-2.5 text-sm text-[#CBD5E1]">
                    <li>• Анимация и логика установки совместимых комплектующих.</li>
                    <li>• Тест запуска, проверка шин и первичная диагностика.</li>
                    <li>• Назначение виртуального адреса и подключение к узлам сети.</li>
                    <li>• Апгрейды, тепловые ограничения и регламентное обслуживание.</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {GAME_CYCLE.map((c) => (
                  <div
                    key={c.step}
                    className="bg-[#101726] border border-white/10 rounded-xl p-5"
                  >
                    <p className="font-mono text-2xl font-bold text-[#22D3EE] tabular-nums mb-1">
                      {c.step}
                    </p>
                    <h4 className="text-base font-semibold text-[#E6EDF7] mb-1">
                      {c.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 overflow-x-auto bg-[#101726] border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#141D30]">
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Задание
                      </th>
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Навык
                      </th>
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Критерий завершения
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm">
                    {GAME_MISSIONS.map((m) => (
                      <tr key={m.task} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-5 font-medium text-[#E6EDF7]">{m.task}</td>
                        <td className="py-3.5 px-5 text-[#94A3B8]">{m.skill}</td>
                        <td className="py-3.5 px-5 text-[#CBD5E1]">{m.criteria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Chapter 02: Network & Protocols */}
        {activeChapter === 'network_protocols' && (
          <div className="space-y-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
                От виртуальных узлов — к реальной распределённой инфраструктуре
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] max-w-3xl leading-relaxed mb-7">
                Сеть развивается поэтапно. Сначала все узлы существуют в симуляции. Затем участники подключают реальные устройства через ограниченный и проверяемый клиент. Физические ресурсы не смешиваются с игровой средой без явного согласия владельца.
              </p>

              <NetworkLayersDiagram />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                {NETWORK_LAYERS.map((nl) => (
                  <div key={nl.id} className="bg-[#101726] border border-white/10 rounded-xl p-6">
                    <p className="text-xs font-medium text-[#22D3EE] mb-1.5">{nl.layer}</p>
                    <h4 className="text-lg font-semibold text-[#E6EDF7] mb-2">{nl.title}</h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed mb-3">{nl.summary}</p>
                    <p className="text-xs text-[#64748B]">{nl.details}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-[#1A1610] border border-[#FBBF24]/25 rounded-xl p-5 text-sm text-[#E2D5B5] leading-relaxed">
                <strong className="text-[#FBBF24]">Про порты 80/443 и устойчивость без мифов:</strong> ни P2P, ни блокчейн не делают сеть физически неотключаемой. Порты 80/443 — это распространённые порты веб-трафика, а не гарантия доступности. Архитектура должна поддерживать несколько легитимных транспортов, но строиться на прозрачной работе, согласии владельцев узлов и соблюдении законов.
              </div>

              <div className="mt-8 overflow-x-auto bg-[#101726] border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#141D30]">
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Технология
                      </th>
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Роль в проекте
                      </th>
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Инженерная оговорка
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm">
                    {NETWORK_TECHNOLOGIES.map((t) => (
                      <tr key={t.tech} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-5 font-mono text-xs text-[#22D3EE]">{t.tech}</td>
                        <td className="py-3.5 px-5 text-[#E6EDF7]">{t.role}</td>
                        <td className="py-3.5 px-5 text-[#94A3B8]">{t.caveat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#22D3EE] mb-2">
                  Protocol Studio
                </p>
                <h4 className="text-lg font-bold text-[#E6EDF7] mb-5">
                  Жизненный цикл разработки протоколов
                </h4>
                <ol className="space-y-4">
                  {PROTOCOL_LIFECYCLE.map((step, idx) => (
                    <li key={step.stage} className="flex items-start gap-3.5">
                      <span className="font-mono text-xs font-semibold text-[#22D3EE] bg-[#14253B] border border-[#22D3EE]/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 tabular-nums">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#E6EDF7]">{step.stage}</p>
                        <p className="text-xs sm:text-sm text-[#94A3B8]">{step.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-[#101726] border border-white/10 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#22D3EE] mb-2">
                    Критерии аудита
                  </p>
                  <h4 className="text-lg font-bold text-[#E6EDF7] mb-4">Что проверяем перед выпуском</h4>
                  <ul className="space-y-2 text-sm text-[#CBD5E1]">
                    {PROTOCOL_CHECKS.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-[#FBBF24] leading-relaxed">
                  Нельзя объявлять собственный алгоритм шифрования безопасным только потому, что его одобрил ИИ или большинство игроков. Криптография требует открытой спецификации и независимого анализа.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapter 03: AI & Ledger */}
        {activeChapter === 'ai_ledger' && (
          <div className="space-y-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
                ИИ, который растёт вместе с библиотекой сообщества
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] max-w-3xl leading-relaxed mb-7">
                Не одна всемогущая нейросеть, а экостема специализированных агентов, которые используют проверенные документы, инструменты, навыки и модели разных поставщиков.
              </p>

              <AiOrchestratorDiagram />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                {AI_PILLARS.map((pillar) => (
                  <div key={pillar.title} className="bg-[#101726] border border-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[#E6EDF7] mb-2">{pillar.title}</h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{pillar.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-[#101726] border border-white/10 rounded-xl p-6">
                <h4 className="text-base font-bold text-[#E6EDF7] mb-4">
                  Как знание попадает к агентам
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {AI_KNOWLEDGE_FLOW.map((item, idx) => (
                    <div key={item.step} className="pt-3 border-t border-white/10">
                      <p className="font-mono text-xs text-[#22D3EE] tabular-nums mb-1">
                        0{idx + 1}
                      </p>
                      <p className="text-sm font-semibold text-[#E6EDF7] mb-1">{item.step}</p>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 pt-4 border-t border-white/10 text-xs sm:text-sm text-[#CBD5E1]">
                  «Саморазвитие» здесь означает управляемое накопление знаний, проверенных инструментов и улучшений — не бесконтрольное изменение весов модели и не право ИИ самостоятельно менять production-инфраструктуру.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
                Распределённая история и доказуемое авторство
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] max-w-3xl leading-relaxed mb-6">
                Не все данные должны копироваться на каждый узел. Реестр хранит доказательства событий и контрольные суммы, а большие данные живут в специализированных хранилищах.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-[#E6EDF7] mb-3">В реестре событий</h4>
                  <ul className="space-y-2 text-sm text-[#CBD5E1]">
                    {LEDGER_COMPARISON.inRegistry.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-[#E6EDF7] mb-3">В профильных хранилищах</h4>
                  <ul className="space-y-2 text-sm text-[#CBD5E1]">
                    {LEDGER_COMPARISON.inStorage.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-xs sm:text-sm text-[#94A3B8]">
                На раннем этапе достаточно append-only журнала с цифровыми подписями и хеш-связью; распределённый консенсус добавляется только при доказанной необходимости.
              </p>
            </div>
          </div>
        )}

        {/* Chapter 04: Economy & Market */}
        {activeChapter === 'economy_market' && (
          <div id="economy" className="space-y-10">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
                Экономика, в которой ценится проверенный вклад
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] max-w-3xl leading-relaxed mb-7">
                Внутренняя валюта мотивирует участие в симуляторе. Реальные выплаты — отдельный финансовый процесс, зависящий от фактически полученной выручки, подтверждённого вклада, законодательства и платёжной инфраструктуры.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#FBBF24] mb-1">
                    Внутренний токен симулятора
                  </p>
                  <h4 className="text-lg font-bold text-[#E6EDF7]">COIN</h4>
                  <p className="font-mono text-3xl font-bold text-[#FBBF24] tabular-nums my-3">
                    12 450
                  </p>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Демонстрационный баланс участника. COIN используется внутри продукта: улучшение виртуальных серверов, покупка игровых ресурсов, открытие инструментов и миссии. Не является денежным обещанием.
                  </p>
                </div>

                <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#34D399] mb-1">
                    Реальная экономика (пример модели)
                  </p>
                  <h4 className="text-lg font-bold text-[#E6EDF7]">Фонд вознаграждений</h4>
                  <p className="font-mono text-3xl font-bold text-[#34D399] tabular-nums my-3">
                    €{hypotheticalRevenue.toLocaleString('ru-RU')}
                  </p>
                  <label className="block text-xs text-[#94A3B8] mb-2" htmlFor="revenue-slider">
                    Смоделировать месячную чистую выручку (EUR):
                  </label>
                  <input
                    id="revenue-slider"
                    type="range"
                    min={2000}
                    max={100000}
                    step={1000}
                    value={hypotheticalRevenue}
                    onChange={(e) => setHypotheticalRevenue(Number(e.target.value))}
                    className="w-full accent-[#22D3EE] cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-6 bg-[#101726] border border-white/10 rounded-xl p-6">
                <h4 className="text-base font-bold text-[#E6EDF7] mb-4">
                  Иллюстративная модель распределения чистой выручки
                </h4>
                <div className="space-y-3.5">
                  {REVENUE_ALLOCATION.map((row) => {
                    const eur = Math.round((hypotheticalRevenue * row.percent) / 100);
                    return (
                      <div
                        key={row.label}
                        className="grid grid-cols-[130px_1fr_110px] items-center gap-4 text-sm"
                      >
                        <span className="font-medium text-[#E6EDF7]">{row.label}</span>
                        <div className="h-2.5 bg-[#1A263D] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.percent}%`, backgroundColor: row.color }}
                          />
                        </div>
                        <span className="font-mono text-xs sm:text-sm text-right text-[#CBD5E1] tabular-nums">
                          {row.percent}% · €{eur.toLocaleString('ru-RU')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-5 text-xs text-[#64748B] leading-relaxed">
                  До расчёта «чистой выручки» определяются налоги, комиссии, возвраты, операционные расходы и резервы. COIN и право на реальные выплаты проектируются раздельно с соблюдением применимого законодательства (AML/KYC при необходимости).
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-5">
                Маркетплейс: задачи, разработки и реальные заказы
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {MARKETPLACE_TIERS.map((tier) => (
                  <div key={tier.title} className="bg-[#101726] border border-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[#E6EDF7] mb-2">{tier.title}</h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{tier.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chapter 05: Architecture, Safety & Governance */}
        {activeChapter === 'arch_safety' && (
          <div className="space-y-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-3">
                Модульная архитектура вместо одного монолита
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] max-w-3xl leading-relaxed mb-7">
                Систему необходимо разделить на контуры. Игровой backend не должен иметь прямого административного доступа к компьютерам участников. ИИ не должен самостоятельно менять production-конфигурации.
              </p>

              <SystemArchitectureDiagram />

              <div className="mt-8 overflow-x-auto bg-[#101726] border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#141D30]">
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Область
                      </th>
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Кандидаты
                      </th>
                      <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Обоснование
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm">
                    {TECH_STACK.map((row) => (
                      <tr key={row.area} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-5 font-medium text-[#E6EDF7]">{row.area}</td>
                        <td className="py-3.5 px-5 font-mono text-xs text-[#22D3EE]">{row.candidates}</td>
                        <td className="py-3.5 px-5 text-[#94A3B8]">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-5">
                Безопасность как свойство архитектуры
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SAFETY_PRINCIPLES.map((item) => (
                  <div key={item.title} className="bg-[#101726] border border-white/10 rounded-xl p-6">
                    <h4 className="text-base font-semibold text-[#E6EDF7] mb-2">{item.title}</h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] mb-5">
                Правила управления и развития
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {GOVERNANCE_PILLARS.map((item) => (
                  <div key={item.title} className="bg-[#101726] border border-white/10 rounded-xl p-6">
                    <h4 className="text-base font-semibold text-[#E6EDF7] mb-2">{item.title}</h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Concept Addenda attached to current chapter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-[#E6EDF7]">
                Дополнения к разделу ({chapterAddenda.length})
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Заметки, уточнения и предложения, добавленные участниками в текущую главу концепции.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddAddendum(currentChapter.defaultSection)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#141D30] border border-white/10 rounded-lg text-[#E6EDF7] hover:border-[#22D3EE]/50 transition-colors whitespace-nowrap shrink-0 self-start cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Добавить заметку в главу
            </button>
          </div>

          {chapterAddenda.length === 0 ? (
            <div className="bg-[#101726] border border-white/10 rounded-xl p-6 text-sm text-[#94A3B8]">
              В этой главе пока нет пользовательских дополнений. Вы можете первым добавить заметку, архитектурное уточнение или описание рисков.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {chapterAddenda.map((item) => {
                const canDelete = user && (admin || user.uid === item.authorId);
                return (
                  <article
                    key={item.id}
                    className="bg-[#101726] border border-white/10 rounded-xl p-6 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8] flex-wrap">
                          <span className="text-[#22D3EE] font-medium">
                            {ADDENDUM_KIND_LABELS[item.kind]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{SECTION_LABELS[item.sectionId]}</span>
                          {item.visibility === 'private' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#FBBF24]">Черновик</span>
                            </>
                          )}
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => void handleDelete(item.id)}
                            aria-label={`Удалить дополнение ${item.title}`}
                            className="p-1.5 text-[#94A3B8] hover:text-[#F87171] rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <h4 className="text-base font-semibold text-[#E6EDF7] mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/10 text-xs text-[#64748B] flex items-center justify-between">
                      <span>{item.authorName}</span>
                      <span className="tabular-nums">
                        {new Date(item.createdAtMs).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
