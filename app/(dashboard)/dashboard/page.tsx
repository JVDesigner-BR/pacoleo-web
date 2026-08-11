"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Droplet, Droplets, Zap, Leaf, TrendingUp } from "lucide-react";
import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function DashboardPage() {
  const [tab, setTab] = useState<"meu" | "global">("meu");
  const [meuTotal, setMeuTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState<"todos" | "semana" | "mes">("todos");
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [globalFilter]);

  const fetchData = async () => {
    setLoading(true);
    
    // Pegar o total do usuário
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: cliente } = await supabase
        .from("clientes")
        .select("nome_empresa")
        .eq("id", session.user.id)
        .single();
      
      if (cliente) {
        // Remove the numeric ID prefix (e.g. "[204] ") from the company name
        setCompanyName(cliente.nome_empresa.replace(/^\[\d+\]\s*/, ''));
      }

      const { data: coletas } = await supabase
        .from("coletas")
        .select("litros_coletados, data_coleta")
        .eq("cliente_id", session.user.id);
        
      if (coletas) {
        const sum = coletas.reduce((acc, curr) => acc + Number(curr.litros_coletados), 0);
        setMeuTotal(sum);
        
        // Build chart data grouped by month
        const grouped: Record<string, number> = {};
        coletas.forEach(c => {
          if (!c.data_coleta) return;
          const [ano, mes] = c.data_coleta.split("-");
          const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
          const monthName = months[parseInt(mes, 10) - 1];
          const key = `${monthName}/${ano.substring(2)}`;
          grouped[key] = (grouped[key] || 0) + Number(c.litros_coletados);
        });

        // Ensure chronological order
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
          const [mA, yA] = a.split("/");
          const [mB, yB] = b.split("/");
          const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
          if (yA !== yB) return Number(yA) - Number(yB);
          return months.indexOf(mA) - months.indexOf(mB);
        });

        const formattedChartData = sortedKeys.map(k => ({ name: k, volume: grouped[k] }));
        setChartData(formattedChartData);
      }

      // Impacto Global (sem RPC)
      let query = supabase.from("coletas").select("litros_coletados, data_coleta");
      
      if (globalFilter === "semana") {
        const today = new Date();
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
        const startDate = firstDay.toISOString().split("T")[0];
        query = query.gte("data_coleta", startDate);
      } else if (globalFilter === "mes") {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const startDate = firstDay.toISOString().split("T")[0];
        query = query.gte("data_coleta", startDate);
      }

      const { data: globalColetas } = await query;
      
      let globalSum = 0;
      if (globalColetas) {
        globalSum = globalColetas.reduce((acc, curr) => acc + Number(curr.litros_coletados), 0);
      }

      setGlobalTotal(globalSum);
    }
    
    setLoading(false);
  };

  const currentTotal = tab === "meu" ? meuTotal : globalTotal;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#3DB5D9]/10 p-2 rounded-lg text-[#3DB5D9]">
              <Leaf size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard de Impacto</h1>
          </div>
          {tab === "meu" && (
            <p className="text-gray-500 text-lg">Olá, <span className="font-semibold text-[#3DB5D9]">{companyName}</span>, que bom ter você conosco nessa jornada sustentável!</p>
          )}
          {tab === "global" && (
            <p className="text-gray-500 text-lg">Veja o impacto positivo gerado por toda a comunidade PacÓleo.</p>
          )}
        </div>
        
        <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50 shadow-sm backdrop-blur-sm">
          <button 
            onClick={() => setTab("meu")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${tab === "meu" ? "bg-white shadow-md text-[#3DB5D9] scale-100" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 scale-95"}`}
          >
            Meu Impacto
          </button>
          <button 
            onClick={() => setTab("global")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${tab === "global" ? "bg-white shadow-md text-[#3DB5D9] scale-100" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 scale-95"}`}
          >
            Rede PacÓleo
          </button>
        </div>
      </div>

      {tab === "global" && (
        <div className="flex justify-end gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="relative">
            <select 
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value as any)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#3DB5D9]/20 focus:border-[#3DB5D9] shadow-sm transition-all"
            >
              <option value="todos">Todo o Período</option>
              <option value="mes">Este Mês</option>
              <option value="semana">Esta Semana</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3DB5D9]/20 border-t-[#3DB5D9] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Calculando o impacto ambiental...</p>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* CARDS DE IMPACTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500">
                  <Droplet size={36} strokeWidth={2} />
                </div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm">{currentTotal.toLocaleString("pt-BR")} <span className="text-2xl text-white/80 font-medium">L</span></h3>
                <div className="w-12 h-1 bg-white/30 mb-4 rounded-full"></div>
                <p className="text-white font-bold text-lg mb-2 drop-shadow-sm">Óleo Reciclado</p>
                <p className="text-sm text-white/90 leading-relaxed font-medium">Volume total coletado de óleo vegetal que deixou de poluir a natureza.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-gradient-to-br from-[#268ca6] to-[#1d6b80] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500">
                  <Droplets size={36} strokeWidth={2} />
                </div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm">{(currentTotal * 25000).toLocaleString("pt-BR")} <span className="text-2xl text-white/80 font-medium">L</span></h3>
                <div className="w-12 h-1 bg-white/30 mb-4 rounded-full"></div>
                <p className="text-white font-bold text-lg mb-2 drop-shadow-sm">Água Preservada</p>
                <p className="text-sm text-white/90 leading-relaxed font-medium">Evitamos a contaminação direta de mananciais hídricos com essa ação.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-gradient-to-br from-[#4dc2e2] to-[#2ba1c4] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500">
                  <Zap size={36} strokeWidth={2} />
                </div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm">{(currentTotal * 0.8).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} <span className="text-2xl text-white/80 font-medium">L</span></h3>
                <div className="w-12 h-1 bg-white/30 mb-4 rounded-full"></div>
                <p className="text-white font-bold text-lg mb-2 drop-shadow-sm">Biodiesel Gerado</p>
                <p className="text-sm text-white/90 leading-relaxed font-medium">Apoiamos a produção de energia limpa e renovável para o futuro.</p>
              </div>
            </div>

          </div>

          {/* GRÁFICO DE ANÁLISE (Aparece apenas na aba "Meu Impacto" para incentivar o cliente) */}
          {tab === "meu" && chartData.length > 0 && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-8 relative overflow-hidden transition-all duration-500 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-[#3DB5D9]/10 p-3 rounded-xl text-[#3DB5D9]">
                    <TrendingUp size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight">Sua Evolução no Descarte</h3>
                    <p className="text-sm text-gray-500 mt-1">Acompanhe seu histórico de volume de óleo reciclado por mês.</p>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                      tickFormatter={(value) => `${value}L`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                      itemStyle={{ color: '#3DB5D9', fontWeight: 600 }}
                      formatter={(value: number) => [`${value.toLocaleString('pt-BR')} Litros`, 'Volume']}
                    />
                    <Bar dataKey="volume" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3DB5D9' : '#bae6fd'} className="transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ODS SECTION */}
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mt-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3DB5D9] via-emerald-400 to-blue-500"></div>
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Compromisso com o Futuro</h3>
              <p className="text-gray-500">
                A sua contribuição está diretamente alinhada aos <span className="font-semibold text-gray-700">Objetivos de Desenvolvimento Sustentável (ODS)</span> definidos pelas Nações Unidas (ONU).
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              <div className="group flex flex-col items-center">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <Image src="/ods/ods6.jpeg" alt="ODS 6 - Água Potável" fill className="object-cover" />
                </div>
              </div>
              
              <div className="group flex flex-col items-center">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <Image src="/ods/ods12.jpeg" alt="ODS 12 - Consumo Responsável" fill className="object-cover" />
                </div>
              </div>
              
              <div className="group flex flex-col items-center">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <Image src="/ods/ods13.jpeg" alt="ODS 13 - Ação Contra Clima" fill className="object-cover" />
                </div>
              </div>
              
              <div className="group flex flex-col items-center">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <Image src="/ods/ods14.jpeg" alt="ODS 14 - Vida na Água" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

