"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Droplet, Droplets, Zap, ExternalLink, Plus, X, Truck, Trophy, Star, Award, Folder, FileText, Download, ChevronRight, TrendingUp, Leaf } from "lucide-react";
import { createClientAccount, getGlobalImpact } from "./actions";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const formatCompactNumber = (number: number) => {
  if (number < 10000) return Math.round(number).toLocaleString("pt-BR");
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
};

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<{id: string, nome_empresa: string, cnpj: string}[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [clienteData, setClienteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [driveItems, setDriveItems] = useState<any[]>([]);
  const [driveBreadcrumbs, setDriveBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState("");
  
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalColetas, setGlobalColetas] = useState(0);
  const [globalInsights, setGlobalInsights] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [clientStartDate, setClientStartDate] = useState("");
  const [clientEndDate, setClientEndDate] = useState("");
  const [clientChartData, setClientChartData] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  useEffect(() => {
    fetchGlobalImpact(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchClienteData(selectedCliente, clientStartDate, clientEndDate);
      
      const clienteObj = clientes.find(c => c.id === selectedCliente);
      if (clienteObj) {
        const match = clienteObj.nome_empresa.match(/^\[(\d+)\]/);
        if (match) {
          fetchDriveFolder(match[1]);
        } else {
          setDriveFolderId(null);
          setDriveError("Cliente não possui ID numérico no nome.");
        }
      }
    } else {
      setClienteData(null);
      setDriveFolderId(null);
    }
  }, [selectedCliente, clientStartDate, clientEndDate, clientes]);

  const fetchGlobalImpact = async (start?: string, end?: string) => {
    const res = await getGlobalImpact(start, end);
    if (res.success) {
      setGlobalTotal(res.totalLitros || 0);
      setGlobalColetas(res.totalColetas || 0);
      setGlobalInsights(res.insights);
    }
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nome_empresa, cnpj").eq("nivel_acesso", "cliente").order("nome_empresa");
    if (data) setClientes(data);
    setLoading(false);
  };

  const fetchDriveFolder = async (id: string) => {
    setLoadingDrive(true);
    setDriveError("");
    setDriveFolderId(null);
    setDriveItems([]);
    setDriveBreadcrumbs([]);
    try {
      const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby51b908_XmHDtgPbkJHcDDVk8Kzl77dueuP5TZ8jfcG1Qxc50Nmhd9XRhUhTCPRpKm/exec";
      const res = await fetch(`${WEB_APP_URL}?clientId=${id}`);
      const data = await res.json();
      if (data.success && data.folderId) {
        setDriveFolderId(data.folderId);
        setDriveBreadcrumbs([{ id: data.folderId, name: data.folderName || "Pasta do Cliente" }]);
        fetchDriveFolderContents(data.folderId);
      } else {
        setDriveError(data.error || "Pasta não encontrada.");
        setLoadingDrive(false);
      }
    } catch (e: any) {
      setDriveError("Erro de conexão ao buscar a pasta no Google Drive.");
      setLoadingDrive(false);
    }
  };

  const fetchDriveFolderContents = async (folderId: string) => {
    setLoadingDrive(true);
    setDriveError("");
    try {
      const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby51b908_XmHDtgPbkJHcDDVk8Kzl77dueuP5TZ8jfcG1Qxc50Nmhd9XRhUhTCPRpKm/exec";
      const res = await fetch(`${WEB_APP_URL}?action=list&folderId=${folderId}`);
      const data = await res.json();
      if (data.success) {
        // Sort: Folders first, then alphabetically
        const sortedItems = data.items.sort((a: any, b: any) => {
          if (a.isFolder === b.isFolder) {
            return a.name.localeCompare(b.name);
          }
          return a.isFolder ? -1 : 1;
        });
        setDriveItems(sortedItems);
      } else {
        setDriveError(data.error || "Erro ao listar a pasta.");
      }
    } catch (e: any) {
      setDriveError("Erro de conexão ao listar a pasta no Google Drive.");
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleNavigateFolder = (folderId: string, folderName: string) => {
    setDriveBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
    fetchDriveFolderContents(folderId);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const newBreadcrumbs = driveBreadcrumbs.slice(0, index + 1);
    setDriveBreadcrumbs(newBreadcrumbs);
    fetchDriveFolderContents(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const fetchClienteData = async (clienteId: string, start?: string, end?: string) => {
    setLoading(true);
    
    let coletasQuery = supabase.from("coletas").select("litros_coletados, data_coleta").eq("cliente_id", clienteId);
    if (start) coletasQuery = coletasQuery.gte("data_coleta", start);
    if (end) coletasQuery = coletasQuery.lte("data_coleta", end);
    
    const { data: coletas } = await coletasQuery;
    
    let totalLitros = 0;
    let totalColetas = 0;
    
    if (coletas) {
      totalLitros = coletas.reduce((acc: number, curr: any) => acc + Number(curr.litros_coletados), 0);
      totalColetas = coletas.length;

      const grouped: Record<string, number> = {};
      coletas.forEach((c: any) => {
        if (!c.data_coleta) return;
        const [ano, mes] = c.data_coleta.split("-");
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const monthName = months[parseInt(mes, 10) - 1];
        const key = `${monthName}/${ano.substring(2)}`;
        grouped[key] = (grouped[key] || 0) + Number(c.litros_coletados);
      });

      const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const [mA, yA] = a.split("/");
        const [mB, yB] = b.split("/");
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        if (yA !== yB) return Number(yA) - Number(yB);
        return months.indexOf(mA) - months.indexOf(mB);
      });

      const formattedChartData = sortedKeys.map(k => ({ name: k, volume: grouped[k] }));
      setClientChartData(formattedChartData);
    } else {
      setClientChartData([]);
    }

    let docsQuery = supabase.from("documentos").select("*").eq("cliente_id", clienteId).order("data_referencia", { ascending: false });
    if (start) docsQuery = docsQuery.gte("data_referencia", start);
    if (end) docsQuery = docsQuery.lte("data_referencia", end);
    
    const { data: documentos } = await docsQuery;

    setClienteData({ totalLitros, totalColetas, documentos: documentos || [] });
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100 print:hidden mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#3DB5D9]/10 p-2 rounded-lg text-[#3DB5D9]">
                <Leaf size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Visão de Clientes (Admin)</h1>
            </div>
            <p className="text-gray-500 text-lg">Acompanhe o impacto global da plataforma e os dados de cada cliente.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#3DB5D9] to-[#2b9abf] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print:hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/20 pb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">Impacto Global da Plataforma</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 border border-white/30 backdrop-blur-sm shadow-sm">
                <span className="text-sm font-medium text-white/90">De</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:invert cursor-pointer font-medium" 
                />
                <span className="text-sm font-medium text-white/90 ml-2">Até</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:invert cursor-pointer font-medium" 
                />
              </div>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm hover:bg-white/20 transition-all duration-300 min-w-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white shadow-sm border border-white/30">
                <Truck size={24} />
              </div>
              <p className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider truncate">Coletas Realizadas</p>
              <h3 className="text-3xl xl:text-4xl font-black drop-shadow-sm truncate" title={globalColetas.toString()}>{formatCompactNumber(globalColetas)}</h3>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm hover:bg-white/20 transition-all duration-300 min-w-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-yellow-300 shadow-sm border border-white/30">
                <Droplet size={24} />
              </div>
              <p className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider truncate">Total de Óleo</p>
              <h3 className="text-3xl xl:text-4xl font-black drop-shadow-sm truncate" title={globalTotal.toLocaleString("pt-BR")}>{formatCompactNumber(globalTotal)} <span className="text-lg text-white/70 font-medium">L</span></h3>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm hover:bg-white/20 transition-all duration-300 min-w-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-blue-200 shadow-sm border border-white/30">
                <Droplets size={24} />
              </div>
              <p className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider truncate">Água Preservada</p>
              <h3 className="text-3xl xl:text-4xl font-black drop-shadow-sm truncate" title={(globalTotal * 25000).toLocaleString("pt-BR")}>{formatCompactNumber(globalTotal * 25000)} <span className="text-lg text-white/70 font-medium">L</span></h3>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm hover:bg-white/20 transition-all duration-300 min-w-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-green-300 shadow-sm border border-white/30">
                <Zap size={24} />
              </div>
              <p className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider truncate">Biodiesel Gerado</p>
              <h3 className="text-3xl xl:text-4xl font-black drop-shadow-sm truncate" title={(globalTotal * 0.8).toLocaleString("pt-BR")}>{formatCompactNumber(globalTotal * 0.8)} <span className="text-lg text-white/70 font-medium">L</span></h3>
            </div>
          </div>
        </div>
      </div>

      {/* DESTAQUES DO PERÍODO */}
      {globalInsights && clientes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Campeão de Reciclagem</p>
              <h4 className="font-bold text-gray-800 text-base leading-snug" title={clientes.find(c => c.id === globalInsights.topLitros?.id)?.nome_empresa || "Nenhum"}>
                {(clientes.find(c => c.id === globalInsights.topLitros?.id)?.nome_empresa || "Nenhum").replace(/^\[\d+\]\s*/, '')}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{globalInsights.topLitros?.value.toLocaleString("pt-BR")} Litros recolhidos</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Cliente Mais Frequente</p>
              <h4 className="font-bold text-gray-800 text-base leading-snug" title={clientes.find(c => c.id === globalInsights.topColetas?.id)?.nome_empresa || "Nenhum"}>
                {(clientes.find(c => c.id === globalInsights.topColetas?.id)?.nome_empresa || "Nenhum").replace(/^\[\d+\]\s*/, '')}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{globalInsights.topColetas?.value} Coletas realizadas</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Maior Coleta Única</p>
              <h4 className="font-bold text-gray-800 text-base leading-snug" title={clientes.find(c => c.id === globalInsights.largestCollection?.clienteId)?.nome_empresa || "Nenhum"}>
                {(clientes.find(c => c.id === globalInsights.largestCollection?.clienteId)?.nome_empresa || "Nenhum").replace(/^\[\d+\]\s*/, '')}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{globalInsights.largestCollection?.litros.toLocaleString("pt-BR")} Litros de uma vez</p>
            </div>
          </div>
        </div>
      )}

      {/* SELEÇÃO E RELATÓRIO DO CLIENTE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecione um Cliente para ver o relatório individual</h2>
        
        <div className="relative max-w-2xl">
          <input 
            type="text" 
            placeholder="Buscar por ID, Nome ou CNPJ..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedCliente) setSelectedCliente("");
            }}
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-[#3DB5D9] focus:outline-none"
          />
          
          {searchTerm.length > 0 && !selectedCliente && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {clientes
                .filter(c => 
                  c.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (c.cnpj && c.cnpj.includes(searchTerm)) ||
                  c.id.toString().includes(searchTerm)
                )
                .map(cliente => (
                  <li 
                    key={cliente.id} 
                    onClick={() => {
                      setSelectedCliente(cliente.id);
                      setSearchTerm(cliente.nome_empresa);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{cliente.nome_empresa}</div>
                    {cliente.cnpj && <div className="text-xs text-gray-500 mt-1">{cliente.cnpj}</div>}
                  </li>
              ))}
              {clientes.filter(c => c.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase()) || (c.cnpj && c.cnpj.includes(searchTerm)) || c.id.toString().includes(searchTerm)).length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-500">Nenhum cliente encontrado.</li>
              )}
            </ul>
          )}
        </div>
        
        {clientes.length === 0 && !loading && (
          <p className="text-sm text-gray-500 mt-2">Nenhum cliente cadastrado ainda.</p>
        )}
      </div>

      {!clienteData && loading && selectedCliente && <div className="text-center text-gray-500 py-10">Carregando dados do cliente...</div>}

      {clienteData && (
        <>
          {/* NOVO RELATÓRIO PÔSTER EXCLUSIVO PARA IMPRESSÃO */}
          <div className="hidden print:flex flex-col w-[210mm] h-[297mm] bg-white font-sans overflow-hidden mx-auto">
            {/* Título Principal */}
            <div className="bg-[#3DB5D9] text-white py-8 px-4 text-center border-b-4 border-white shrink-0">
              <h1 className="text-5xl font-bold tracking-tight uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>Relatório Impacto Positivo</h1>
            </div>
            
            {/* Parabéns */}
            <div className="bg-[#3DB5D9] text-white flex items-center justify-center py-10 px-8 border-b-4 border-white shrink-0 relative overflow-hidden">
              <div className="w-56 h-56 bg-white rounded-full flex flex-col items-center justify-center p-4 shadow-xl z-10 shrink-0 border-8 border-gray-100">
                <span className="text-xl font-bold uppercase text-gray-400">Cliente</span>
                <span className="text-2xl font-black text-[#3DB5D9] text-center mt-2 leading-tight px-2">{clienteData.nome_empresa}</span>
              </div>
              <div className="ml-10 z-10">
                <h2 className="text-4xl font-light">
                  <span className="font-bold">Parabéns</span> por fazer parte dessa mudança!
                </h2>
              </div>
            </div>

            {/* Métricas Principais */}
            <div className="grid grid-cols-2 border-b-4 border-white shrink-0">
              <div className="bg-[#3DB5D9] text-white p-10 flex flex-col items-center text-center justify-center relative border-r-4 border-white">
                <h3 className="text-3xl font-light mb-4">Foram coletados</h3>
                <div className="flex items-end gap-2 my-2">
                  <span className="text-8xl font-bold tracking-tighter" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>{clienteData.totalLitros}</span>
                  <span className="text-3xl font-light mb-3">litros</span>
                </div>
                <p className="text-3xl font-light mt-4 leading-tight">
                  de óleo e enviados<br/>para um <span className="font-bold">descarte<br/>ambientalmente correto.</span>
                </p>
              </div>
              
              <div className="bg-[#3DB5D9] text-white p-10 flex flex-col items-center text-center justify-center relative">
                <h3 className="text-3xl font-light mb-4">Com isso,<br/><span className="font-bold">evitamos que</span></h3>
                <div className="flex items-end gap-2 my-2">
                  <span className="text-7xl font-bold tracking-tighter" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>{(clienteData.totalLitros * 25000).toLocaleString("pt-BR")}</span>
                  <span className="text-3xl font-light mb-3">litros</span>
                </div>
                <p className="text-3xl font-light mt-4 leading-tight">
                  de água fossem<br/><span className="font-bold">contaminados.</span>
                </p>
                <div className="absolute bottom-6 right-6 flex opacity-90">
                  <Droplet size={80} className="fill-blue-200 text-blue-100" />
                  <Droplet size={50} className="fill-blue-100 text-blue-50 -ml-4 mt-8" />
                </div>
              </div>
            </div>

            {/* Biodiesel */}
            <div className="bg-[#3DB5D9] text-white py-10 px-6 text-center border-b-4 border-white flex items-center justify-center gap-4 shrink-0">
              <h3 className="text-3xl font-light">Ainda, <span className="font-bold">apoiamos</span> a produção de</h3>
              <span className="text-6xl font-bold mx-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>{(clienteData.totalLitros * 0.8).toLocaleString("pt-BR")}</span>
              <span className="text-2xl font-light">litros</span>
              <h3 className="text-3xl font-bold ml-2">de biodiesel.</h3>
            </div>

            {/* ODS */}
            <div className="bg-[#3DB5D9] flex-1 text-white py-10 px-8 flex flex-col items-center justify-center border-b-4 border-white">
              <h3 className="text-3xl font-light mb-10">Que contribuíram para apoiar os seguintes ODS</h3>
              <div className="flex gap-8 justify-center">
                <div className="w-40 h-40 bg-[#26BDE2] flex flex-col items-center justify-center text-white font-bold p-3 text-center border-2 border-white">
                  <div className="text-5xl">6</div>
                  <div className="text-xs leading-tight mt-2 mb-3">ÁGUA POTÁVEL<br/>E SANEAMENTO</div>
                  <Droplet size={36} className="fill-white" />
                </div>
                <div className="w-40 h-40 bg-[#BF8B2E] flex flex-col items-center justify-center text-white font-bold p-3 text-center border-2 border-white">
                  <div className="text-5xl">12</div>
                  <div className="text-xs leading-tight mt-2 mb-3">CONSUMO E<br/>PRODUÇÃO<br/>RESPONSÁVEIS</div>
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L15.17 9l1.41 1.41L19 7.59l-2.42-2.42-1.41 1.41 1.42 1.42zM7 16.41l2.42-2.42-1.41-1.41L5 15.59l2.42 2.42 1.41-1.41L7 15.41v1z"/></svg>
                </div>
                <div className="w-40 h-40 bg-[#3F7E44] flex flex-col items-center justify-center text-white font-bold p-3 text-center border-2 border-white">
                  <div className="text-5xl">13</div>
                  <div className="text-xs leading-tight mt-2 mb-3">AÇÃO CONTRA A<br/>MUDANÇA GLOBAL<br/>DO CLIMA</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-sm">🌍</div>
                </div>
                <div className="w-40 h-40 bg-[#0A97D9] flex flex-col items-center justify-center text-white font-bold p-3 text-center border-2 border-white">
                  <div className="text-5xl">14</div>
                  <div className="text-xs leading-tight mt-2 mb-3">VIDA NA<br/>ÁGUA</div>
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#3DB5D9] text-white py-12 px-10 flex justify-between items-end relative overflow-hidden shrink-0">
              <div className="z-10">
                <h2 className="text-3xl font-bold mb-2">Só na Pac Óleo você transforma óleo em ODS</h2>
                <h3 className="text-2xl font-light mb-6">Objetivos de Desenvolvimento Sustentável</h3>
                <p className="text-3xl font-bold">Venha fazer parte desse impacto!</p>
              </div>
              <div className="absolute right-0 bottom-0 w-2/5 h-full bg-white" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
              <div className="z-10 flex items-center gap-3 text-[#3DB5D9] pr-6 pb-2">
                <img src="/logo-pacman.png" alt="PacOleo Logo" className="h-16 w-auto object-contain" />
                <h1 className="text-5xl font-black tracking-tight">PacOleo</h1>
              </div>
            </div>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">

          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                Impacto de: <span className="text-[#3DB5D9]">{clientes.find(c => c.id === selectedCliente)?.nome_empresa}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 border border-gray-300 shadow-sm print:hidden">
                  <span className="text-sm font-medium text-gray-600">De</span>
                  <input 
                    type="date" 
                    value={clientStartDate}
                    onChange={(e) => setClientStartDate(e.target.value)}
                    className="bg-transparent text-gray-800 text-sm focus:outline-none cursor-pointer" 
                  />
                  <span className="text-sm font-medium text-gray-600 ml-2">Até</span>
                  <input 
                    type="date" 
                    value={clientEndDate}
                    onChange={(e) => setClientEndDate(e.target.value)}
                    className="bg-transparent text-gray-800 text-sm focus:outline-none cursor-pointer" 
                  />
                </div>
                <button 
                  onClick={() => window.print()}
                  className="print:hidden bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Emitir PDF
                </button>
              </div>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 print:p-0 transition-opacity ${loading ? 'opacity-50' : ''}`}>
              
              <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1 print:bg-white print:border-2 print:border-gray-200 print:shadow-none print:text-gray-800 min-w-0">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all duration-500 group-hover:scale-150 print:hidden"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 text-white shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 print:bg-gray-100 print:border-none print:text-gray-600">
                    <Truck size={32} strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl xl:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm print:text-gray-800 print:drop-shadow-none truncate w-full" title={clienteData.totalColetas.toString()}>{formatCompactNumber(clienteData.totalColetas)}</h3>
                  <div className="w-10 h-1 bg-white/30 mb-3 rounded-full print:bg-gray-300"></div>
                  <p className="text-white font-bold text-sm mb-1 drop-shadow-sm print:text-gray-600 print:drop-shadow-none truncate w-full">Coletas Realizadas</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1 print:bg-white print:border-2 print:border-gray-200 print:shadow-none print:text-gray-800 min-w-0">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all duration-500 group-hover:scale-150 print:hidden"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 text-yellow-400 shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 print:bg-yellow-50 print:border-none print:text-yellow-600">
                    <Droplet size={32} strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl xl:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm print:text-gray-800 print:drop-shadow-none truncate w-full" title={clienteData.totalLitros.toLocaleString("pt-BR")}>{formatCompactNumber(clienteData.totalLitros)} <span className="text-lg text-white/80 font-medium print:text-gray-500">L</span></h3>
                  <div className="w-10 h-1 bg-white/30 mb-3 rounded-full print:bg-gray-300"></div>
                  <p className="text-white font-bold text-sm mb-1 drop-shadow-sm print:text-gray-600 print:drop-shadow-none truncate w-full">Óleo Reciclado</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1 print:bg-white print:border-2 print:border-gray-200 print:shadow-none print:text-gray-800 min-w-0">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all duration-500 group-hover:scale-150 print:hidden"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 text-white shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 print:bg-blue-50 print:border-none print:text-blue-600">
                    <Droplets size={32} strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl xl:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm print:text-gray-800 print:drop-shadow-none truncate w-full" title={(clienteData.totalLitros * 25000).toLocaleString("pt-BR")}>{formatCompactNumber(clienteData.totalLitros * 25000)} <span className="text-lg text-white/80 font-medium print:text-gray-500">L</span></h3>
                  <div className="w-10 h-1 bg-white/30 mb-3 rounded-full print:bg-gray-300"></div>
                  <p className="text-white font-bold text-sm mb-1 drop-shadow-sm print:text-gray-600 print:drop-shadow-none truncate w-full">Água Preservada</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1 print:bg-white print:border-2 print:border-gray-200 print:shadow-none print:text-gray-800 min-w-0">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all duration-500 group-hover:scale-150 print:hidden"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 text-green-400 shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 print:bg-green-50 print:border-none print:text-green-600">
                    <Zap size={32} strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl xl:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm print:text-gray-800 print:drop-shadow-none truncate w-full" title={(clienteData.totalLitros * 0.8).toLocaleString("pt-BR")}>{formatCompactNumber(clienteData.totalLitros * 0.8)} <span className="text-lg text-white/80 font-medium print:text-gray-500">L</span></h3>
                  <div className="w-10 h-1 bg-white/30 mb-3 rounded-full print:bg-gray-300"></div>
                  <p className="text-white font-bold text-sm mb-1 drop-shadow-sm print:text-gray-600 print:drop-shadow-none truncate w-full">Biodiesel Gerado</p>
                </div>
              </div>
            </div>

            {/* GRÁFICO DE ANÁLISE DO CLIENTE */}
            {clientChartData.length > 0 && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-8 relative overflow-hidden transition-all duration-500 hover:shadow-md print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#3DB5D9]/10 p-3 rounded-xl text-[#3DB5D9]">
                      <TrendingUp size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 tracking-tight">Evolução no Descarte</h3>
                      <p className="text-sm text-gray-500 mt-1">Histórico de volume de óleo reciclado por mês.</p>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        {clientChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === clientChartData.length - 1 ? '#3DB5D9' : '#bae6fd'} className="transition-all duration-300 hover:opacity-80" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="print:hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Folder className="text-[#3DB5D9]" size={24} />
              Arquivos do Cliente (Google Drive)
            </h2>
            
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8`}>
              {driveBreadcrumbs.length > 0 && (
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
                  {driveBreadcrumbs.map((crumb, index) => (
                    <div key={crumb.id} className="flex items-center gap-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleNavigateBreadcrumb(index)}
                        className={`hover:text-[#3DB5D9] transition-colors ${index === driveBreadcrumbs.length - 1 ? 'font-semibold text-gray-800' : ''}`}
                      >
                        {crumb.name}
                      </button>
                      {index < driveBreadcrumbs.length - 1 && <ChevronRight size={14} className="text-gray-400" />}
                    </div>
                  ))}
                </div>
              )}

              <div className={`transition-opacity min-h-[200px] ${loadingDrive ? 'opacity-50 pointer-events-none' : ''}`}>
                {!driveFolderId && !loadingDrive && (
                  <div className="py-16 text-center text-gray-500 bg-gray-50">
                    {driveError || "Nenhuma pasta encontrada para este cliente."}
                  </div>
                )}
                
                {driveFolderId && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-white">
                        <th className="py-4 px-6 font-semibold">Nome</th>
                        <th className="py-4 px-6 font-semibold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driveItems.length === 0 && !loadingDrive ? (
                        <tr><td colSpan={2} className="py-12 text-center text-gray-500">Pasta vazia.</td></tr>
                      ) : (
                        driveItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-3">
                                {item.isFolder ? (
                                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                    <Folder size={20} className="fill-blue-100" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                                    <FileText size={20} />
                                  </div>
                                )}
                                <span className={`font-medium ${item.isFolder ? 'text-gray-800 cursor-pointer hover:text-blue-600' : 'text-gray-700'}`}
                                      onClick={() => item.isFolder && handleNavigateFolder(item.id, item.name)}>
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-6 text-right">
                              {item.isFolder ? (
                                <button 
                                  onClick={() => handleNavigateFolder(item.id, item.name)}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Abrir
                                </button>
                              ) : (
                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={item.viewUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md flex items-center gap-1">
                                    <ExternalLink size={14} /> Ver
                                  </a>
                                  <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white bg-[#3DB5D9] hover:bg-[#349ec0] px-3 py-1.5 rounded-md flex items-center gap-1">
                                    <Download size={14} /> Baixar
                                  </a>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          </div>
        </>
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
