"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Droplet, Droplets, Zap, Download } from "lucide-react";
import { toPng } from "html-to-image";

export default function AdminMarketingPage() {
  const [globalTotal, setGlobalTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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

  const handleDownload = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (ref.current === null) return;
    
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro ao gerar a imagem. Tente novamente.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Marketing e Redes Sociais</h1>
      
      {loading ? (
        <div className="py-20 text-center text-gray-500">Calculando impacto global...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Post de Feed (1080x1080 -> scale down to fit UI) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Post Feed (1:1)</h2>
              <button 
                onClick={() => handleDownload(feedRef, "pacoleo_impacto_feed.png")}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#3DB5D9] text-white rounded hover:bg-[#349ec0] text-sm transition-colors"
              >
                <Download size={16} /> Baixar PNG
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center p-4">
              <div 
                ref={feedRef} 
                className="bg-[#1F2937] relative flex flex-col justify-center items-center overflow-hidden shrink-0"
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

          {/* Post de Story (1080x1920) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Story (9:16)</h2>
              <button 
                onClick={() => handleDownload(storyRef, "pacoleo_impacto_story.png")}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#3DB5D9] text-white rounded hover:bg-[#349ec0] text-sm transition-colors"
              >
                <Download size={16} /> Baixar PNG
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center p-4">
              <div 
                ref={storyRef} 
                className="bg-[#1F2937] relative flex flex-col justify-center items-center overflow-hidden shrink-0"
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
      )}
    </div>
  );
}
