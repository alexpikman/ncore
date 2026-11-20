import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  db,
  handleFirestoreError,
  isAdminUser,
  OperationType,
  timestampToMs,
} from '../lib/firebase';
import type {
  AddendumKind,
  ConceptAddendum,
  ConceptSectionId,
  EntryCategory,
  EntryComment,
  EntryStatus,
  GlossaryDomain,
  GlossaryTerm,
  PortalEntry,
  RoadmapItem,
  RoadmapPhaseId,
  RoadmapState,
  Visibility,
} from '../types/portal';

function safeAuthorName(user: User): string {
  const raw = (user.displayName || 'Участник сети').trim();
  return raw.slice(0, 80) || 'Участник сети';
}

function cleanSectionRef(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

function mergeById<T extends { id: string; updatedAtMs?: number; createdAtMs: number }>(
  lists: T[][],
): T[] {
  const map = new Map<string, T>();
  for (const list of lists) {
    for (const item of list) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (b.updatedAtMs ?? b.createdAtMs) - (a.updatedAtMs ?? a.createdAtMs),
  );
}

export function subscribeEntries(
  user: User | null,
  onData: (items: PortalEntry[]) => void,
): Unsubscribe {
  let publicItems: PortalEntry[] = [];
  let ownItems: PortalEntry[] = [];

  const emit = () => onData(mergeById([publicItems, ownItems]));

  const unsubPublic = onSnapshot(
    query(collection(db, 'entries'), where('visibility', '==', 'public')),
    (snap) => {
      publicItems = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title ?? ''),
          summary: String(data.summary ?? ''),
          body: String(data.body ?? ''),
          category: (data.category ?? 'concept') as EntryCategory,
          status: (data.status ?? 'discussion') as EntryStatus,
          visibility: (data.visibility ?? 'public') as Visibility,
          sectionRef: String(data.sectionRef ?? ''),
          authorId: String(data.authorId ?? ''),
          authorName: String(data.authorName ?? 'Участник'),
          createdAtMs: timestampToMs(data.createdAt),
          updatedAtMs: timestampToMs(data.updatedAt),
        };
      });
      emit();
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'entries'),
  );

  let unsubOwn: Unsubscribe | null = null;
  if (user && user.emailVerified) {
    const q = isAdminUser(user)
      ? collection(db, 'entries')
      : query(collection(db, 'entries'), where('authorId', '==', user.uid));

    unsubOwn = onSnapshot(
      q,
      (snap) => {
        ownItems = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title ?? ''),
            summary: String(data.summary ?? ''),
            body: String(data.body ?? ''),
            category: (data.category ?? 'concept') as EntryCategory,
            status: (data.status ?? 'discussion') as EntryStatus,
            visibility: (data.visibility ?? 'public') as Visibility,
            sectionRef: String(data.sectionRef ?? ''),
            authorId: String(data.authorId ?? ''),
            authorName: String(data.authorName ?? 'Участник'),
            createdAtMs: timestampToMs(data.createdAt),
            updatedAtMs: timestampToMs(data.updatedAt),
          };
        });
        emit();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'entries'),
    );
  }

  return () => {
    unsubPublic();
    if (unsubOwn) unsubOwn();
  };
}

export function subscribeAddenda(
  user: User | null,
  onData: (items: ConceptAddendum[]) => void,
): Unsubscribe {
  let publicItems: ConceptAddendum[] = [];
  let ownItems: ConceptAddendum[] = [];

  const emit = () => onData(mergeById([publicItems, ownItems]));

  const unsubPublic = onSnapshot(
    query(collection(db, 'concept_addenda'), where('visibility', '==', 'public')),
    (snap) => {
      publicItems = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          sectionId: (data.sectionId ?? 'vision') as ConceptSectionId,
          title: String(data.title ?? ''),
          content: String(data.content ?? ''),
          kind: (data.kind ?? 'note') as AddendumKind,
          visibility: (data.visibility ?? 'public') as Visibility,
          authorId: String(data.authorId ?? ''),
          authorName: String(data.authorName ?? 'Участник'),
          createdAtMs: timestampToMs(data.createdAt),
          updatedAtMs: timestampToMs(data.updatedAt),
        };
      });
      emit();
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'concept_addenda'),
  );

  let unsubOwn: Unsubscribe | null = null;
  if (user && user.emailVerified) {
    const q = isAdminUser(user)
      ? collection(db, 'concept_addenda')
      : query(collection(db, 'concept_addenda'), where('authorId', '==', user.uid));

    unsubOwn = onSnapshot(
      q,
      (snap) => {
        ownItems = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            sectionId: (data.sectionId ?? 'vision') as ConceptSectionId,
            title: String(data.title ?? ''),
            content: String(data.content ?? ''),
            kind: (data.kind ?? 'note') as AddendumKind,
            visibility: (data.visibility ?? 'public') as Visibility,
            authorId: String(data.authorId ?? ''),
            authorName: String(data.authorName ?? 'Участник'),
            createdAtMs: timestampToMs(data.createdAt),
            updatedAtMs: timestampToMs(data.updatedAt),
          };
        });
        emit();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'concept_addenda'),
    );
  }

  return () => {
    unsubPublic();
    if (unsubOwn) unsubOwn();
  };
}

