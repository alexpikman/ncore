import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { LogIn, X } from 'lucide-react';
import {
  ADDENDUM_KIND_LABELS,
  CATEGORY_LABELS,
  GLOSSARY_DOMAIN_LABELS,
  ROADMAP_PHASES,
  SECTION_LABELS,
} from '../data/conceptData';
import { isAdminUser } from '../lib/firebase';
import {
  createConceptAddendum,
  createGlossaryTerm,
  createPortalEntry,
  createRoadmapItem,
  updatePortalEntry,
} from '../services/portalService';
import type {
  AddendumKind,
  ConceptSectionId,
  EditorTab,
  EntryCategory,
  EntryStatus,
  GlossaryDomain,
  PortalEntry,
  RoadmapPhaseId,
  RoadmapState,
  Visibility,
} from '../types/portal';

interface EntryEditorModalProps {
  open: boolean;
  initialTab: EditorTab;
  initialSectionId?: ConceptSectionId;
  initialPhaseId?: RoadmapPhaseId;
  editingEntry: PortalEntry | null;
  user: User | null;
  onClose: () => void;
  onSignIn: () => Promise<void>;
}

const TABS: { id: EditorTab; label: string }[] = [
  { id: 'entry', label: 'Публикация' },
  { id: 'addendum', label: 'Дополнение к концепции' },
  { id: 'glossary', label: 'Термин в глоссарий' },
  { id: 'roadmap', label: 'Этап развития' },
];

