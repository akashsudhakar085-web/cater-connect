'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HowItWorksModal } from '@/components/common/HowItWorksModal';

export function HowItWorksTrigger() {
    const [show, setShow] = useState(false);

    return (
        <>
            <button
                onClick={() => setShow(true)}
                className="fixed bottom-24 right-4 z-40 p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all shadow-xl"
            >
                <HelpCircle size={24} />
            </button>
            {show && <HowItWorksModal onClose={() => setShow(false)} />}
        </>
    );
}
