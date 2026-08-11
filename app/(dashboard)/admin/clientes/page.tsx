"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Droplet, Droplets, Zap, ExternalLink, Plus, X } from "lucide-react";
import { createClientAccount, getGlobalImpact } from "./actions";

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<{id: string, nome_empresa: string, cnpj: string}[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [clienteData, setClienteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [globalTotal, setGlobalTotal] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  useEffect(() => {
    fetchGlobalImpact();
    fetchClientes();
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchClienteData(selectedCliente);
    } else {
      setClienteData(null);
    }
  }, [selectedCliente]);

  const fetchGlobalImpact = async () => {
    const res = await getGlobalImpact();
    if (res.success) {
      setGlobalTotal(res.totalLitros);
    }
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nome_empresa, cnpj").eq("nivel_acesso", "cliente").order("nome_empresa");
    if (data) setClientes(data);
    setLoading(false);
  };

  const fetchClienteData = async (clienteId: string) => {
    setLoading(true);
    
    const { data: coletas } = await supabase.from("coletas").select("litros_coletados").eq("cliente_id", clienteId);
    const totalLitros = coletas ? coletas.reduce((acc, curr) => acc + Number(curr.litros_coletados), 0) : 0;

    const { data: documentos } = await supabase.from("documentos").select("*").eq("cliente_id", clienteId).order("data_referencia", { ascending: false });

    setClienteData({ totalLitros, documentos: documentos || [] });
    setLoading(false);
  };

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    const res = await createClientAccount(formData);
    
    if (res.success) {
      setCreatedCredentials({ email, password: res.tempPassword! });
      fetchClientes(); // Atualizar lista
    } else {
      setModalError(res.error || "Ocorreu um erro ao criar o cliente.");
    }
    setModalLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* HEADER E RESUMO GLOBAL */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Visão de Clientes (Admin)</h1>
          <button 
            onClick={() => { setShowModal(true); setCreatedCredentials(null); }}
            className="bg-[#3DB5D9] hover:bg-[#349ec0] text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#3DB5D9] to-blue-500 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-white/90">Impacto Global da Plataforma</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-4 rounded-lg border border-white/20 backdrop-blur-sm">
              <p className="text-white/70 text-sm font-medium mb-1">Total de Óleo Reciclado</p>
              <h3 className="text-3xl font-bold">{globalTotal.toLocaleString("pt-BR")} L</h3>
            </div>
            <div className="bg-white/10 p-4 rounded-lg border border-white/20 backdrop-blur-sm">
              <p className="text-white/70 text-sm font-medium mb-1">Água Preservada</p>
              <h3 className="text-3xl font-bold">{(globalTotal * 25000).toLocaleString("pt-BR")} L</h3>
            </div>
            <div className="bg-white/10 p-4 rounded-lg border border-white/20 backdrop-blur-sm">
              <p className="text-white/70 text-sm font-medium mb-1">Biodiesel Gerado</p>
              <h3 className="text-3xl font-bold">{(globalTotal * 0.8).toLocaleString("pt-BR")} L</h3>
            </div>
          </div>
        </div>
      </div>

      {/* SELEÇÃO E RELATÓRIO DO CLIENTE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Cliente para ver o relatório individual</label>
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
        
        {clientes.length === 0 && !loading && (
          <p className="text-sm text-gray-500 mt-2">Nenhum cliente cadastrado ainda. Clique em "Novo Cliente" acima para começar.</p>
        )}
      </div>

      {loading && selectedCliente && <div className="text-center text-gray-500 py-10">Carregando dados do cliente...</div>}

      {clienteData && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <tr><td colSpan={3} className="py-6 text-center text-gray-500">Nenhum documento cadastrado via webhook ainda.</td></tr>
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

      {/* MODAL NOVO CLIENTE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Cadastrar Novo Cliente</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {createdCredentials ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Cliente Cadastrado!</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Envie estas credenciais para que o cliente possa fazer o primeiro acesso e criar sua senha definitiva.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">E-mail:</span>
                      <span className="font-mono text-gray-800">{createdCredentials.email}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Senha Temporária:</span>
                      <span className="font-mono text-2xl font-bold text-[#3DB5D9] tracking-widest">{createdCredentials.password}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors mt-6"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateClient} className="space-y-4">
                  {modalError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                      {modalError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Empresa</label>
                    <input type="text" name="nome_empresa" required placeholder="Ex: Padaria do Zé" 
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ (Opcional)</label>
                    <input type="text" name="cnpj" placeholder="00.000.000/0001-00" 
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail (Opcional)</label>
                    <input type="email" name="email" placeholder="contato@empresa.com" 
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] outline-none" />
                    <p className="text-xs text-gray-500 mt-1">Se não preenchido, o sistema gerará um e-mail interno para permitir o cadastro.</p>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={modalLoading}
                      className="w-full bg-[#3DB5D9] text-white font-medium py-3 rounded-lg hover:bg-[#349ec0] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {modalLoading ? "Cadastrando..." : "Cadastrar e Gerar Senha"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
