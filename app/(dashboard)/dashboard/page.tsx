"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Droplet, Droplets, Zap, Leaf, TrendingUp, Fuel } from "lucide-react";
import Image from "next/image";
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

  const currentTotal = meuTotal;

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
          <p className="text-gray-500 text-lg">Olá, <span className="font-semibold text-[#3DB5D9]">{companyName}</span>, que bom ter você conosco nessa jornada sustentável!</p>
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3DB5D9]/20 border-t-[#3DB5D9] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Calculando o impacto ambiental...</p>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* CARDS DE IMPACTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-6 sm:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 print:bg-white print:border-2 print:border-gray-200 print:shadow-none min-w-0 flex flex-col justify-center">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 print:hidden"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-yellow-400 shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 print:bg-yellow-50 print:border-none print:text-yellow-600">
                  <Droplet size={36} strokeWidth={2} className="sm:w-12 sm:h-12" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm print:text-gray-800 print:drop-shadow-none" title={meuTotal.toLocaleString("pt-BR")}>
                  {formatCompactNumber(meuTotal)} <span className="text-xl sm:text-2xl text-white/80 font-medium print:text-gray-500">L</span>
                </h3>
                <div className="w-12 h-1 bg-white/30 mb-3 sm:mb-4 rounded-full print:bg-gray-300"></div>
                <p className="text-white font-bold text-sm sm:text-base uppercase tracking-wider drop-shadow-sm print:text-gray-600 print:drop-shadow-none leading-tight">
                  Óleo Reciclado
                </p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-6 sm:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 print:bg-white print:border-2 print:border-gray-200 print:shadow-none min-w-0 flex flex-col justify-center">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 print:hidden"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-white shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 print:bg-blue-50 print:border-none print:text-blue-600">
                  <Droplets size={36} strokeWidth={2} className="sm:w-12 sm:h-12" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm print:text-gray-800 print:drop-shadow-none" title={(meuTotal * 25000).toLocaleString("pt-BR")}>
                  {formatCompactNumber(meuTotal * 25000)} <span className="text-xl sm:text-2xl text-white/80 font-medium print:text-gray-500">L</span>
                </h3>
                <div className="w-12 h-1 bg-white/30 mb-3 sm:mb-4 rounded-full print:bg-gray-300"></div>
                <p className="text-white font-bold text-sm sm:text-base uppercase tracking-wider drop-shadow-sm print:text-gray-600 print:drop-shadow-none leading-tight">
                  Água Preservada
                </p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-6 sm:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 print:bg-white print:border-2 print:border-gray-200 print:shadow-none min-w-0 flex flex-col justify-center">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 print:hidden"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-green-400 shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 print:bg-green-50 print:border-none print:text-green-600">
                  <Zap size={36} strokeWidth={2} className="sm:w-12 sm:h-12" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm print:text-gray-800 print:drop-shadow-none" title={(meuTotal * 0.8).toLocaleString("pt-BR")}>
                  {formatCompactNumber(meuTotal * 0.8)} <span className="text-xl sm:text-2xl text-white/80 font-medium print:text-gray-500">L</span>
                </h3>
                <div className="w-12 h-1 bg-white/30 mb-3 sm:mb-4 rounded-full print:bg-gray-300"></div>
                <p className="text-white font-bold text-sm sm:text-base uppercase tracking-wider drop-shadow-sm print:text-gray-600 print:drop-shadow-none leading-tight">
                  Biodiesel Gerado
                </p>
              </div>
            </div>
          </div>

          {/* GRÁFICO DE ANÁLISE */}
          {chartData.length > 0 && (
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
                      formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} Litros`, 'Volume']}
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

