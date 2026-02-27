import React, { useState } from 'react';
import { Share2, Check, Copy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShareStudyPlan } from '../hooks/useShareStudyPlan';

type ShareStatus = 'idle' | 'sharing' | 'shared' | 'copied' | 'error';

export default function ShareButton() {
  const { isAvailable, shareStudyPlan } = useShareStudyPlan();
  const [status, setStatus] = useState<ShareStatus>('idle');

  const handleShare = async () => {
    if (!isAvailable || status === 'sharing') return;

    setStatus('sharing');
    try {
      const result = await shareStudyPlan();

      if (result.success && result.method === 'share') {
        setStatus('shared');
        setTimeout(() => setStatus('idle'), 2000);
      } else if (result.success && result.method === 'clipboard') {
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 2500);
      } else if (result.method === 'share' && !result.success) {
        // User cancelled — silently reset
        setStatus('idle');
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  if (!isAvailable) return null;

  const iconClass = 'w-4 h-4 shrink-0';

  const icon =
    status === 'sharing' ? (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
    ) : status === 'shared' ? (
      <Check className={iconClass} />
    ) : status === 'copied' ? (
      <Copy className={iconClass} />
    ) : status === 'error' ? (
      <AlertCircle className={iconClass} />
    ) : (
      <Share2 className={iconClass} />
    );

  const label =
    status === 'sharing'
      ? 'Sharing…'
      : status === 'shared'
      ? 'Shared!'
      : status === 'copied'
      ? 'Copied!'
      : status === 'error'
      ? 'Try again'
      : 'Share Plan';

  const variantClass =
    status === 'shared' || status === 'copied'
      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
      : status === 'error'
      ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20'
      : '';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={status === 'sharing'}
      className={`flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 ${variantClass}`}
    >
      {icon}
      {label}
    </Button>
  );
}