export function EntryEditorModal({
  open,
  initialTab,
  initialSectionId = 'vision',
  initialPhaseId = 'phase1',
  editingEntry,
  user,
  onClose,
  onSignIn,
}: EntryEditorModalProps) {
  const [tab, setTab] = useState<EditorTab>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Entry fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<EntryCategory>('concept');
  const [status, setStatus] = useState<EntryStatus>('discussion');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [sectionRef, setSectionRef] = useState<string>('');

  // Addendum fields
  const [addSectionId, setAddSectionId] = useState<ConceptSectionId>(initialSectionId);
  const [addTitle, setAddTitle] = useState('');
  const [addContent, setAddContent] = useState('');
  const [addKind, setAddKind] = useState<AddendumKind>('note');

  // Glossary fields
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [domain, setDomain] = useState<GlossaryDomain>('network');

  // Roadmap fields
  const [phaseId, setPhaseId] = useState<RoadmapPhaseId>(initialPhaseId);
  const [roadTitle, setRoadTitle] = useState('');
  const [roadDesc, setRoadDesc] = useState('');
  const [roadState, setRoadState] = useState<RoadmapState>('planned');

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    if (editingEntry) {
      setTab('entry');
      setTitle(editingEntry.title);
      setSummary(editingEntry.summary);
      setBody(editingEntry.body);
      setCategory(editingEntry.category);
      setStatus(editingEntry.status);
      setVisibility(editingEntry.visibility);
      setSectionRef(editingEntry.sectionRef);
    } else {
      setTab(initialTab);
      setTitle('');
      setSummary('');
      setBody('');
      setCategory('concept');
      setStatus('discussion');
      setVisibility('public');
      setSectionRef('');
      setAddSectionId(initialSectionId);
      setAddTitle('');
      setAddContent('');
      setAddKind('note');
      setTerm('');
      setDefinition('');
      setDomain('network');
      setPhaseId(initialPhaseId);
      setRoadTitle('');
      setRoadDesc('');
      setRoadState('planned');
    }
  }, [open, initialTab, initialSectionId, initialPhaseId, editingEntry]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const admin = isAdminUser(user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);

    try {
      setSubmitting(true);
      if (tab === 'entry') {
        if (title.trim().length < 3) {
          throw new Error('Заголовок должен содержать минимум 3 символа.');
        }
        if (summary.trim().length < 5) {
          throw new Error('Краткое описание должно содержать минимум 5 символов.');
        }
        if (body.trim().length < 10) {
          throw new Error('Текст публикации должен содержать минимум 10 символов.');
        }

        if (editingEntry) {
          await updatePortalEntry(user, editingEntry.id, {
            title,
            summary,
            body,
            category,
            status,
            visibility,
            sectionRef,
          });
        } else {
          await createPortalEntry(user, {
            title,
            summary,
            body,
            category,
            status,
            visibility,
            sectionRef,
          });
        }
      } else if (tab === 'addendum') {
        if (addTitle.trim().length < 3 || addContent.trim().length < 10) {
          throw new Error('Заполните заголовок (от 3 символов) и текст дополнения (от 10 символов).');
        }
        await createConceptAddendum(user, {
          sectionId: addSectionId,
          title: addTitle,
          content: addContent,
          kind: addKind,
          visibility,
        });
      } else if (tab === 'glossary') {
        if (term.trim().length < 2 || definition.trim().length < 5) {
          throw new Error('Укажите термин (от 2 символов) и определение (от 5 символов).');
        }
        await createGlossaryTerm(user, {
          term,
          definition,
          domain,
          visibility,
        });
      } else if (tab === 'roadmap') {
        if (roadTitle.trim().length < 3 || roadDesc.trim().length < 5) {
          throw new Error('Укажите название задачи (от 3 символов) и описание (от 5 символов).');
        }
        await createRoadmapItem(user, {
          phaseId,
          title: roadTitle,
          description: roadDesc,
          state: roadState,
          visibility,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Ошибка сохранения в базу данных.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Добавление информации на портал"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#0D1424] border border-white/15 rounded-2xl overflow-hidden my-auto">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#E6EDF7]">
            {editingEntry ? 'Редактирование публикации' : 'Добавить информацию на портал'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть редактор"
            className="p-2 text-[#94A3B8] hover:text-[#E6EDF7] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          <div className="p-8 text-center space-y-4">
            <h3 className="text-lg font-semibold text-[#E6EDF7]">
              Требуется авторизация участника
            </h3>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              Чтобы добавлять материалы, дополнять разделы концепции, пополнять глоссарий и фиксировать задачи развития, войдите через аккаунт Google.
            </p>
            <button
              type="button"
              onClick={() => void onSignIn()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#22D3EE] text-[#090E1A] rounded-lg hover:bg-[#38BDF8] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Войти через Google
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {!editingEntry && (
              <div className="flex items-center gap-1 p-1 bg-[#101726] border border-white/10 rounded-xl overflow-x-auto">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTab(t.id);
                      setErrorMsg(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      tab === t.id
                        ? 'bg-[#1A263D] text-[#E6EDF7]'
                        : 'text-[#94A3B8] hover:text-[#E6EDF7]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {tab === 'entry' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Заголовок публикации (3–140 символов)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={140}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Протокол обмена состоянием в песочнице"
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Категория
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EntryCategory)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      {(Object.keys(CATEGORY_LABELS) as EntryCategory[]).map((key) => (
                        <option key={key} value={key}>
                          {CATEGORY_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Связь с главой концепции
                    </label>
                    <select
                      value={sectionRef}
                      onChange={(e) => setSectionRef(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      <option value="">Без привязки к главе</option>
                      {(Object.keys(SECTION_LABELS) as ConceptSectionId[]).map((key) => (
                        <option key={key} value={key}>
                          {SECTION_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Краткое описание / лид (5–400 символов)
                  </label>
                  <textarea
                    required
                    rows={2}
                    minLength={5}
                    maxLength={400}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Краткая суть материала для карточки в ленте..."
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Основной текст (поддерживаются заголовки «## » и списки «- »)
                  </label>
                  <textarea
                    required
                    rows={7}
                    minLength={10}
                    maxLength={12000}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Развёрнутое изложение идеи, спецификации или заметки..."
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Статус материала
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as EntryStatus)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      <option value="discussion">На обсуждении</option>
                      <option value="draft">Черновик</option>
                      {admin && <option value="accepted">В концепции (Принято)</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Видимость
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as Visibility)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      <option value="public">Публично на портале</option>
                      <option value="private">Только для меня (Черновик)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {tab === 'addendum' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Раздел концепции
                    </label>
                    <select
                      value={addSectionId}
                      onChange={(e) => setAddSectionId(e.target.value as ConceptSectionId)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      {(Object.keys(SECTION_LABELS) as ConceptSectionId[]).map((key) => (
                        <option key={key} value={key}>
                          {SECTION_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Тип дополнения
                    </label>
                    <select
                      value={addKind}
                      onChange={(e) => setAddKind(e.target.value as AddendumKind)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      {(Object.keys(ADDENDUM_KIND_LABELS) as AddendumKind[]).map((key) => (
                        <option key={key} value={key}>
                          {ADDENDUM_KIND_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Заголовок дополнения
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={140}
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="Краткая тема дополнения к главе..."
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Текст дополнения (10–6000 символов)
                  </label>
                  <textarea
                    required
                    rows={5}
                    minLength={10}
                    maxLength={6000}
                    value={addContent}
                    onChange={(e) => setAddContent(e.target.value)}
                    placeholder="Опишите уточнение, сценарий, риск или предложение для этого раздела..."
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Видимость
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as Visibility)}
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  >
                    <option value="public">Публично на портале</option>
                    <option value="private">Только для меня</option>
                  </select>
                </div>
              </div>
            )}

            {tab === 'glossary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Термин (2–80 символов)
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      placeholder="Например: Capability Token"
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Предметная область
                    </label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value as GlossaryDomain)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      {(Object.keys(GLOSSARY_DOMAIN_LABELS) as GlossaryDomain[]).map((key) => (
                        <option key={key} value={key}>
                          {GLOSSARY_DOMAIN_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Определение (5–1000 символов)
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={5}
                    maxLength={1000}
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Точное и понятное объяснение термина в контексте NETWORK CORE..."
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>
              </div>
            )}

            {tab === 'roadmap' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Этап дорожной карты
                    </label>
                    <select
                      value={phaseId}
                      onChange={(e) => setPhaseId(e.target.value as RoadmapPhaseId)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      {ROADMAP_PHASES.map((ph) => (
                        <option key={ph.id} value={ph.id}>
                          {ph.code} — {ph.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                      Текущий статус
                    </label>
                    <select
                      value={roadState}
                      onChange={(e) => setRoadState(e.target.value as RoadmapState)}
                      className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                    >
                      <option value="planned">Запланировано</option>
                      <option value="in_progress">В работе</option>
                      <option value="done">Готово</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Название задачи развития (3–120 символов)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={120}
                    value={roadTitle}
                    onChange={(e) => setRoadTitle(e.target.value)}
                    placeholder="Например: Интерактивный конструктор узла VPS"
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Описание и критерий приёмки (5–600 символов)
                  </label>
                  <textarea
                    required
                    rows={3}
                    minLength={5}
                    maxLength={600}
                    value={roadDesc}
                    onChange={(e) => setRoadDesc(e.target.value)}
                    placeholder="Что должно работать по завершении задачи..."
                    className="w-full px-3.5 py-2 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs sm:text-sm text-[#F87171] bg-[#1F141A] border border-[#F87171]/30 rounded-lg px-3.5 py-2.5">
                {errorMsg}
              </p>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#E6EDF7] cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold bg-[#22D3EE] text-[#090E1A] rounded-lg hover:bg-[#38BDF8] transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Сохранение...' : editingEntry ? 'Сохранить изменения' : 'Опубликовать'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
