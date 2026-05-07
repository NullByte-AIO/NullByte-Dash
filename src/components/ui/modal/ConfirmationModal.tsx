"use client";
import React from "react";
import { Modal } from "./index";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation Required",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 shadow-red-500/20";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20";
      default:
        return "bg-[#05FF00] hover:bg-[#04CC00] shadow-[#05FF00]/20";
    }
  };

  const getTextColor = () => {
    return variant === "danger" || variant === "warning" ? "text-white" : "text-black";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-[400px]">
      <div className="p-8">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">
          {title}
        </h3>
        <p className="text-sm text-white/60 mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${getVariantColor()} ${getTextColor()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
