import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  BASELINE_ENTRIES,
  BASELINE_GLOSSARY,
  ROADMAP_PHASES,
} from './data/conceptData';
import {
  auth,
  isAdminUser,
  signInWithGoogle,
  signOutUser,
} from './lib/firebase';
import {
  subscribeAddenda,
  subscribeEntries,
  subscribeGlossary,
  subscribeRoadmapItems,
} from './services/portalService';
import type {
  ConceptAddendum,
  ConceptSectionId,
  EditorTab,
  GlossaryTerm,
  PortalEntry,
  RoadmapItem,
  RoadmapPhaseId,
} from './types/portal';
import { ConceptExplorer, type ChapterKey } from './components/ConceptExplorer';
import { EntryDetailDrawer } from './components/EntryDetailDrawer';
import { EntryEditorModal } from './components/EntryEditorModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { KnowledgeBaseSection } from './components/KnowledgeBaseSection';
import { HeroTopologyDiagram } from './components/NetworkDiagrams';
import { AnimatedNetworkSection } from './components/AnimatedNetworkSection';
import { Gameplay } from './Gameplay/Gameplay';
import { RoadmapAndReference } from './components/RoadmapAndReference';
import { deleteConceptAddendum } from './services/portalService';

function PortalContent() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<ChapterKey>('vision_game');
  const [activeView, setActiveView] = useState<'portal' | 'gameplay'>('portal');

  const [firestoreEntries, setFirestoreEntries] = useState<PortalEntry[]>([]);
  const [addenda, setAddenda] = useState<ConceptAddendum[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('entry');
  const [editorSectionId, setEditorSectionId] = useState<ConceptSectionId>('vision');
  const [editorPhaseId, setEditorPhaseId] = useState<RoadmapPhaseId>('phase1');
  const [editingEntry, setEditingEntry] = useState<PortalEntry | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubEntries = subscribeEntries(user, setFirestoreEntries);
    const unsubAddenda = subscribeAddenda(user, setAddenda);
    const unsubGlossary = subscribeGlossary(user, setGlossaryTerms);
    const unsubRoadmap = subscribeRoadmapItems(user, setRoadmapItems);

    return () => {
      unsubEntries();
      unsubAddenda();
      unsubGlossary();
      unsubRoadmap();
    };
  }, [user]);

  const allEntries = useMemo(
    () => [...firestoreEntries, ...BASELINE_ENTRIES],
    [firestoreEntries],
  );

  const selectedEntry = useMemo(
    () => allEntries.find((e) => e.id === selectedEntryId) ?? null,
    [allEntries, selectedEntryId],
  );

  const performSignIn = async (): Promise<boolean> => {
    setAuthNotice(null);
    try {
      await signInWithGoogle();
      return true;
    } catch (err) {
      setAuthNotice(
        err instanceof Error ? err.message : 'Не удалось выполнить вход через Google.',
      );
      return false;
    }
  };

  const handleSignIn = async () => {
    await performSignIn();
  };

  const handleEnterGame = async () => {
    if (user || await performSignIn()) {
      setActiveView('gameplay');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  const openEditorForTab = (
    tab: EditorTab,
    options?: { sectionId?: ConceptSectionId; phaseId?: RoadmapPhaseId; entry?: PortalEntry | null },
  ) => {
    setEditorTab(tab);
    setEditorSectionId(options?.sectionId ?? 'vision');
    setEditorPhaseId(options?.phaseId ?? 'phase1');
    setEditingEntry(options?.entry ?? null);
    setEditorOpen(true);
  };

  const handleExportPortal = () => {
    const payload = {
      project: 'NETWORK CORE (Ncore)',
      exportedAt: new Date().toISOString(),
      entries: allEntries,
      conceptAddenda: addenda,
      glossary: [...glossaryTerms, ...BASELINE_GLOSSARY],
      roadmap: {
        phases: ROADMAP_PHASES,
        customItems: roadmapItems,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-core-portal-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (activeView === 'gameplay' && user) {
    return <Gameplay key={user.uid} user={user} onExit={() => setActiveView('portal')} />;
  }

  return (
    <div id="top" className="min-h-screen bg-[#090E1A] text-[#E6EDF7] flex flex-col">
      <Header
        onSelectEconomy={() => setActiveChapter('economy_market')}
        isAuthenticated={Boolean(user)}
        authLoading={authLoading}
        onEnterGame={handleEnterGame}
      />

      {authNotice && (
        <div className="bg-[#1F141A] border-b border-[#F87171]/30 px-5 py-2.5 text-center text-xs text-[#FCA5A5]">
          {authNotice}
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-4">
                Открытая инфраструктура · Коллективный интеллект · Вклад участников
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.08] text-[#E6EDF7] text-balance mb-5">
                Сеть, которую{' '}
                <span className="text-[#22D3EE]">строят участники.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-xl mb-7">
                NETWORK CORE — концепция распределённой технологической экосистемы, где инженерная лаборатория превращается в реальную инфраструктуру, ИИ использует проверенные знания сообщества, а полезный вклад получает признание.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-7">
                <a
                  href="#concept"
                  className="px-5 py-2.5 text-sm font-semibold bg-[#22D3EE] text-[#090E1A] rounded-lg hover:bg-[#38BDF8] transition-colors whitespace-nowrap"
                >
                  Изучить концепцию
                </a>
                <a
                  href="#knowledge-base"
                  className="px-5 py-2.5 text-sm font-medium bg-[#101726] border border-white/15 text-[#E6EDF7] rounded-lg hover:border-[#22D3EE]/50 transition-colors whitespace-nowrap"
                >
                  Открыть публикации
                </a>
              </div>

              <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-2">
                <span>Информационный портал Ncore</span>
                <span aria-hidden="true">·</span>
                <span>Версия концепции 0.1</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  Материалов в базе: {allEntries.length}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <HeroTopologyDiagram />
            </div>
          </div>
        </section>

        <AnimatedNetworkSection />

        {/* Concept Explorer with 5 Chapters + Inline Addenda */}
        <ConceptExplorer
          activeChapter={activeChapter}
          onSelectChapter={setActiveChapter}
          addenda={addenda}
          user={user}
          onAddAddendum={(sectionId) => openEditorForTab('addendum', { sectionId })}
          onDeleteAddendum={deleteConceptAddendum}
        />

        {/* Living Knowledge Base & Publications */}
        <KnowledgeBaseSection
          entries={allEntries}
          user={user}
          authLoading={authLoading}
          isAdmin={isAdminUser(user)}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNewEntry={() => openEditorForTab('entry')}
          onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
          onExportPortal={handleExportPortal}
        />

        {/* Roadmap & Glossary / References */}
        <RoadmapAndReference
          roadmapItems={roadmapItems}
          glossaryTerms={glossaryTerms}
          user={user}
          onAddRoadmapItem={(phaseId) => openEditorForTab('roadmap', { phaseId })}
          onAddGlossaryTerm={() => openEditorForTab('glossary')}
        />

        {/* The Long Game Summary */}
        <section className="py-16 sm:py-20 border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl mb-8">
              <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-2">
                Дальнейшее развитие
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#E6EDF7] text-balance mb-3">
                Большой проект начинается с работающего ядра
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                Возможность NETWORK CORE не в том, чтобы за один запуск заменить интернет, а в том, чтобы собрать людей, инструменты и стимулы в систему, где каждый следующий участник добавляет измеримую ценность.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                <h3 className="text-base font-bold text-[#E6EDF7] mb-2">
                  Территория для создателей
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Разработчики получают лабораторию, реальные задачи, совместные библиотеки и публичную историю вклада.
                </p>
              </div>
              <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                <h3 className="text-base font-bold text-[#E6EDF7] mb-2">
                  Среда для экспериментов
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Инженеры и исследователи получают воспроизводимые тесты, стенды, сравнение подходов и коллективный review.
                </p>
              </div>
              <div className="bg-[#101726] border border-white/10 rounded-xl p-6">
                <h3 className="text-base font-bold text-[#E6EDF7] mb-2">
                  Вход через практику
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Новичку не нужно сразу быть сетевым инженером: он начинает с понятной задачи и постепенно осваивает сложные технологии.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10 bg-[#070B14]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            <span className="font-display font-bold tracking-wider text-[#CBD5E1] mr-2">
              NETWORK CORE
            </span>
            <span>Информационный портал концепции и развития экосистемы Ncore.</span>
          </div>
          <p className="max-w-md leading-relaxed">
            Все балансы COIN, распределения бюджета и узлы являются концептуальными примерами, а не действующими финансовыми обещаниями.
          </p>
        </div>
      </footer>

      <EntryDetailDrawer
        entry={selectedEntry}
        user={user}
        onClose={() => setSelectedEntryId(null)}
        onEdit={(entry) => {
          setSelectedEntryId(null);
          openEditorForTab('entry', { entry });
        }}
        onSignIn={handleSignIn}
      />

      <EntryEditorModal
        open={editorOpen}
        initialTab={editorTab}
        initialSectionId={editorSectionId}
        initialPhaseId={editorPhaseId}
        editingEntry={editingEntry}
        user={user}
        onClose={() => {
          setEditorOpen(false);
          setEditingEntry(null);
        }}
        onSignIn={handleSignIn}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PortalContent />
    </ErrorBoundary>
  );
}
