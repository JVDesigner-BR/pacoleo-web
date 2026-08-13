"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Droplet, 
  Droplets, 
  Zap, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Image as ImageIcon 
} from "lucide-react";
import { toPng } from "html-to-image";

export default function AdminMarketingPage() {
  const [globalTotal, setGlobalTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<"feed" | "story" | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGlobalImpact();
  }, []);

  const fetchGlobalImpact = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_impacto_global");
    setGlobalTotal(Number(data) || 0);
    setLoading(false);
  };

  const handleDownload = async (ref: React.RefObject<HTMLDivElement | null>, filename: string, type: "feed" | "story") => {
    if (ref.current === null) return;
    
    setGenerating(type);
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro ao gerar a imagem. Tente novamente.");
    } finally {
      setGenerating(null);
    }
  };

  const suggestedCaption = `Transformando resíduo em impacto positivo real! 🌱\n\nNossa rede de estabelecimentos parceiros da PacÓleo já alcançou números incríveis:\n\n🛢️ ${globalTotal.toLocaleString("pt-BR")} Litros de óleo vegetal reciclado com destinação correta.\n💧 ${(globalTotal * 25000).toLocaleString("pt-BR")} Litros de água potável preservada de contaminação.\n⚡ ${(globalTotal * 0.8).toLocaleString("pt-BR")} Litros de biodiesel sustentável gerado.\n\nSua empresa também pode fazer parte dessa mudança ecológica com 100% de rastreabilidade (MTR & CDF).\n\n#PacOleo #Sustentabilidade #EconomiaCircular #ESG #PreservacaoDaAgua #Biodiesel #MeioAmbiente #GestaoDeResiduos`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(suggestedCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#3DB5D9]/10 p-2 rounded-xl text-[#3DB5D9]">
              <ImageIcon size={22} className="stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Gerador de Conteúdo para Marketing
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Exporte peças visuais atualizadas em tempo real com o impacto ambiental da PacÓleo para redes sociais.
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#3DB5D9]/20 border-t-[#3DB5D9] rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Sincronizando métricas para peças gráficas...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Visual Pieces Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Post de Feed (1:1) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base">Post para Feed (1:1)</h2>
                  <p className="text-xs text-slate-400">Ideal para Instagram, LinkedIn e Facebook</p>
                </div>
                <button 
                  onClick={() => handleDownload(feedRef, "pacoleo_impacto_feed.png", "feed")}
                  disabled={generating === "feed"}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3DB5D9] hover:bg-[#329fbe] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#3DB5D9]/20 disabled:opacity-60 cursor-pointer"
                >
                  {generating === "feed" ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Baixar PNG</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center p-2 shadow-inner">
                <div 
                  ref={feedRef} 
                  className="bg-[#1F2937] relative flex flex-col justify-center items-center overflow-hidden shrink-0 select-none"
                  style={{ width: "1080px", height: "1080px", transform: "scale(0.35)", transformOrigin: "top left", marginBottom: "-702px", marginRight: "-702px" }}
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DB5D9] rounded-full blur-[120px] opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-[120px] opacity-10"></div>
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-branca.png" alt="PacÓleo" width={400} className="mb-16 z-10" />
                  
                  <h1 className="text-white text-6xl font-bold text-center mb-16 z-10 leading-tight">
                    Impacto Positivo <br/> da Nossa Rede!
                  </h1>

                  <div className="grid grid-cols-1 gap-10 z-10 w-4/5">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 flex items-center gap-8 border border-white/20">
                      <div className="w-32 h-32 bg-[#3DB5D9] rounded-2xl flex items-center justify-center text-white shrink-0">
                        <Droplet size={64} />
                      </div>
                      <div>
                        <h2 className="text-7xl font-black text-white">{globalTotal.toLocaleString("pt-BR")} L</h2>
                        <p className="text-3xl text-gray-300 mt-2">de Óleo Reciclado</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 flex items-center gap-8 border border-white/20">
                      <div className="w-32 h-32 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                        <Droplets size={64} />
                      </div>
                      <div>
                        <h2 className="text-7xl font-black text-white">{(globalTotal * 25000).toLocaleString("pt-BR")} L</h2>
                        <p className="text-3xl text-gray-300 mt-2">de Água Preservada</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Post de Story (9:16) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base">Story & Reels (9:16)</h2>
                  <p className="text-xs text-slate-400">Ideal para Instagram Stories e WhatsApp Status</p>
                </div>
                <button 
                  onClick={() => handleDownload(storyRef, "pacoleo_impacto_story.png", "story")}
                  disabled={generating === "story"}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3DB5D9] hover:bg-[#329fbe] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#3DB5D9]/20 disabled:opacity-60 cursor-pointer"
                >
                  {generating === "story" ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Baixar PNG</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center p-2 shadow-inner">
                <div 
                  ref={storyRef} 
                  className="bg-[#1F2937] relative flex flex-col justify-center items-center overflow-hidden shrink-0 select-none"
                  style={{ width: "1080px", height: "1920px", transform: "scale(0.2)", transformOrigin: "top left", marginBottom: "-1536px", marginRight: "-864px" }}
                >
                  <div className="absolute top-20 right-20 w-80 h-80 bg-[#3DB5D9] rounded-full blur-[100px] opacity-30"></div>
                  <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-500 rounded-full blur-[100px] opacity-20"></div>
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-branca.png" alt="PacÓleo" width={450} className="mb-24 z-10" />
                  
                  <h1 className="text-white text-7xl font-bold text-center mb-24 z-10 leading-tight">
                    Nosso Impacto <br/> Positivo!
                  </h1>

                  <div className="flex flex-col gap-12 z-10 w-4/5">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 flex flex-col items-center gap-6 border border-white/20 text-center">
                      <div className="w-32 h-32 bg-[#3DB5D9] rounded-full flex items-center justify-center text-white shrink-0">
                        <Droplet size={64} />
                      </div>
                      <div>
                        <h2 className="text-8xl font-black text-[#3DB5D9]">{globalTotal.toLocaleString("pt-BR")} L</h2>
                        <p className="text-4xl text-gray-200 mt-4">de Óleo Reciclado</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 flex flex-col items-center gap-6 border border-white/20 text-center">
                      <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <Droplets size={64} />
                      </div>
                      <div>
                        <h2 className="text-8xl font-black text-blue-400">{(globalTotal * 25000).toLocaleString("pt-BR")} L</h2>
                        <p className="text-4xl text-gray-200 mt-4">de Água Preservada</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 flex flex-col items-center gap-6 border border-white/20 text-center">
                      <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <Zap size={64} />
                      </div>
                      <div>
                        <h2 className="text-8xl font-black text-green-400">{(globalTotal * 0.8).toLocaleString("pt-BR")} L</h2>
                        <p className="text-4xl text-gray-200 mt-4">de Biodiesel Gerado</p>
                      </div>
                    </div>
                  </div>

                  <p className="absolute bottom-16 text-gray-400 text-3xl font-medium z-10">Juntos por um futuro sustentável 🌱</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda Pronta para Redes Sociais */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Legenda Sugerida Pronta para Redes Sociais</h3>
                  <p className="text-xs text-slate-400">Copie o texto pronto com hashtags e métricas atualizadas para acompanhar seu post.</p>
                </div>
              </div>

              <button
                onClick={handleCopyCaption}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  copiedCaption
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                }`}
              >
                {copiedCaption ? (
                  <>
                    <Check size={14} />
                    <span>Legenda Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar Legenda</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs sm:text-sm text-slate-700 font-mono whitespace-pre-line leading-relaxed">
              {suggestedCaption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

