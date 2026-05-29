'use client';

import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const supabase = createClient();

  const handleDiscordLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#05FF00]/10 rounded-full blur-[128px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00A3FF]/10 rounded-full blur-[128px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md p-8 backdrop-blur-2xl bg-white/[0.02] border border-white/[0.05] rounded-3xl shadow-2xl z-10 flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-[#05FF00]/20 to-[#00A3FF]/20 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(5,255,0,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#05FF00]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <svg className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 text-center tracking-tight">
          System Vault
        </h1>
        <p className="text-white/40 text-center mb-8 text-sm">
          Strict Access Protocol Initiated
        </p>

        {error === 'not_whitelisted' && (
          <div className="w-full mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <div>
              <h3 className="text-sm font-medium text-red-400">Access Denied</h3>
              <p className="text-xs text-red-400/70 mt-1">Your Discord ID is not whitelisted by the Administrator.</p>
            </div>
          </div>
        )}

        {error === 'auth_failed' && (
          <div className="w-full mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <div>
              <h3 className="text-sm font-medium text-red-400">Authentication Failed</h3>
              <p className="text-xs text-red-400/70 mt-1">An error occurred during the OAuth handshake.</p>
            </div>
          </div>
        )}

        <button
          onClick={handleDiscordLogin}
          className="w-full relative group overflow-hidden rounded-xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-[#7289da] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-[#0B0F19]/80 backdrop-blur-xl rounded-xl transition-all duration-300 group-hover:bg-[#0B0F19]/60">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            <span className="font-semibold text-white tracking-wide">Authorize via Discord</span>
          </div>
        </button>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F19]" />}>
      <LoginContent />
    </Suspense>
  );
}
