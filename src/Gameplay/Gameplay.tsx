import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Package,
  Server,
  ShoppingCart,
  Wallet,
  Zap,
} from 'lucide-react';
import { HARDWARE_CATALOG } from './catalog';
import { loadGameplaySave, saveGameplaySave } from './gameStorage';
import {
  CATEGORY_LABELS,
  COMPONENT_CATEGORIES,
  EMPTY_BUILD,
  type BuildSlots,
  type ComponentCategory,
  type GameplaySave,
  type HardwareComponent,
  type InventoryItem,
  type VirtualServer,
} from './types';

type GameplayTab = 'shop' | 'build' | 'servers';

interface GameplayProps {
  user: User;
  onExit: () => void;
}

const CATEGORY_ICONS = {
  chassis: Box,
  cpu: Cpu,
  memory: MemoryStick,
  storage: HardDrive,
  network: Network,
  power: Zap,
};

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getComponent(componentId: string): HardwareComponent | undefined {
  return HARDWARE_CATALOG.find((component) => component.id === componentId);
}

function createServerName(count: number): string {
  return `NCORE-VPS-${String(count + 1).padStart(3, '0')}`;
}

export function Gameplay({ user, onExit }: GameplayProps) {
  const [save, setSave] = useState<GameplaySave>(() => loadGameplaySave(user.uid));
  const [activeTab, setActiveTab] = useState<GameplayTab>('shop');
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('chassis');
  const [buildSlots, setBuildSlots] = useState<BuildSlots>(EMPTY_BUILD);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    saveGameplaySave(user.uid, save);
  }, [save, user.uid]);

  const inventoryByCategory = useMemo(() => {
    const grouped = new Map<ComponentCategory, InventoryItem[]>();
    COMPONENT_CATEGORIES.forEach((category) => grouped.set(category, []));
    save.inventory.forEach((item) => {
      const component = getComponent(item.componentId);
      if (component) grouped.get(component.category)?.push(item);
    });
    return grouped;
  }, [save.inventory]);

  const selectedComponents = useMemo(() => {
    const result = {} as Record<ComponentCategory, HardwareComponent>;
    COMPONENT_CATEGORIES.forEach((category) => {
      const instanceId = buildSlots[category];
      const inventoryItem = save.inventory.find((item) => item.instanceId === instanceId);
      const component = inventoryItem ? getComponent(inventoryItem.componentId) : undefined;
      if (component) result[category] = component;
    });
    return result;
  }, [buildSlots, save.inventory]);

  const selectedCount = COMPONENT_CATEGORIES.filter((category) => Boolean(selectedComponents[category])).length;
  const canAssemble = selectedCount === COMPONENT_CATEGORIES.length;
  const selectedCost = Object.values(selectedComponents).reduce((total, component) => total + component.price, 0);
  const totalInventory = save.inventory.length;

  const handlePurchase = (component: HardwareComponent) => {
    if (save.balance < component.price) {
      setNotice('Недостаточно COIN для покупки. Выберите более дешёвую деталь.');
      return;
    }

    setSave((current) => ({
      ...current,
      balance: current.balance - component.price,
      inventory: [
        ...current.inventory,
        {
          instanceId: createId(),
          componentId: component.id,
          purchasedAt: Date.now(),
        },
      ],
    }));
    setNotice(`Куплено: ${component.name}. Деталь добавлена на склад.`);
  };

  const handleSelectPart = (category: ComponentCategory, instanceId: string) => {
    setBuildSlots((current) => ({
      ...current,
      [category]: instanceId || null,
    }));
    setNotice(null);
  };

  const handleAssemble = () => {
    if (!canAssemble) {
      setNotice('Для сборки заполните все шесть слотов.');
      return;
    }

    const components = selectedComponents;
    const consumedIds = new Set(COMPONENT_CATEGORIES.map((category) => buildSlots[category]).filter(Boolean));
    const server: VirtualServer = {
      id: createId(),
      name: createServerName(save.servers.length),
      createdAt: Date.now(),
      components,
    };

    setSave((current) => ({
      ...current,
      inventory: current.inventory.filter((item) => !consumedIds.has(item.instanceId)),
      servers: [...current.servers, server],
    }));
    setBuildSlots(EMPTY_BUILD);
    setActiveTab('servers');
    setNotice(`${server.name} собран. Компоненты списаны со склада.`);
  };

  const handleClearBuild = () => {
    setBuildSlots(EMPTY_BUILD);
    setNotice('Конфигурация очищена. Детали остались на складе.');
  };

  const categoryItems = HARDWARE_CATALOG.filter((component) => component.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090E1A] dark:text-[#E6EDF7]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#090E1A]/95">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-cyan-500 hover:text-cyan-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-cyan-300"
              aria-label="Вернуться на портал"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold tracking-[0.14em]">NETWORK <span className="text-cyan-600 dark:text-[#22D3EE]">CORE</span></p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Gameplay / VPS Laboratory</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <Wallet size={16} className="text-emerald-700 dark:text-emerald-300" />
            <span className="text-xs font-bold tabular-nums text-emerald-800 dark:text-emerald-200">{save.balance.toLocaleString('ru-RU')} COIN</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10">
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#101726] sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-[#22D3EE]">Первая игровая лаборатория</p>
              <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Собери свой первый VPS</h1>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Покупай комплектующие, собирай виртуальные серверы и расширяй собственную инфраструктуру. Сейчас это игровой прототип: детали и баланс хранятся в браузере.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[340px]">
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/5">
                <p className="text-xl font-extrabold tabular-nums">{totalInventory}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">На складе</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/5">
                <p className="text-xl font-extrabold tabular-nums">{save.servers.length}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Серверов</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/5">
                <p className="text-xl font-extrabold tabular-nums">{selectedCount}/6</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Слотов сборки</p>
              </div>
            </div>
          </div>
        </section>

        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Разделы игры">
          {([
            ['shop', 'Магазин', ShoppingCart],
            ['build', 'Сборка VPS', Cpu],
            ['servers', 'Мои серверы', Server],
          ] as const).map(([tab, label, Icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab ? 'bg-cyan-600 text-white dark:bg-[#22D3EE] dark:text-[#07111D]' : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-500 dark:border-white/10 dark:bg-[#101726] dark:text-slate-300'}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {notice && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100" role="status">
            <CheckCircle2 size={16} className="shrink-0" />
            {notice}
          </div>
        )}

        {activeTab === 'shop' && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#101726]">
              <h2 className="mb-3 text-sm font-bold">Категории оборудования</h2>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {COMPONENT_CATEGORIES.map((category) => {
                  const Icon = CATEGORY_ICONS[category];
                  const count = inventoryByCategory.get(category)?.length ?? 0;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${activeCategory === category ? 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-300 dark:bg-cyan-400/10 dark:text-cyan-200 dark:ring-cyan-400/30' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`}
                    >
                      <span className="flex min-w-0 items-center gap-2"><Icon size={15} /><span className="truncate">{CATEGORY_LABELS[category]}</span></span>
                      <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] tabular-nums dark:bg-white/10">{count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Магазин комплектующих</p>
                  <h2 className="text-xl font-extrabold">{CATEGORY_LABELS[activeCategory]}</h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{categoryItems.length} позиций</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {categoryItems.map((component) => {
                  const Icon = CATEGORY_ICONS[component.category];
                  const canBuy = save.balance >= component.price;
                  return (
                    <article key={component.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-cyan-400 dark:border-white/10 dark:bg-[#101726] dark:hover:border-cyan-400/40">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300"><Icon size={21} /></div>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold tabular-nums dark:bg-white/5">{component.specs}</span>
                      </div>
                      <h3 className="mb-1 font-bold">{component.name}</h3>
                      <p className="mb-5 min-h-10 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{component.description}</p>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Цена</p><p className="text-lg font-extrabold tabular-nums">{component.price.toLocaleString('ru-RU')} <span className="text-xs text-emerald-700 dark:text-emerald-300">COIN</span></p></div>
                        <button type="button" onClick={() => handlePurchase(component)} disabled={!canBuy} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#22D3EE] dark:text-[#07111D] dark:hover:bg-cyan-300">Купить</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'build' && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#101726] sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs text-slate-500 dark:text-slate-400">Конструктор оборудования</p><h2 className="text-xl font-extrabold">Конфигурация нового VPS</h2></div>
                <button type="button" onClick={handleClearBuild} className="text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-cyan-700 dark:hover:text-cyan-300">Очистить слоты</button>
              </div>
              <div className="space-y-3">
                {COMPONENT_CATEGORIES.map((category) => {
                  const Icon = CATEGORY_ICONS[category];
                  const available = inventoryByCategory.get(category) ?? [];
                  return (
                    <label key={category} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-white/10 sm:flex-row sm:items-center">
                      <span className="flex min-w-[190px] items-center gap-2 text-sm font-semibold"><Icon size={17} className="text-cyan-700 dark:text-cyan-300" />{CATEGORY_LABELS[category]}</span>
                      <select value={buildSlots[category] ?? ''} onChange={(event) => handleSelectPart(category, event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-[#0B1220] dark:text-slate-100">
                        <option value="">Выберите компонент ({available.length} на складе)</option>
                        {available.map((item) => {
                          const component = getComponent(item.componentId);
                          if (!component) return null;
                          return <option key={item.instanceId} value={item.instanceId}>{component.name} — {component.specs}</option>;
                        })}
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#101726]">
              <div className="mb-4 flex items-center gap-2"><Server size={18} className="text-cyan-700 dark:text-cyan-300" /><h2 className="font-bold">Паспорт VPS</h2></div>
              <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-[#0B1220]">
                <div className="mx-auto mb-3 flex h-24 max-w-[190px] items-center justify-center rounded-xl border border-cyan-300/50 bg-gradient-to-br from-cyan-100 to-slate-100 dark:border-cyan-400/30 dark:from-cyan-400/10 dark:to-indigo-400/10">
                  <Server size={48} strokeWidth={1.2} className="text-cyan-700 dark:text-cyan-300" />
                </div>
                <p className="text-center text-xs font-bold tracking-wider">NCORE VIRTUAL NODE</p>
                <p className="mt-1 text-center text-[10px] text-slate-500 dark:text-slate-400">Слоты: {selectedCount}/6</p>
              </div>
              <div className="mb-5 space-y-2">
                {COMPONENT_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{CATEGORY_LABELS[category]}</span>
                    <span className="max-w-[150px] truncate font-semibold">{selectedComponents[category]?.specs ?? '—'}</span>
                  </div>
                ))}
              </div>
              <div className="mb-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-white/10"><span className="text-slate-500 dark:text-slate-400">Стоимость деталей</span><span className="font-extrabold tabular-nums">{selectedCost.toLocaleString('ru-RU')} COIN</span></div>
              <button type="button" onClick={handleAssemble} disabled={!canAssemble} className="w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#22D3EE] dark:text-[#07111D] dark:hover:bg-cyan-300">Собрать VPS</button>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">Для сборки нужны корпус, CPU, RAM, накопитель, сетевая карта и блок питания. Выбранные детали будут списаны со склада.</p>
            </aside>
          </section>
        )}

        {activeTab === 'servers' && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div><p className="text-xs text-slate-500 dark:text-slate-400">Твоя инфраструктура</p><h2 className="text-xl font-extrabold">Собранные VPS</h2></div>
              <button type="button" onClick={() => setActiveTab('build')} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white dark:bg-[#22D3EE] dark:text-[#07111D]">Новая сборка</button>
            </div>
            {save.servers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-white/15 dark:bg-[#101726]">
                <Server size={34} className="mx-auto mb-3 text-slate-400" />
                <h3 className="mb-1 font-bold">Пока нет ни одного VPS</h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Купи комплектующие в магазине и собери первый сервер.</p>
                <button type="button" onClick={() => setActiveTab('shop')} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white dark:bg-[#22D3EE] dark:text-[#07111D]">Перейти в магазин</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {save.servers.map((server) => (
                  <article key={server.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#101726]">
                    <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300"><Server size={22} /></div><div><h3 className="font-extrabold">{server.name}</h3><p className="text-[10px] text-slate-500 dark:text-slate-400">Создан {new Date(server.createdAt).toLocaleString('ru-RU')}</p></div></div><span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">СОБРАН</span></div>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPONENT_CATEGORIES.map((category) => (
                        <div key={category} className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/5"><p className="text-[10px] text-slate-500 dark:text-slate-400">{CATEGORY_LABELS[category]}</p><p className="truncate text-xs font-semibold">{server.components[category]?.specs ?? '—'}</p></div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-8 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-100 sm:flex-row sm:items-center">
          <Package size={16} className="shrink-0" />
          <p><strong>Режим прототипа.</strong> COIN — тестовые игровые очки без денежной стоимости. Сохранение привязано к этому браузеру и аккаунту; серверной синхронизации и реальных платежей нет.</p>
        </div>
      </main>
    </div>
  );
}
