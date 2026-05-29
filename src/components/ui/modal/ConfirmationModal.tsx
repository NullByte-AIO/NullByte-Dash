"use client";
import React, { useEffect } from "react";

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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-slow"
        onClick={onClose}
      />
      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-[400px] mx-4 animate-tactical-flash">
        <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
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
        </div>
      </div>
    </div>
  );
};
