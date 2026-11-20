import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { Edit3, MessageSquare, Send, Trash2, X } from 'lucide-react';
import { CATEGORY_LABELS, SECTION_LABELS, STATUS_LABELS } from '../data/conceptData';
import { isAdminUser } from '../lib/firebase';
import {
  createEntryComment,
  deleteEntryComment,
  deletePortalEntry,
  subscribeEntryComments,
} from '../services/portalService';
import type { ConceptSectionId, EntryComment, PortalEntry } from '../types/portal';

interface EntryDetailDrawerProps {
  entry: PortalEntry | null;
  user: User | null;
  onClose: () => void;
  onEdit: (entry: PortalEntry) => void;
  onSignIn: () => Promise<void>;
}

function FormattedProse({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={index}
              className="text-lg font-bold text-[#E6EDF7] pt-2"
            >
              {trimmed.slice(3)}
            </h3>
          );
        }
        const lines = trimmed.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={index} className="space-y-2 pl-4">
              {lines.map((line, i) => (
                <li key={i} className="text-[#CBD5E1]">
                  • {line.trim().slice(2)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="whitespace-pre-line">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export function EntryDetailDrawer({
  entry,
  user,
  onClose,
  onEdit,
  onSignIn,
}: EntryDetailDrawerProps) {
  const [comments, setComments] = useState<EntryComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setConfirmDelete(false);
    setErrorMsg(null);
    if (!entry || entry.isBaseline) {
      setComments([]);
      return;
    }
    const unsub = subscribeEntryComments(entry.id, entry.visibility, user, setComments);
    return () => unsub();
  }, [entry, user]);

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entry, onClose]);

  if (!entry) return null;

  const admin = isAdminUser(user);
  const canModify =
    !entry.isBaseline &&
    Boolean(user) &&
    (admin || (user?.uid === entry.authorId && entry.status !== 'accepted'));

  const sectionLabel =
    entry.sectionRef && entry.sectionRef in SECTION_LABELS
      ? SECTION_LABELS[entry.sectionRef as ConceptSectionId]
      : null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || entry.isBaseline) return;
    const clean = commentText.trim();
    if (clean.length < 2) {
      setErrorMsg('Комментарий должен содержать минимум 2 символа.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createEntryComment(user, entry.id, entry.visibility, clean);
      setCommentText('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Не удалось отправить комментарий.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    setDeleting(true);
    try {
      await deletePortalEntry(entry.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl h-full bg-[#0D1424] border-l border-white/10 overflow-y-auto flex flex-col">
        <div className="sticky top-0 z-10 bg-[#0D1424]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] truncate">
            <span className="text-[#22D3EE] font-medium">
              {CATEGORY_LABELS[entry.category]}
            </span>
            <span aria-hidden="true">·</span>
            <span>{STATUS_LABELS[entry.status]}</span>
            {sectionLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{sectionLabel}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть материал"
            className="p-2 text-[#94A3B8] hover:text-[#E6EDF7] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 flex-1 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#E6EDF7] leading-tight mb-3">
              {entry.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
              <span>Автор: {entry.authorName}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Обновлено {new Date(entry.updatedAtMs).toLocaleDateString('ru-RU')}
              </span>
              {entry.isBaseline && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Базовый документ концепции</span>
                </>
              )}
            </div>
          </div>

          <p className="text-base text-[#E6EDF7]/90 leading-relaxed pb-5 border-b border-white/10">
            {entry.summary}
          </p>

          <FormattedProse text={entry.body} />

          {canModify && (
            <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium bg-[#141D30] border border-white/15 rounded-lg text-[#E6EDF7] hover:border-[#22D3EE]/50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" aria-hidden="true" />
                Редактировать запись
              </button>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium bg-[#1F141A] border border-[#F87171]/30 rounded-lg text-[#FCA5A5] hover:bg-[#2A1820] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Удалить
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#FCA5A5]">Подтвердить удаление?</span>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => void handleDeleteEntry()}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] cursor-pointer"
                  >
                    {deleting ? 'Удаление...' : 'Да, удалить'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-xs font-medium bg-[#141D30] text-[#94A3B8] rounded-lg hover:text-[#E6EDF7] cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Comments Section (for Firestore entries) */}
          {!entry.isBaseline && (
            <div className="pt-6 border-t border-white/10 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E6EDF7]">
                <MessageSquare className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
                Обсуждение и дополнения ({comments.length})
              </div>

              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const canDeleteComment =
                      user && (admin || user.uid === comment.authorId);
                    return (
                      <div
                        key={comment.id}
                        className="bg-[#101726] border border-white/10 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8] mb-1.5">
                          <span className="font-medium text-[#CBD5E1]">
                            {comment.authorName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums">
                              {new Date(comment.createdAtMs).toLocaleDateString('ru-RU')}
                            </span>
                            {canDeleteComment && (
                              <button
                                type="button"
                                onClick={() => void deleteEntryComment(entry.id, comment.id)}
                                aria-label="Удалить комментарий"
                                className="text-[#64748B] hover:text-[#F87171] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-[#CBD5E1] whitespace-pre-line leading-relaxed">
                          {comment.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Пока нет комментариев. Вы можете оставить техническое замечание или предложение.
                </p>
              )}

              {user ? (
                <form onSubmit={(e) => void handlePostComment(e)} className="space-y-3">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={2000}
                    placeholder="Добавить комментарий или уточнение к материалу..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#090E1A] border border-white/15 rounded-lg text-[#E6EDF7] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
                  />
                  {errorMsg && <p className="text-xs text-[#F87171]">{errorMsg}</p>}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#22D3EE] text-[#090E1A] rounded-lg hover:bg-[#38BDF8] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      {submitting ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-[#101726] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm text-[#94A3B8]">
                    Войдите через Google, чтобы участвовать в обсуждении.
                  </span>
                  <button
                    type="button"
                    onClick={() => void onSignIn()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#22D3EE] text-[#090E1A] rounded-lg hover:bg-[#38BDF8] whitespace-nowrap cursor-pointer"
                  >
                    Войти
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
