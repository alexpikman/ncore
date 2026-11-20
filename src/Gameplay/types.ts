export type ComponentCategory = 'chassis' | 'cpu' | 'memory' | 'storage' | 'network' | 'power';

export interface HardwareComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  price: number;
  description: string;
  specs: string;
}

export interface InventoryItem {
  instanceId: string;
  componentId: string;
  purchasedAt: number;
}

export type BuildSlots = Record<ComponentCategory, string | null>;

export interface VirtualServer {
  id: string;
  name: string;
  createdAt: number;
  components: Record<ComponentCategory, HardwareComponent>;
}

export interface GameplaySave {
  version: 1;
  balance: number;
  inventory: InventoryItem[];
  servers: VirtualServer[];
}

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  'chassis',
  'cpu',
  'memory',
  'storage',
  'network',
  'power',
];

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  chassis: 'Корпус',
  cpu: 'Процессор',
  memory: 'Оперативная память',
  storage: 'Накопитель',
  network: 'Сетевая карта',
  power: 'Блок питания',
};

export const EMPTY_BUILD: BuildSlots = {
  chassis: null,
  cpu: null,
  memory: null,
  storage: null,
  network: null,
  power: null,
};
