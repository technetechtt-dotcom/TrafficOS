import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Keep it',
  tone = 'danger'
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-6">
        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {message}
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={() => {
              onConfirm();
              onClose();
            }}>
            
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>);

}