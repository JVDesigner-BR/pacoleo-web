"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ExternalLink, 
  Search, 
  Folder, 
  FileText, 
  Download, 
  ChevronRight, 
  ShieldCheck, 
  Info,
  FileCode,
  FileSpreadsheet,
  File,
  AlertCircle
} from "lucide-react";

export default function DocumentosPage() {
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [driveItems, setDriveItems] = useState<{ id: string; name: string; isFolder?: boolean; viewUrl?: string; downloadUrl?: string }[]>([]);
  const [driveBreadcrumbs, setDriveBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(true);
  const [driveError, setDriveError] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetchUserDataAndDrive();
  }, []);

  const fetchUserDataAndDrive = async () => {
    setLoadingDrive(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Obter os dados do cliente logado
      const { data: cliente } = await supabase
        .from("clientes")
        .select("nome_empresa")
        .eq("id", session.user.id)
        .single();
        
      if (cliente) {
        const match = cliente.nome_empresa.match(/^\[(\d+)\]/);
        if (match) {
          fetchDriveFolder(match[1]);
        } else {
          setDriveError("Seu cadastro não possui uma pasta vinculada (ID numérico não encontrado).");
          setLoadingDrive(false);
        }
      } else {
        setDriveError("Erro ao obter dados do usuário.");
        setLoadingDrive(false);
      }
    } else {
      setLoadingDrive(false);
    }
  };

  const fetchDriveFolder = async (id: string) => {
    setDriveError("");
    try {
      const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby51b908_XmHDtgPbkJHcDDVk8Kzl77dueuP5TZ8jfcG1Qxc50Nmhd9XRhUhTCPRpKm/exec";
      const res = await fetch(`${WEB_APP_URL}?clientId=${id}`);
      const data = await res.json();
      if (data.success && data.folderId) {
        setDriveFolderId(data.folderId);
        setDriveBreadcrumbs([{ id: data.folderId, name: "Meus Documentos" }]);
        fetchDriveFolderContents(data.folderId);
      } else {
        setDriveError(data.error || "Sua pasta de documentos não foi encontrada.");
        setLoadingDrive(false);
      }
    } catch {
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
        const sortedItems = data.items.sort((a: { isFolder?: boolean; name: string }, b: { isFolder?: boolean; name: string }) => {
          if (a.isFolder === b.isFolder) {
            return a.name.localeCompare(b.name);
          }
          return a.isFolder ? -1 : 1;
        });
        setDriveItems(sortedItems);
      } else {
        setDriveError(data.error || "Erro ao listar a pasta.");
      }
    } catch {
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

  const docsFiltrados = driveItems.filter(doc => 
    doc.name.toLowerCase().includes(busca.toLowerCase())
  );

  const getFileIcon = (filename: string, isFolder?: boolean) => {
    if (isFolder) {
      return (
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#3DB5D9] flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
          <Folder size={20} className="fill-sky-100" />
        </div>
      );
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100 shadow-xs">
          <FileText size={20} />
        </div>
      );
    }
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
          <FileSpreadsheet size={20} />
        </div>
      );
    }
    if (ext === 'xml') {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
          <FileCode size={20} />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs">
        <File size={20} />
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#3DB5D9]/10 p-2 rounded-xl text-[#3DB5D9]">
              <FileText size={22} className="stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Central de Documentos & Laudos
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Acesse e baixe seus Manifestos de Transporte (MTR) e Certificados de Destinação Final (CDF).
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar arquivo..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#3DB5D9]/30 focus:border-[#3DB5D9] outline-none text-sm text-slate-800 placeholder-slate-400 w-full md:w-72 shadow-xs transition-all font-medium"
          />
        </div>
      </div>

      {/* Compliance / Legal Info Card */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50/50 p-4 sm:p-5 rounded-2xl border border-sky-100 shadow-xs flex items-start gap-3.5">
        <div className="bg-[#3DB5D9] text-white p-2 rounded-xl shrink-0 mt-0.5 shadow-sm shadow-[#3DB5D9]/30">
          <ShieldCheck size={20} />
        </div>
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-0.5">Segurança Jurídica & Auditoria Ambiental</span>
          Todos os arquivos disponibilizados nesta pasta têm validade oficial perante órgãos ambientais (IBAMA, CETESB e secretarias municipais) para comprovar a destinação ecológica de resíduos da sua empresa.
        </div>
      </div>

      {/* File Explorer Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-8">
        {/* Breadcrumb Navigation */}
        {driveBreadcrumbs.length > 0 && (
          <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-3 flex items-center gap-2 text-xs sm:text-sm text-slate-600 overflow-x-auto">
            {driveBreadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center gap-2 whitespace-nowrap">
                <button 
                  onClick={() => handleNavigateBreadcrumb(index)}
                  className={`hover:text-[#3DB5D9] transition-colors cursor-pointer ${
                    index === driveBreadcrumbs.length - 1 
                      ? 'font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs' 
                      : 'hover:underline text-slate-600'
                  }`}
                >
                  {crumb.name}
                </button>
                {index < driveBreadcrumbs.length - 1 && <ChevronRight size={14} className="text-slate-400" />}
              </div>
            ))}
          </div>
        )}

        <div className={`transition-opacity min-h-[240px] ${loadingDrive ? 'opacity-50 pointer-events-none' : ''}`}>
          {loadingDrive && driveItems.length === 0 && !driveError && (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#3DB5D9]/20 border-t-[#3DB5D9] rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500 animate-pulse">Sincronizando com seus documentos no Google Drive...</p>
            </div>
          )}

          {!driveFolderId && !loadingDrive && (
            <div className="py-20 text-center text-slate-500 bg-slate-50/50 p-6 flex flex-col items-center justify-center">
              <AlertCircle size={36} className="text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700">{driveError || "Nenhuma pasta encontrada."}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">Entre em contato com o suporte da PacÓleo caso sua pasta ainda não tenha sido vinculada.</p>
            </div>
          )}
          
          {driveFolderId && driveItems.length >= 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/50 font-bold">
                    <th className="py-3.5 px-5 sm:px-6">Nome do Item</th>
                    <th className="py-3.5 px-5 sm:px-6 text-right">Ações Disponíveis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {docsFiltrados.length === 0 && !loadingDrive ? (
                    <tr>
                      <td colSpan={2} className="py-16 text-center text-slate-500">
                        <p className="font-medium text-slate-700">Nenhum documento encontrado.</p>
                        <p className="text-xs text-slate-400 mt-1">A pasta está vazia ou nenhum item corresponde ao termo pesquisado.</p>
                      </td>
                    </tr>
                  ) : (
                    docsFiltrados.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-5 sm:px-6">
                          <div className="flex items-center gap-3">
                            {getFileIcon(item.name, item.isFolder)}
                            <div className="min-w-0">
                              <span 
                                className={`font-semibold text-sm truncate block ${
                                  item.isFolder 
                                    ? 'text-slate-800 cursor-pointer hover:text-[#3DB5D9]' 
                                    : 'text-slate-700'
                                }`}
                                onClick={() => item.isFolder && handleNavigateFolder(item.id, item.name)}
                              >
                                {item.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {item.isFolder ? 'Pasta de arquivos' : 'Documento oficial'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 sm:px-6 text-right">
                          {item.isFolder ? (
                            <button 
                              onClick={() => handleNavigateFolder(item.id, item.name)}
                              className="text-xs font-bold text-[#3DB5D9] hover:text-[#329fbe] bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Abrir Pasta</span>
                              <ChevronRight size={14} />
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {item.viewUrl && (
                                <a 
                                  href={item.viewUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                  title="Visualizar documento online"
                                >
                                  <ExternalLink size={13} />
                                  <span>Visualizar</span>
                                </a>
                              )}
                              {item.downloadUrl && (
                                <a 
                                  href={item.downloadUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs font-bold text-white bg-[#3DB5D9] hover:bg-[#329fbe] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all hover:shadow-sm"
                                  title="Baixar arquivo"
                                >
                                  <Download size={13} />
                                  <span>Baixar</span>
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