export function subscribeGlossary(
  user: User | null,
  onData: (items: GlossaryTerm[]) => void,
): Unsubscribe {
  let publicItems: GlossaryTerm[] = [];
  let ownItems: GlossaryTerm[] = [];

  const emit = () => onData(mergeById([publicItems, ownItems]));

  const unsubPublic = onSnapshot(
    query(collection(db, 'glossary_terms'), where('visibility', '==', 'public')),
    (snap) => {
      publicItems = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          term: String(data.term ?? ''),
          definition: String(data.definition ?? ''),
          domain: (data.domain ?? 'general') as GlossaryDomain,
          visibility: (data.visibility ?? 'public') as Visibility,
          authorId: String(data.authorId ?? ''),
          authorName: String(data.authorName ?? 'Участник'),
          createdAtMs: timestampToMs(data.createdAt),
          updatedAtMs: timestampToMs(data.updatedAt),
        };
      });
      emit();
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'glossary_terms'),
  );

  let unsubOwn: Unsubscribe | null = null;
  if (user && user.emailVerified) {
    const q = isAdminUser(user)
      ? collection(db, 'glossary_terms')
      : query(collection(db, 'glossary_terms'), where('authorId', '==', user.uid));

    unsubOwn = onSnapshot(
      q,
      (snap) => {
        ownItems = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            term: String(data.term ?? ''),
            definition: String(data.definition ?? ''),
            domain: (data.domain ?? 'general') as GlossaryDomain,
            visibility: (data.visibility ?? 'public') as Visibility,
            authorId: String(data.authorId ?? ''),
            authorName: String(data.authorName ?? 'Участник'),
            createdAtMs: timestampToMs(data.createdAt),
            updatedAtMs: timestampToMs(data.updatedAt),
          };
        });
        emit();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'glossary_terms'),
    );
  }

  return () => {
    unsubPublic();
    if (unsubOwn) unsubOwn();
  };
}

export function subscribeRoadmapItems(
  user: User | null,
  onData: (items: RoadmapItem[]) => void,
): Unsubscribe {
  let publicItems: RoadmapItem[] = [];
  let ownItems: RoadmapItem[] = [];

  const emit = () => onData(mergeById([publicItems, ownItems]));

  const unsubPublic = onSnapshot(
    query(collection(db, 'roadmap_items'), where('visibility', '==', 'public')),
    (snap) => {
      publicItems = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          phaseId: (data.phaseId ?? 'phase1') as RoadmapPhaseId,
          title: String(data.title ?? ''),
          description: String(data.description ?? ''),
          state: (data.state ?? 'planned') as RoadmapState,
          visibility: (data.visibility ?? 'public') as Visibility,
          authorId: String(data.authorId ?? ''),
          authorName: String(data.authorName ?? 'Участник'),
          createdAtMs: timestampToMs(data.createdAt),
          updatedAtMs: timestampToMs(data.updatedAt),
        };
      });
      emit();
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'roadmap_items'),
  );

  let unsubOwn: Unsubscribe | null = null;
  if (user && user.emailVerified) {
    const q = isAdminUser(user)
      ? collection(db, 'roadmap_items')
      : query(collection(db, 'roadmap_items'), where('authorId', '==', user.uid));

    unsubOwn = onSnapshot(
      q,
      (snap) => {
        ownItems = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            phaseId: (data.phaseId ?? 'phase1') as RoadmapPhaseId,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            state: (data.state ?? 'planned') as RoadmapState,
            visibility: (data.visibility ?? 'public') as Visibility,
            authorId: String(data.authorId ?? ''),
            authorName: String(data.authorName ?? 'Участник'),
            createdAtMs: timestampToMs(data.createdAt),
            updatedAtMs: timestampToMs(data.updatedAt),
          };
        });
        emit();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'roadmap_items'),
    );
  }

  return () => {
    unsubPublic();
    if (unsubOwn) unsubOwn();
  };
}

export function subscribeEntryComments(
  entryId: string,
  entryVisibility: Visibility,
  user: User | null,
  onData: (comments: EntryComment[]) => void,
): Unsubscribe {
  const path = `entries/${entryId}/comments`;
  const commentsCol = collection(db, 'entries', entryId, 'comments');
  const q =
    entryVisibility === 'public'
      ? query(commentsCol, where('entryVisibility', '==', 'public'))
      : user && isAdminUser(user)
        ? commentsCol
        : query(commentsCol, where('authorId', '==', user?.uid ?? '__none__'));

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            entryId: String(data.entryId ?? entryId),
            entryVisibility: (data.entryVisibility ?? entryVisibility) as Visibility,
            body: String(data.body ?? ''),
            authorId: String(data.authorId ?? ''),
            authorName: String(data.authorName ?? 'Участник'),
            createdAtMs: timestampToMs(data.createdAt),
          };
        })
        .sort((a, b) => a.createdAtMs - b.createdAtMs);
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path),
  );
}

