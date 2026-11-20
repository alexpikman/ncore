import { useState } from 'react';

interface NodeInfo {
  id: string;
  label: string;
  x: number;
  y: number;
  role: string;
  layer: string;
}

const HERO_NODES: NodeInfo[] = [
  { id: 'core', label: 'CORE NODE', x: 325, y: 248, role: 'Координация топологии, проверка подписей и распределение задач', layer: 'Shared Services' },
  { id: 'p1', label: 'PEER 01', x: 145, y: 125, role: 'Узел участника: хранение реплик знаний и проверка тестов', layer: 'Participant Node' },
  { id: 'p2', label: 'PEER 02', x: 80, y: 260, role: 'Симулятор: маршрутизация тестовых пакетов и TLS-каналов', layer: 'Sandbox' },
  { id: 'p3', label: 'PEER 03', x: 190, y: 390, role: 'ИИ-агент: диагностика сбоев и поиск по Skill Registry', layer: 'Agent Runtime' },
  { id: 'p4', label: 'PEER 04', x: 490, y: 115, role: 'Узел участника: репликация артефактов и журналов событий', layer: 'Participant Node' },
  { id: 'p5', label: 'PEER 05', x: 565, y: 270, role: 'Песочница: проверка новых протоколов на стадии Testing', layer: 'Sandbox' },
  { id: 'p6', label: 'PEER 06', x: 450, y: 405, role: 'Шлюз задач: оценка вклада и аудит вычислительных лимитов', layer: 'Shared Services' },
];

