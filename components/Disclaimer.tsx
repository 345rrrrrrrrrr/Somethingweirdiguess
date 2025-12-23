
import React from 'react';
import { Card } from './ui/Card';

export const Disclaimer: React.FC = () => {
  return (
    <Card className="bg-amber-900/20 border-amber-500/30 mb-8">
      <div className="flex gap-3">
        <div className="text-amber-500 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-amber-500 uppercase text-sm tracking-wider mb-1">Important Security Disclaimer</h4>
          <p className="text-amber-200/80 text-xs leading-relaxed">
            This tool is for educational and personal security awareness purposes only. 
            <strong> We do not store your passwords or full email addresses on our servers.</strong> 
            Password checks use k-Anonymity, meaning only a partial hash is sent to external services. 
            Data breach information is retrieved via public sources and AI grounding. 
            Always use unique, complex passwords and enable Multi-Factor Authentication (MFA).
          </p>
        </div>
      </div>
    </Card>
  );
};
