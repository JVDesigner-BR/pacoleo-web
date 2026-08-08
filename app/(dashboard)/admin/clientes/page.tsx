"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Droplet, Droplets, Zap, ExternalLink } from "lucide-react";

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<{id: string, nome_empresa: string, cnpj: string}[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [clienteData, setClienteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchClienteData(selectedCliente);
    } else {
      setClienteData(null);
    }
  }, [selectedCliente]);

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nome_empresa, cnpj").eq("nivel_acesso", "cliente").order("nome_empresa");
    if (data) setClientes(data);
    setLoading(false);
  };

  const fetchClienteData = async (clienteId: string) => {
    setLoading(true);
    
    // Buscar coletas
    const { data: coletas } = await supabase.from("coletas").select("litros_coletados").eq("cliente_id", clienteId);
    const totalLitros = coletas ? coletas.reduce((acc, curr) => acc + Number(curr.litros_coletados), 0) : 0;

    // Buscar documentos
    const { data: documentos } = await supabase.from("documentos").select("*").eq("cliente_id", clienteId).order("data_referencia", { ascending: false });

    setClienteData({ totalLitros, documentos: documentos || [] });
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Visão de Clientes (Admin)</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Cliente</label>
        <select 
          value={selectedCliente}
          onChange={(e) => setSelectedCliente(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] outline-none"
        >
          <option value="">-- Selecione --</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome_empresa} {c.cnpj ? `(${c.cnpj})` : ''}</option>
          ))}
        </select>
      </div>

      {loading && selectedCliente && <div className="text-center text-gray-500 py-10">Carregando dados do cliente...</div>}

      {clienteData && !loading && (
        <div className="space-y-8">
          {/* Dashboard Preview */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Impacto do Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#3DB5D9]/10 rounded-full flex items-center justify-center mb-3 text-[#3DB5D9]"><Droplet size={24} /></div>
                <h3 className="text-2xl font-bold text-gray-800">{clienteData.totalLitros.toLocaleString("pt-BR")} L</h3>
                <p className="text-sm text-gray-600 font-medium">Óleo Reciclado</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-500"><Droplets size={24} /></div>
                <h3 className="text-2xl font-bold text-gray-800">{(clienteData.totalLitros * 25000).toLocaleString("pt-BR")} L</h3>
                <p className="text-sm text-gray-600 font-medium">Água Preservada</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-500"><Zap size={24} /></div>
                <h3 className="text-2xl font-bold text-gray-800">{(clienteData.totalLitros * 0.8).toLocaleString("pt-BR")} L</h3>
                <p className="text-sm text-gray-600 font-medium">Biodiesel Gerado</p>
              </div>
            </div>
          </div>

          {/* Documentos Preview */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Documentos do Cliente</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-6 font-semibold text-gray-600 text-sm">Data</th>
                    <th className="py-3 px-6 font-semibold text-gray-600 text-sm">Tipo</th>
                    <th className="py-3 px-6 font-semibold text-gray-600 text-sm text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {clienteData.documentos.length === 0 ? (
                    <tr><td colSpan={3} className="py-6 text-center text-gray-500">Nenhum documento.</td></tr>
                  ) : clienteData.documentos.map((doc: any) => (
                    <tr key={doc.id} className="border-b border-gray-50">
                      <td className="py-3 px-6 text-sm">{new Date(doc.data_referencia).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          doc.tipo_doc === "CDF" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>{doc.tipo_doc}</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <a href={doc.link_google_drive} target="_blank" rel="noopener noreferrer" className="text-[#3DB5D9] hover:underline text-sm inline-flex items-center gap-1">
                          Ver <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