export function HeroTopologyDiagram() {
  const [selectedId, setSelectedId] = useState<string>('core');
  const active = HERO_NODES.find((n) => n.id === selectedId) ?? HERO_NODES[0];

  return (
    <div className="bg-[#101726] border border-white/10 rounded-xl p-5 flex flex-col justify-between h-full">
      <svg
        viewBox="0 0 650 495"
        role="img"
        aria-label="Интерактивная схема распределённой сети узлов NETWORK CORE"
        className="w-full h-auto"
      >
        <defs>
          <radialGradient id="nc-glow">
            <stop stopColor="#22D3EE" stopOpacity="0.22" />
            <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="nc-wire" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <circle cx="325" cy="248" r="225" fill="url(#nc-glow)" />
        <g fill="none" stroke="url(#nc-wire)" strokeWidth="1.75" opacity="0.58">
          <path d="M325 248 145 125 80 260 190 390 325 248 490 115 565 270 450 405 325 248 145 125 490 115 565 270 190 390 450 405 80 260 325 248" />
          <path
            d="M145 125 190 390M490 115 450 405M80 260 565 270"
            strokeDasharray="5 7"
          />
        </g>

        {HERO_NODES.map((node) => {
          const isSelected = node.id === selectedId;
          const isCore = node.id === 'core';
          const size = isCore ? 70 : 62;
          const half = size / 2;
          return (
            <g
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedId(node.id);
                }
              }}
              aria-label={`Выбрать узел ${node.label}`}
            >
              <rect
                x={node.x - half}
                y={node.y - half}
                width={size}
                height={size}
                rx={isCore ? 14 : 12}
                fill={isSelected ? '#162C46' : '#0F1C2E'}
                stroke={isSelected ? '#22D3EE' : '#334E6F'}
                strokeWidth={isSelected ? 2.4 : 1.6}
              />
              {isCore ? (
                <g stroke="#CBD5E1" strokeWidth="1.8" fill="none">
                  <rect x="307" y="230" width="36" height="8" rx="2" />
                  <rect x="307" y="244" width="36" height="8" rx="2" />
                  <rect x="307" y="258" width="36" height="8" rx="2" />
                  <path d="M320 234h3m-3 14h3m-3 14h3" />
                </g>
              ) : (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill={isSelected ? '#22D3EE' : '#64748B'}
                />
              )}
              <text
                x={node.x}
                y={node.y + half + 19}
                textAnchor="middle"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fill={isSelected ? '#22D3EE' : '#94A3B8'}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-mono text-[#22D3EE] mr-2">{active.label}</span>
          <span className="text-[#94A3B8]">{active.role}</span>
        </div>
        <span className="text-[#64748B] whitespace-nowrap shrink-0">{active.layer}</span>
      </div>
    </div>
  );
}

const SERVER_PARTS = [
  { id: 'cpu', name: 'CPU · Вычислительный модуль', spec: '8 vCPU · изоляция контейнеров и маршрутизация пакетов' },
  { id: 'ram', name: 'RAM · Оперативная память', spec: '16 GB ECC · буферизация очередей и кэш DHT' },
  { id: 'nvme', name: 'NVMe · Хранилище реплик', spec: '250 GB · content-addressed блоки и локальные журналы' },
];

export function ServerAssemblyDiagram() {
  const [partId, setPartId] = useState<string>('cpu');
  const active = SERVER_PARTS.find((p) => p.id === partId) ?? SERVER_PARTS[0];

  return (
    <div className="bg-[#0B111E] border border-white/10 rounded-xl p-5">
      <svg
        viewBox="0 0 560 300"
        role="img"
        aria-label="Интерактивная сборка виртуального сервера"
        className="w-full h-auto"
      >
        <rect x="28" y="28" width="504" height="244" rx="16" fill="#0F1829" stroke="#293B57" />
        <rect x="64" y="64" width="432" height="172" rx="10" fill="#142035" stroke="#3B5375" />

        <g
          onClick={() => setPartId('cpu')}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setPartId('cpu')}
        >
          <rect
            x="98"
            y="96"
            width="118"
            height="98"
            rx="8"
            fill="#0A1220"
            stroke={partId === 'cpu' ? '#22D3EE' : '#38BDF8'}
            strokeWidth={partId === 'cpu' ? 2.5 : 1.5}
          />
          <rect x="122" y="118" width="70" height="54" rx="4" fill="#163552" stroke="#38BDF8" />
          <text x="157" y="149" textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#E6EDF7">
            CPU
          </text>
        </g>

        <g
          onClick={() => setPartId('ram')}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setPartId('ram')}
        >
          {[246, 290, 334].map((x) => (
            <rect
              key={x}
              x={x}
              y="92"
              width="34"
              height="108"
              rx="4"
              fill={partId === 'ram' ? '#13474E' : '#11333B'}
              stroke={partId === 'ram' ? '#22D3EE' : '#2D7B87'}
              strokeWidth={partId === 'ram' ? 2.2 : 1.2}
            />
          ))}
          <text x="263" y="150" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#D2F9EF">RAM</text>
          <text x="307" y="150" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#D2F9EF">RAM</text>
          <text x="351" y="150" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#D2F9EF">RAM</text>
        </g>

        <g
          onClick={() => setPartId('nvme')}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setPartId('nvme')}
        >
          <rect
            x="398"
            y="104"
            width="64"
            height="84"
            rx="6"
            fill="#1D2847"
            stroke={partId === 'nvme' ? '#22D3EE' : '#818CF8'}
            strokeWidth={partId === 'nvme' ? 2.4 : 1.4}
          />
          <text x="430" y="150" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#E6EDF7">
            NVMe
          </text>
        </g>

        <path d="M98 214h364M80 80h24M80 89h24" stroke="#38BDF8" strokeWidth="1.6" opacity="0.6" />
        <text x="280" y="256" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#64748B">
          VIRTUAL SERVER ASSEMBLY · НАЖМИТЕ НА СЛОТ
        </text>
      </svg>

      <div className="mt-3 pt-3 border-t border-white/10 text-xs flex flex-col gap-1">
        <span className="font-medium text-[#E6EDF7]">{active.name}</span>
        <span className="text-[#94A3B8]">{active.spec}</span>
      </div>
    </div>
  );
}

