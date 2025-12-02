import React from "react";

export default function ThankYou() {
  return (
    <div className="min-h-screen  flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-50 animate-pulse"></div>

      {/* Main Card */}
      <div className="max-w-md w-full  backdrop-blur-xl border border-slate-800 rounded-2xl p-8 md:p-10 text-center shadow-2xl relative z-10">
        
        {/* Animated Icon Wrapper */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Ripple Animation */}
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <svg 
                className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="3" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-3xl font-bold  tracking-tight">
          Merci !
        </h1>
        
        <p className=" text-lg mb-8 leading-relaxed">
          Votre réponse a été enregistrée avec succès. <br/>
          Nous vous remercions pour le temps que vous avez consacré.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {/* Changed Link to <a> tag to prevent Router context errors in preview */}
          <a 
            href="/" 
            className="group block w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            Retour à l’accueil
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </a>
          
          <p className="text-xs text-slate-600 mt-6">
            Vous pouvez maintenant fermer cet onglet.
          </p>
        </div>

      </div>
    </div>
  );
}