export async function createPortalEntry(
  user: User,
  input: {
    title: string;
    summary: string;
    body: string;
    category: EntryCategory;
    status: EntryStatus;
    visibility: Visibility;
    sectionRef: string;
  },
): Promise<string> {
  const ref = doc(collection(db, 'entries'));
  const status: EntryStatus = isAdminUser(user)
    ? input.status
    : input.status === 'accepted'
      ? 'discussion'
      : input.status;

  try {
    await setDoc(ref, {
      title: input.title.trim().slice(0, 140),
      summary: input.summary.trim().slice(0, 400),
      body: input.body.trim().slice(0, 12000),
      category: input.category,
      status,
      visibility: input.visibility,
      sectionRef: cleanSectionRef(input.sectionRef),
      authorId: user.uid,
      authorName: safeAuthorName(user),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `entries/${ref.id}`);
  }
}

export async function updatePortalEntry(
  user: User,
  entryId: string,
  input: {
    title: string;
    summary: string;
    body: string;
    category: EntryCategory;
    status: EntryStatus;
    visibility: Visibility;
    sectionRef: string;
  },
): Promise<void> {
  const ref = doc(db, 'entries', entryId);
  const status: EntryStatus = isAdminUser(user)
    ? input.status
    : input.status === 'accepted'
      ? 'discussion'
      : input.status;

  try {
    await updateDoc(ref, {
      title: input.title.trim().slice(0, 140),
      summary: input.summary.trim().slice(0, 400),
      body: input.body.trim().slice(0, 12000),
      category: input.category,
      status,
      visibility: input.visibility,
      sectionRef: cleanSectionRef(input.sectionRef),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `entries/${entryId}`);
  }
}

export async function deletePortalEntry(entryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'entries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `entries/${entryId}`);
  }
}

export async function createEntryComment(
  user: User,
  entryId: string,
  entryVisibility: Visibility,
  body: string,
): Promise<void> {
  const ref = doc(collection(db, 'entries', entryId, 'comments'));
  try {
    await setDoc(ref, {
      entryId,
      entryVisibility,
      body: body.trim().slice(0, 2000),
      authorId: user.uid,
      authorName: safeAuthorName(user),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.CREATE,
      `entries/${entryId}/comments/${ref.id}`,
    );
  }
}

export async function deleteEntryComment(
  entryId: string,
  commentId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'entries', entryId, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `entries/${entryId}/comments/${commentId}`,
    );
  }
}

export async function createConceptAddendum(
  user: User,
  input: {
    sectionId: ConceptSectionId;
    title: string;
    content: string;
    kind: AddendumKind;
    visibility: Visibility;
  },
): Promise<void> {
  const ref = doc(collection(db, 'concept_addenda'));
  try {
    await setDoc(ref, {
      sectionId: input.sectionId,
      title: input.title.trim().slice(0, 140),
      content: input.content.trim().slice(0, 6000),
      kind: input.kind,
      visibility: input.visibility,
      authorId: user.uid,
      authorName: safeAuthorName(user),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `concept_addenda/${ref.id}`);
  }
}

export async function deleteConceptAddendum(addendumId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'concept_addenda', addendumId));
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `concept_addenda/${addendumId}`,
    );
  }
}

export async function createGlossaryTerm(
  user: User,
  input: {
    term: string;
    definition: string;
    domain: GlossaryDomain;
    visibility: Visibility;
  },
): Promise<void> {
  const ref = doc(collection(db, 'glossary_terms'));
  try {
    await setDoc(ref, {
      term: input.term.trim().slice(0, 80),
      definition: input.definition.trim().slice(0, 1000),
      domain: input.domain,
      visibility: input.visibility,
      authorId: user.uid,
      authorName: safeAuthorName(user),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `glossary_terms/${ref.id}`);
  }
}

export async function deleteGlossaryTerm(termId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'glossary_terms', termId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `glossary_terms/${termId}`);
  }
}

export async function createRoadmapItem(
  user: User,
  input: {
    phaseId: RoadmapPhaseId;
    title: string;
    description: string;
    state: RoadmapState;
    visibility: Visibility;
  },
): Promise<void> {
  const ref = doc(collection(db, 'roadmap_items'));
  try {
    await setDoc(ref, {
      phaseId: input.phaseId,
      title: input.title.trim().slice(0, 120),
      description: input.description.trim().slice(0, 600),
      state: input.state,
      visibility: input.visibility,
      authorId: user.uid,
      authorName: safeAuthorName(user),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `roadmap_items/${ref.id}`);
  }
}

export async function updateRoadmapItemState(
  itemId: string,
  state: RoadmapState,
): Promise<void> {
  try {
    await updateDoc(doc(db, 'roadmap_items', itemId), {
      state,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `roadmap_items/${itemId}`);
  }
}

export async function deleteRoadmapItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'roadmap_items', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `roadmap_items/${itemId}`);
  }
}