export function NetworkLayersDiagram() {
  return (
    <div className="bg-[#0B111E] border border-white/10 rounded-xl p-5">
      <svg
        viewBox="0 0 900 370"
        role="img"
        aria-label="Три уровня сетевой архитектуры NETWORK CORE"
        className="w-full h-auto"
      >
        <rect x="18" y="16" width="864" height="92" rx="12" fill="#122136" stroke="#3B628C" />
        <rect x="18" y="138" width="864" height="92" rx="12" fill="#0F262A" stroke="#2B7E78" />
        <rect x="18" y="260" width="864" height="92" rx="12" fill="#1C1933" stroke="#6E5CB0" />

        <text x="42" y="48" fontSize="16" fontWeight="700" fill="#E6EDF7">УРОВЕНЬ 1 · SANDBOX</text>
        <text x="42" y="75" fontSize="12" fill="#94A3B8">Виртуальные VPS · виртуальные IP · симуляция протоколов · изолированные задачи</text>

        <text x="42" y="170" fontSize="16" fontWeight="700" fill="#E6EDF7">УРОВЕНЬ 2 · PARTICIPANT NODES</text>
        <text x="42" y="197" fontSize="12" fill="#94D2CB">Домашние ПК · VPS · выделенные серверы · добровольно предоставленные ресурсы</text>

        <text x="42" y="292" fontSize="16" fontWeight="700" fill="#E6EDF7">УРОВЕНЬ 3 · SHARED SERVICES</text>
        <text x="42" y="319" fontSize="12" fill="#C4B5FD">Репликация · вычисления · хранилища · общие библиотеки · доступные сервисы</text>

        <g stroke="#22D3EE" strokeWidth="2.5" fill="none">
          <path d="M450 108v30m-7-7 7 7 7-7M450 230v30m-7-7 7 7 7-7" />
        </g>
      </svg>
    </div>
  );
}

const AGENTS = [
  { id: 'network', label: 'Network Agent', sub: 'диагностика', x: 160, y: 72, detail: 'Трассировка маршрутов, проверка потерь пакетов и топологии peer-узлов.' },
  { id: 'security', label: 'Security Agent', sub: 'анализ рисков', x: 450, y: 58, detail: 'Проверка манифестов разрешений, threat modeling и аудит зависимостей.' },
  { id: 'developer', label: 'Developer Agent', sub: 'код и тесты', x: 740, y: 72, detail: 'Подготовка спецификаций, автотестов и проверка совместимости модулей.' },
  { id: 'knowledge', label: 'Knowledge Agent', sub: 'поиск знаний', x: 160, y: 306, detail: 'RAG-поиск по индексированной документации с указанием версии и источника.' },
  { id: 'economy', label: 'Economy Agent', sub: 'аудит начислений', x: 450, y: 320, detail: 'Проверка воспроизводимости Contribution Score и журналов начислений.' },
  { id: 'monitoring', label: 'Monitoring Agent', sub: 'состояние узлов', x: 740, y: 306, detail: 'Анализ метрик доступности, задержек и соблюдения SLA в песочнице.' },
];

