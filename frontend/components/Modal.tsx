import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ASSETS } from '../constants';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Content Container */}
            <div className={`relative bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border border-slate-200/80 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                
                {/* Identity Top Gradient Bar (Royal Blue to Gold) */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#002D62] via-blue-600 to-[#D4AF37]" />

                {/* Club Logo Transparent Watermark Backdrop */}
                <div className="absolute -right-10 -bottom-10 w-80 h-80 opacity-[0.06] pointer-events-none select-none z-0">
                    <img src={ASSETS.logo} alt="" className="w-full h-full object-contain" />
                </div>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 bg-white/85 backdrop-blur-sm relative z-10">
                        <div className="flex items-center gap-3">
                            <img src={ASSETS.logo} alt="USAT" className="w-7 h-7 object-contain drop-shadow-sm" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-[#002D62] font-display">
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors group"
                        >
                            <X className="w-5 h-5 group-hover:text-red-600" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-6 max-h-[80vh] overflow-y-auto text-slate-700 relative z-10">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
