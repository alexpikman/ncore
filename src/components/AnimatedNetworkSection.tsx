const METRICS = [
  { label: 'Узлы', value: 'N', note: 'участники и лаборатории' },
  { label: 'Проверки', value: 'TEST', note: 'воспроизводимые сценарии' },
  { label: 'Знания', value: 'KB', note: 'версии и источники' },
];

export function AnimatedNetworkSection() {
  return (
    <section className="border-y border-white/10 bg-[#0B1220] py-16 sm:py-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-2">
            Система в движении
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#E6EDF7] text-balance mb-3">
            От сетевого узла — к общей инфраструктуре
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Визуальная модель будущего контура Ncore: изолированные эксперименты,
            проверка результата и накопление повторно используемых знаний.
            Это схема направления разработки, а не работающая P2P-сеть.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#101B2D] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-mono text-xs tracking-wider text-[#22D3EE]">PEER MESH / CONCEPT</span>
              <span className="inline-flex items-center gap-2 text-[11px] text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
                MODEL VIEW
              </span>
            </div>
            <svg viewBox="0 0 760 390" role="img" aria-label="Анимированная концептуальная схема взаимодействия сетевых узлов" className="w-full h-auto">
              <defs>
                <radialGradient id="mesh-aura">
                  <stop stopColor="#22D3EE" stopOpacity=".2" />
                  <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="mesh-stroke" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#22D3EE" />
                  <stop offset="1" stopColor="#818CF8" />
                </linearGradient>
              </defs>
              <circle cx="380" cy="190" r="170" fill="url(#mesh-aura)" />
              <g fill="none" stroke="url(#mesh-stroke)" strokeWidth="2" opacity=".7">
                <path className="nc-flow-line" d="M380 190 150 75 100 205 210 325 380 190 610 75 665 205 550 325 380 190" />
                <path className="nc-flow-line nc-flow-line-delay" d="M150 75 610 75M100 205 665 205M210 325 550 325" />
              </g>
              <g fill="#10243A" stroke="#3B628C" strokeWidth="2">
                <rect x="320" y="140" width="120" height="100" rx="18" stroke="#22D3EE" />
                <rect x="105" y="35" width="90" height="80" rx="14" />
                <rect x="55" y="165" width="90" height="80" rx="14" />
                <rect x="165" y="285" width="90" height="80" rx="14" />
                <rect x="565" y="35" width="90" height="80" rx="14" />
                <rect x="620" y="165" width="90" height="80" rx="14" />
                <rect x="505" y="285" width="90" height="80" rx="14" />
              </g>
              <g fill="#E6EDF7" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                <text x="380" y="185" fontSize="17" fontWeight="700">NCORE</text>
                <text x="380" y="207" fontSize="10" fill="#94A3B8">SHARED CORE</text>
                <text x="150" y="81" fontSize="12">PEER 01</text>
                <text x="100" y="211" fontSize="12">PEER 02</text>
                <text x="210" y="331" fontSize="12">PEER 03</text>
                <text x="610" y="81" fontSize="12">PEER 04</text>
                <text x="665" y="211" fontSize="12">PEER 05</text>
                <text x="550" y="331" fontSize="12">PEER 06</text>
              </g>
              <g fill="#22D3EE">
                <circle className="nc-node-pulse" cx="380" cy="140" r="5" />
                <circle className="nc-node-pulse nc-node-pulse-delay" cx="150" cy="35" r="4" />
                <circle className="nc-node-pulse nc-node-pulse-delay-2" cx="610" cy="35" r="4" />
              </g>
            </svg>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4 border-t border-white/10 text-[11px] text-[#94A3B8]">
              <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#22D3EE]" /> Узел участника</span>
              <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#818CF8]" /> Общий сервис</span>
              <span>Связи показаны концептуально</span>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {METRICS.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-[#101B2D] p-5 flex lg:flex-col justify-between gap-2">
                <div>
                  <p className="text-xs text-[#94A3B8]">{metric.label}</p>
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-[#E6EDF7] mt-2">{metric.value}</p>
                </div>
                <p className="text-xs text-[#64748B]">{metric.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div className="rounded-2xl border border-white/10 bg-[#101B2D] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-sm font-semibold text-[#E6EDF7]">Цикл инженерной задачи</h3>
              <span className="font-mono text-[10px] text-[#64748B]">PROPOSED FLOW</span>
            </div>
            <svg viewBox="0 0 620 150" role="img" aria-label="Четыре стадии инженерной задачи" className="w-full h-auto">
              <path d="M70 52H550" stroke="#334E6F" strokeWidth="3" strokeLinecap="round" />
              <path className="nc-flow-line" d="M70 52H550" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" fill="none" />
              {[
                { x: 70, n: '01', label: 'Задача' },
                { x: 230, n: '02', label: 'Запуск' },
                { x: 390, n: '03', label: 'Проверка' },
                { x: 550, n: '04', label: 'Знание' },
              ].map((step) => (
                <g key={step.n}>
                  <circle cx={step.x} cy="52" r="20" fill="#123247" stroke="#22D3EE" strokeWidth="2" />
                  <text x={step.x} y="56" fill="#E6EDF7" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace">{step.n}</text>
                  <text x={step.x} y="100" fill="#CBD5E1" textAnchor="middle" fontSize="12">{step.label}</text>
                </g>
              ))}
            </svg>
            <p className="text-xs leading-relaxed text-[#64748B]">Результат должен сопровождаться тестами, версией решения и источниками.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101B2D] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-sm font-semibold text-[#E6EDF7]">Рост экосистемы</h3>
              <span className="font-mono text-[10px] text-[#64748B]">STAGED BUILD</span>
            </div>
            <svg viewBox="0 0 620 150" role="img" aria-label="Последовательные этапы развития экосистемы" className="w-full h-auto">
              <path d="M42 118 180 96 318 72 456 43 578 18" stroke="#334E6F" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path className="nc-chart-draw" d="M42 118 180 96 318 72 456 43 578 18" stroke="#22D3EE" strokeWidth="3" fill="none" strokeLinecap="round" />
              {[[42,118],[180,96],[318,72],[456,43],[578,18]].map(([x,y], index) => (
                <circle key={index} cx={x} cy={y} r="6" fill="#22D3EE" className="nc-node-pulse" />
              ))}
              <g fill="#94A3B8" fontSize="11" textAnchor="middle">
                <text x="42" y="145">Portal</text><text x="180" y="123">Lab</text><text x="318" y="99">Peers</text><text x="456" y="70">Agents</text><text x="578" y="45">Ecosystem</text>
              </g>
            </svg>
            <p className="text-xs leading-relaxed text-[#64748B]">Схема этапов, не фактическая метрика прогресса или прогноз сроков.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