export function AiOrchestratorDiagram() {
  const [selected, setSelected] = useState<string>('network');
  const active = AGENTS.find((a) => a.id === selected) ?? AGENTS[0];

  return (
    <div className="bg-[#0B111E] border border-white/10 rounded-xl p-5">
      <svg
        viewBox="0 0 900 375"
        role="img"
        aria-label="Схема оркестратора ИИ-агентов"
        className="w-full h-auto"
      >
        <g stroke="#3B597A" strokeWidth="1.8" fill="none">
          <path d="M450 185 160 72M450 185 450 58M450 185 740 72M450 185 160 306M450 185 450 320M450 185 740 306" />
        </g>

        <rect x="345" y="140" width="210" height="90" rx="14" fill="#133140" stroke="#22D3EE" strokeWidth="2" />
        <text x="450" y="177" fill="#FFFFFF" textAnchor="middle" fontSize="16" fontWeight="700">
          AI ORCHESTRATOR
        </text>
        <text x="450" y="201" fill="#94D2CB" textAnchor="middle" fontSize="11">
          политики · инструменты · маршрутизация
        </text>

        {AGENTS.map((agent) => {
          const isSelected = agent.id === selected;
          return (
            <g
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(agent.id)}
            >
              <rect
                x={agent.x - 90}
                y={agent.y - 40}
                width="180"
                height="80"
                rx="11"
                fill={isSelected ? '#152945' : '#111D30'}
                stroke={isSelected ? '#22D3EE' : '#3B628C'}
                strokeWidth={isSelected ? 2.2 : 1.5}
              />
              <text x={agent.x} y={agent.y - 4} fill="#E6EDF7" textAnchor="middle" fontSize="13" fontWeight="600">
                {agent.label}
              </text>
              <text x={agent.x} y={agent.y + 17} fill="#94A3B8" textAnchor="middle" fontSize="11">
                {agent.sub}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 pt-3 border-t border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-mono text-[#22D3EE] mr-2">{active.label}</span>
          <span className="text-[#CBD5E1]">{active.detail}</span>
        </div>
      </div>
    </div>
  );
}

export function SystemArchitectureDiagram() {
  return (
    <div className="bg-[#0B111E] border border-white/10 rounded-xl p-5">
      <svg
        viewBox="0 0 900 470"
        role="img"
        aria-label="Модульная системная архитектура NETWORK CORE"
        className="w-full h-auto"
      >
        <rect x="25" y="16" width="850" height="68" rx="10" fill="#122136" stroke="#3B628C" />
        <text x="450" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700">CLIENT LAYER</text>
        <text x="450" y="65" textAnchor="middle" fill="#94A3B8" fontSize="12">Web UI · Desktop Node Client · Admin Console</text>

        <path d="M450 84v28m-6-7 6 7 6-7" stroke="#22D3EE" strokeWidth="2" fill="none" />

        <rect x="25" y="114" width="850" height="68" rx="10" fill="#0F2833" stroke="#2D8188" />
        <text x="450" y="142" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700">API & IDENTITY</text>
        <text x="450" y="163" textAnchor="middle" fill="#94D2CB" fontSize="12">API Gateway · Auth · Permission Engine · Node Registry</text>

        <path d="M450 182v26" stroke="#22D3EE" strokeWidth="2" fill="none" />

        <g fill="#141F35" stroke="#536C99">
          <rect x="25" y="210" width="200" height="86" rx="10" />
          <rect x="245" y="210" width="200" height="86" rx="10" />
          <rect x="465" y="210" width="200" height="86" rx="10" />
          <rect x="685" y="210" width="190" height="86" rx="10" />
        </g>

        <g fill="#E6EDF7" textAnchor="middle" fontSize="13" fontWeight="600">
          <text x="125" y="246">GAME SERVICES</text>
          <text x="125" y="268" fontSize="11" fontWeight="400" fill="#94A3B8">tasks · profiles · VPS</text>
          <text x="345" y="246">NETWORK CORE</text>
          <text x="345" y="268" fontSize="11" fontWeight="400" fill="#94A3B8">P2P · node agent</text>
          <text x="565" y="246">AI & KNOWLEDGE</text>
          <text x="565" y="268" fontSize="11" fontWeight="400" fill="#94A3B8">agents · RAG · skills</text>
          <text x="780" y="246">ECONOMY</text>
          <text x="780" y="268" fontSize="11" fontWeight="400" fill="#94A3B8">ledger · rewards</text>
        </g>

        <path d="M125 296v32h655v-32M345 296v32M565 296v32" fill="none" stroke="#3B628C" strokeWidth="1.8" />

        <rect x="25" y="330" width="850" height="114" rx="10" fill="#1C1933" stroke="#6E5CB0" />
        <text x="450" y="362" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700">DATA & TRUST LAYER</text>
        <text x="450" y="388" textAnchor="middle" fill="#C4B5FD" fontSize="12">PostgreSQL · Object Storage · Search Index · Signed Event Log · Monitoring</text>
        <text x="450" y="416" textAnchor="middle" fill="#94A3B8" fontSize="11">Secrets management · backups · audit trails · policy enforcement</text>
      </svg>
    </div>
  );
}
