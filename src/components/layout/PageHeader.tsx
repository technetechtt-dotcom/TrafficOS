import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Label for the back control. Defaults to "Back". */
  backLabel?: string;
  /** Rendered at the end of the title row — usually a primary action. */
  actions?: React.ReactNode;
  /** Hide the back control on top-level pages reached directly from nav. */
  hideBack?: boolean;
}

/**
 * Standard page header with a working back control. Back pops the navigation
 * history in the store, so every page — however deep — always has a way out.
 */
export function PageHeader({
  title,
  description,
  backLabel = 'Back',
  actions,
  hideBack = false
}: PageHeaderProps) {
  const { state, dispatch } = useAppStore();
  const canGoBack = !hideBack && state.navHistory.length > 0;

  return (
    <div className="space-y-4">
      {canGoBack &&
      <button
        onClick={() =>
        dispatch({
          type: 'GO_BACK'
        })
        }
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
        
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
          {backLabel}
        </button>
      }
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {description &&
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              {description}
            </p>
          }
        </div>
        {actions && <div className="flex gap-3 flex-shrink-0">{actions}</div>}
      </div>
    </div>);

}