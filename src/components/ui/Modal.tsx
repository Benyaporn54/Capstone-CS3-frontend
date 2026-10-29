"use client";

import React, { useEffect, ReactNode } from "react";
import { Button, ButtonVariant } from "./Button";

export type ModalType = "success" | "danger" | "warning" | "info";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ModalType;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  type = "info",
  title,
  description,
  confirmLabel = "ตกลง",
  cancelLabel = "ยกเลิก",
  onConfirm,
  showCancel = false,
}) => {
  if (!isOpen) return null;

  const typeConfig: Record<
    ModalType,
    { icon: ReactNode; bgClass: string; buttonVariant: ButtonVariant }
  > = {
    success: {
      bgClass: "bg-success-soft text-success",
      buttonVariant: "primary",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    danger: {
      bgClass: "bg-error-soft text-error",
      buttonVariant: "danger-light",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    warning: {
      bgClass: "bg-warning-soft text-warning",
      buttonVariant: "primary",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bgClass: "bg-accent-soft text-accent",
      buttonVariant: "primary",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const currentType = typeConfig[type];

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="bg-bg shadow-pop border-border relative z-10 flex w-full max-w-sm flex-col items-center rounded-lg border p-6 text-center transition-all">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${currentType.bgClass}`}
        >
          {currentType.icon}
        </div>

        <h3 className="text-h3 text-fg mb-1 font-semibold">{title}</h3>
        {description && (
          <p className="text-body text-fg-muted mb-6">{description}</p>
        )}

        <div className="mt-2 flex w-full justify-end gap-3">
          {showCancel && (
            <Button variant="ghost" onClick={onClose} className="w-full">
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={currentType.buttonVariant}
            onClick={handleConfirm}
            className="w-full"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
