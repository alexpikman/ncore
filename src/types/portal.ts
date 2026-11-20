export type EntryCategory =
  | 'concept'
  | 'network'
  | 'simulator'
  | 'ai'
  | 'economy'
  | 'proposal';

export type EntryStatus = 'draft' | 'discussion' | 'accepted';
export type Visibility = 'public' | 'private';

export type ConceptSectionId =
  | 'vision'
  | 'game'
  | 'network'
  | 'protocols'
  | 'ai'
  | 'ledger'
  | 'economy'
  | 'market'
  | 'architecture'
  | 'security'
  | 'roadmap'
  | 'governance';

export type AddendumKind = 'note' | 'proposal' | 'architecture' | 'risk';
export type GlossaryDomain = 'network' | 'ai' | 'economy' | 'security' | 'general';
export type RoadmapPhaseId = 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'phase6';
export type RoadmapState = 'planned' | 'in_progress' | 'done';

export interface PortalEntry {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: EntryCategory;
  status: EntryStatus;
  visibility: Visibility;
  sectionRef: string;
  authorId: string;
  authorName: string;
  createdAtMs: number;
  updatedAtMs: number;
  isBaseline?: boolean;
}

export interface EntryComment {
  id: string;
  entryId: string;
  entryVisibility: Visibility;
  body: string;
  authorId: string;
  authorName: string;
  createdAtMs: number;
}

export interface ConceptAddendum {
  id: string;
  sectionId: ConceptSectionId;
  title: string;
  content: string;
  kind: AddendumKind;
  visibility: Visibility;
  authorId: string;
  authorName: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  domain: GlossaryDomain;
  visibility: Visibility;
  authorId: string;
  authorName: string;
  createdAtMs: number;
  updatedAtMs: number;
  isBaseline?: boolean;
}

export interface RoadmapItem {
  id: string;
  phaseId: RoadmapPhaseId;
  title: string;
  description: string;
  state: RoadmapState;
  visibility: Visibility;
  authorId: string;
  authorName: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export type EditorTab = 'entry' | 'addendum' | 'glossary' | 'roadmap';
