// Branded Toast Notification System for Cater Connect

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

export function showToast({ message, type = 'info', duration = 3000 }: ToastOptions) {
    // Remove any existing toasts
    const existing = document.getElementById('cater-toast');
    if (existing) existing.remove();

    // Create toast container
    const toast = document.createElement('div');
    toast.id = 'cater-toast';
    toast.className = 'fixed top-4 right-4 z-[9999] animate-slide-in';

    // Color schemes based on type
    const colors = {
        success: 'bg-green-500/90 border-green-400',
        error: 'bg-red-500/90 border-red-400',
        warning: 'bg-orange-500/90 border-orange-400',
        info: 'bg-primary/90 border-primary',
    };

    toast.innerHTML = `
    <div class="glass-dark ${colors[type]} border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-xl min-w-[300px] max-w-md">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
          </div>
        </div>
        <div class="flex-1">
          <p class="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Cater Connect</p>
          <p class="text-sm font-bold text-white">${message}</p>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        toast.style.animation = 'slide-out 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slide-out {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `;
    document.head.appendChild(style);
}
