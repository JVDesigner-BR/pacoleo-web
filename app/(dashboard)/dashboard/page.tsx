"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Droplet, 
  Droplets, 
  Zap, 
  Leaf, 
  TrendingUp, 
  FileText, 
  Info, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const formatCompactNumber = (number: number) => {
  if (number < 10000) return Math.round(number).toLocaleString("pt-BR");
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
};

export default function DashboardPage() {
  const [meuTotal, setMeuTotal] = useState(0);
  const [totalColetasCount, setTotalColetasCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

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
        setTotalColetasCount(coletas.length);

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
    }

    setLoading(false);
  };

  const odsList = [
    {
      number: 6,
      title: "Água Potável & Saneamento",
      desc: "Evita o despejo incorreto de resíduos oleosos nas redes fluviais e aquíferos subterrâneos.",
      image: "/ods/ods6.jpeg",
      color: "border-sky-500 text-sky-600 bg-sky-50"
    },
    {
      number: 12,
      title: "Consumo e Produção Responsáveis",
      desc: "Promove a economia circular ao transformar resíduo nocivo em nova matéria-prima sustentável.",
      image: "/ods/ods12.jpeg",
      color: "border-amber-500 text-amber-600 bg-amber-50"
    },
    {
      number: 13,
      title: "Ação Contra Mudança do Clima",
      desc: "Reduz a queima de combustíveis fósseis através da substituição por biocombustível de baixa emissão.",
      image: "/ods/ods13.jpeg",
      color: "border-emerald-600 text-emerald-700 bg-emerald-50"
    },
    {
      number: 14,
      title: "Vida na Água",
      desc: "Preserva a oxigenação e a vida aquática de rios, represas e oceanos.",
      image: "/ods/ods14.jpeg",
      color: "border-blue-600 text-blue-700 bg-blue-50"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#3DB5D9]/10 p-2 rounded-xl text-[#3DB5D9]">
              <Leaf size={22} className="stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard de Impacto Positivo
            </h1>
          </div>
          <p className="text-slate-500 text-sm sm:text-base">
            Olá, <span className="font-bold text-slate-800">{companyName || "Parceiro"}</span>! Acompanhe a transformação sustentável gerada pela sua empresa.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/documentos"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#3DB5D9] hover:border-[#3DB5D9] shadow-sm font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <FileText size={16} className="text-[#3DB5D9]" />
            <span>Acessar MTRs e Laudos</span>
            <ArrowUpRight size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3DB5D9]/20 border-t-[#3DB5D9] rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm animate-pulse">Calculando equivalências ecológicas...</p>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">

          {/* EMPTY STATE IF 0 LITERS */}
          {meuTotal === 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-[#3DB5D9]/10 text-[#3DB5D9] rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Boas-vindas ao Portal da PacÓleo!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Seu cadastro está ativo. Assim que realizarmos a sua primeira coleta de óleo vegetal usado, todos os gráficos de impacto ambiental, volume coletado e certificados (MTR/CDF) serão atualizados automaticamente aqui.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3DB5D9] text-white font-semibold text-sm rounded-xl shadow-md hover:bg-[#329fbe] transition-colors"
                >
                  Solicitar / Agendar Coleta
                </a>
              </div>
            </div>
          )}

          {/* CARDS DE IMPACTO COM HIERARQUIA CROMÁTICA REFINADA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Óleo Reciclado */}
            <div className="group relative bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-6 sm:p-7 rounded-3xl text-white shadow-xl shadow-amber-500/15 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-100/90 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  Volume Coletado
                </span>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 border border-white/30 shadow-inner">
                  <Droplet size={26} className="fill-amber-300 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5 my-1" title={`${meuTotal.toLocaleString("pt-BR")} Litros`}>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                    {formatCompactNumber(meuTotal)}
                  </span>
                  <span className="text-xl font-bold text-amber-200">Litros</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">Óleo Vegetal Reciclado</h3>
                <p className="text-xs text-amber-100/80 mt-2 font-medium">
                  {totalColetasCount} {totalColetasCount === 1 ? 'coleta realizada' : 'coletas realizadas'} com destinação correta.
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/20 flex items-center gap-1.5 text-xs text-amber-100 font-medium">
                <ShieldCheck size={14} className="text-amber-200 shrink-0" />
                <span>100% rastreado com MTR & CDF</span>
              </div>
            </div>

            {/* Card 2: Água Preservada */}
            <div className="group relative bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#075985] p-6 sm:p-7 rounded-3xl text-white shadow-xl shadow-sky-600/15 hover:shadow-2xl hover:shadow-sky-600/25 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-100/90 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  Preservação Hídrica
                </span>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-sky-200 border border-white/30 shadow-inner">
                  <Droplets size={26} className="fill-sky-200 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5 my-1" title={`${(meuTotal * 25000).toLocaleString("pt-BR")} Litros de água`}>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                    {formatCompactNumber(meuTotal * 25000)}
                  </span>
                  <span className="text-xl font-bold text-sky-200">Litros</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">Água Potável Preservada</h3>
                <p className="text-xs text-sky-100/80 mt-2 font-medium">
                  Evitou a contaminação de mananciais e redes de esgoto.
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/20 flex items-center gap-1.5 text-xs text-sky-100 font-medium">
                <Info size={14} className="text-sky-300 shrink-0" />
                <span>1L de óleo contamina 25.000L de água</span>
              </div>
            </div>

            {/* Card 3: Biodiesel Gerado */}
            <div className="group relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-7 rounded-3xl text-white shadow-xl shadow-emerald-600/15 hover:shadow-2xl hover:shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  Energia Limpa
                </span>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-200 border border-white/30 shadow-inner">
                  <Zap size={26} className="fill-emerald-300 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5 my-1" title={`${(meuTotal * 0.8).toLocaleString("pt-BR")} Litros de biodiesel`}>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                    {formatCompactNumber(meuTotal * 0.8)}
                  </span>
                  <span className="text-xl font-bold text-emerald-200">Litros</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">Biodiesel Gerado</h3>
                <p className="text-xs text-emerald-100/80 mt-2 font-medium">
                  Transformação direta em biocombustível sustentável.
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/20 flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
                <Info size={14} className="text-emerald-300 shrink-0" />
                <span>Rendimento médio de 80% do volume</span>
              </div>
            </div>
          </div>

          {/* GRÁFICO DE EVOLUÇÃO MENSAL */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-[#3DB5D9]/10 p-3 rounded-2xl text-[#3DB5D9]">
                    <TrendingUp size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
                      Histórico Mensal de Descarte Sustentável
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Acompanhe o volume de óleo entregue para reciclagem em cada mês.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
                  <Calendar size={14} />
                  <span>{chartData.length} {chartData.length === 1 ? 'mês registrado' : 'meses registrados'}</span>
                </div>
              </div>

              <div className="h-[280px] sm:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(value) => `${value}L`}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
                        padding: '12px 16px',
                        backgroundColor: '#ffffff'
                      }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                      itemStyle={{ color: '#3DB5D9', fontWeight: 700 }}
                      formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} Litros`, 'Volume Coletado']}
                    />
                    <Bar dataKey="volume" radius={[8, 8, 0, 0]} maxBarSize={56}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === chartData.length - 1 ? '#3DB5D9' : '#93c5fd'} 
                          className="transition-all duration-300 hover:opacity-85" 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ODS SECTION - OBJETIVOS DE DESENVOLVIMENTO SUSTENTÁVEL */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200/80 relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#3DB5D9] via-emerald-400 to-blue-500"></div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-[#3DB5D9] uppercase tracking-wider block mb-1">
                  Compromisso ESG & ONU
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  Alinhamento aos Objetivos de Desenvolvimento Sustentável (ODS)
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                  Ao descartar seu óleo com a PacÓleo, sua empresa contribui ativamente para 4 metas globais da Organização das Nações Unidas:
                </p>
              </div>
            </div>

            {/* ODS Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {odsList.map((ods) => (
                <div 
                  key={ods.number}
                  className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 shadow-sm group-hover:scale-[1.02] transition-transform duration-300">
                      <Image 
                        src={ods.image} 
                        alt={`ODS ${ods.number} - ${ods.title}`} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                        ODS {ods.number}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{ods.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {ods.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

