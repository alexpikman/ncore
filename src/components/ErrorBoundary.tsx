import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Непредвиденная ошибка интерфейса',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portal ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let readableMessage = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string; operationType?: string; path?: string };
        if (parsed.error) {
          readableMessage = `${parsed.error} (${parsed.operationType ?? 'operation'} · ${parsed.path ?? 'unknown'})`;
        }
      } catch {
        // Keep original message if not JSON
      }

      return (
        <div className="min-h-screen bg-[#090E1A] text-[#E6EDF7] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#101726] border border-white/10 rounded-xl p-8">
            <p className="text-xs font-medium tracking-wider uppercase text-[#22D3EE] mb-2">
              Сбой загрузки данных
            </p>
            <h2 className="text-xl font-bold mb-3">
              Не удалось обработать запрос к хранилищу
            </h2>
            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed break-words">
              {readableMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium bg-[#22D3EE] text-[#090E1A] rounded-lg hover:bg-[#38BDF8] transition-colors whitespace-nowrap"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
