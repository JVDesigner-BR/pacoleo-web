"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Droplet, Droplets, Zap } from "lucide-react";

export default function DashboardPage() {
  const [tab, setTab] = useState<"meu" | "global">("meu");
  const [meuTotal, setMeuTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState<"todos" | "semana" | "mes">("todos");
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");

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
        .select("litros_coletados");
        
      if (coletas) {
        const sum = coletas.reduce((acc, curr) => acc + Number(curr.litros_coletados), 0);
        setMeuTotal(sum);
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Impacto</h1>
          {tab === "meu" && (
            <p className="text-gray-500 mt-1">Olá, <span className="font-semibold text-[#3DB5D9]">{companyName}</span>, parabéns por fazer parte dessa mudança!</p>
          )}
          {tab === "global" && (
            <p className="text-gray-500 mt-1">Veja o impacto positivo gerado por toda a rede PacÓleo.</p>
          )}
        </div>
        
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button 
            onClick={() => setTab("meu")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "meu" ? "bg-white shadow text-[#3DB5D9]" : "text-gray-600 hover:text-gray-900"}`}
          >
            Meu Impacto
          </button>
          <button 
            onClick={() => setTab("global")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "global" ? "bg-white shadow text-[#3DB5D9]" : "text-gray-600 hover:text-gray-900"}`}
          >
            Impacto Global PacÓleo
          </button>
        </div>
      </div>

      {tab === "global" && (
        <div className="flex justify-end gap-2">
          <select 
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#3DB5D9]"
          >
            <option value="todos">Todo o Período</option>
            <option value="mes">Este Mês</option>
            <option value="semana">Esta Semana</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-500">Calculando impacto...</div>
      ) : (
        <div id="impact-report" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-[#3DB5D9]/10 rounded-full flex items-center justify-center mb-4 text-[#3DB5D9]">
                <Droplet size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{currentTotal.toLocaleString("pt-BR")} L</h3>
              <p className="text-gray-600 font-medium">Óleo Reciclado</p>
              <p className="text-xs text-gray-400 mt-2">Volume total coletado de óleo vegetal usado.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-500">
                <Droplets size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{(currentTotal * 25000).toLocaleString("pt-BR")} L</h3>
              <p className="text-gray-600 font-medium">Água Preservada</p>
              <p className="text-xs text-gray-400 mt-2">Evitamos a contaminação deste volume de água.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
                <Zap size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{(currentTotal * 0.8).toLocaleString("pt-BR")} L</h3>
              <p className="text-gray-600 font-medium">Biodiesel Gerado</p>
              <p className="text-xs text-gray-400 mt-2">Apoiamos a produção de energia limpa e renovável.</p>
            </div>

          </div>

          <div className="mt-12 border-t pt-8">
            <p className="text-center text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Alinhado com os Objetivos de Desenvolvimento Sustentável (ONU)</p>
            <div className="flex flex-wrap justify-center gap-4">
              {/* SDG 6 */}
              <div className="bg-[#26bde2] text-white w-20 h-20 rounded-md flex flex-col items-center justify-center p-2 text-center shadow">
                <span className="font-bold text-lg leading-none">6</span>
                <span className="text-[10px] leading-tight mt-1">ÁGUA POTÁVEL</span>
              </div>
              {/* SDG 12 */}
              <div className="bg-[#bf8b2e] text-white w-20 h-20 rounded-md flex flex-col items-center justify-center p-2 text-center shadow">
                <span className="font-bold text-lg leading-none">12</span>
                <span className="text-[10px] leading-tight mt-1">CONSUMO RESPONSÁVEL</span>
              </div>
              {/* SDG 13 */}
              <div className="bg-[#3f7e44] text-white w-20 h-20 rounded-md flex flex-col items-center justify-center p-2 text-center shadow">
                <span className="font-bold text-lg leading-none">13</span>
                <span className="text-[10px] leading-tight mt-1">AÇÃO CONTRA CLIMA</span>
              </div>
              {/* SDG 14 */}
              <div className="bg-[#0a97d9] text-white w-20 h-20 rounded-md flex flex-col items-center justify-center p-2 text-center shadow">
                <span className="font-bold text-lg leading-none">14</span>
                <span className="text-[10px] leading-tight mt-1">VIDA NA ÁGUA</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
