import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { DeliveryMethod } from '../../types';
import { DeliveryOption, formatAddress } from '../../utils/natis';
import { formatCurrency } from '../../utils/formatters';
import { ChangeAddressModal } from '../modals/ChangeAddressModal';
import { HomeIcon } from 'lucide-react';

interface DeliveryOptionPickerProps {
  options: DeliveryOption[];
  value: DeliveryMethod;
  onChange: (method: DeliveryMethod) => void;
}

export function DeliveryOptionPicker({
  options,
  value,
  onChange
}: DeliveryOptionPickerProps) {
  const { state } = useAppStore();
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="space-y-2" role="radiogroup" aria-label="Delivery method">
        {options.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
              isSelected ?
              'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' :
              'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
              }>
              
              <span
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                isSelected ?
                'border-blue-600 dark:border-blue-500' :
                'border-gray-300 dark:border-gray-600'}`
                }>
                
                {isSelected &&
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                }
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </span>
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                {option.fee === 0 ? 'Free' : formatCurrency(option.fee)}
              </span>
            </button>);

        })}
      </div>

      {value !== 'collect' &&
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <HomeIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Deliver to</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {state.address ?
            formatAddress(state.address) :
            'No address on file'}
            </p>
          </div>
          <button
          type="button"
          onClick={() => setIsAddressOpen(true)}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">
          
            {state.address ? 'Change' : 'Add'}
          </button>
        </div>
      }

      <ChangeAddressModal
        isOpen={isAddressOpen}
        onClose={() => setIsAddressOpen(false)} />
      
    </div>);

}