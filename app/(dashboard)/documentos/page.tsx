"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExternalLink, Search, Folder, FileText, Download, ChevronRight } from "lucide-react";

export default function DocumentosPage() {
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [driveItems, setDriveItems] = useState<any[]>([]);
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

  const docsFiltrados = driveItems.filter(doc => 
    doc.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Central de Documentos</h1>
          <p className="text-gray-500 mt-1">Acesse seus MTRs e CDFs em um só lugar.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar documentos..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB5D9] focus:border-transparent outline-none w-full md:w-64"
          />
        </div>
      </div>

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
          {loadingDrive && driveItems.length === 0 && !driveError && (
            <div className="py-20 text-center text-gray-500">Sincronizando com seus documentos...</div>
          )}

          {!driveFolderId && !loadingDrive && (
            <div className="py-16 text-center text-gray-500 bg-gray-50">
              {driveError || "Nenhuma pasta encontrada."}
            </div>
          )}
          
          {driveFolderId && driveItems.length >= 0 && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-white">
                  <th className="py-4 px-6 font-semibold">Nome</th>
                  <th className="py-4 px-6 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {docsFiltrados.length === 0 && !loadingDrive ? (
                  <tr><td colSpan={2} className="py-12 text-center text-gray-500">Pasta vazia ou nenhum documento encontrado na busca.</td></tr>
                ) : (
                  docsFiltrados.map((item) => (
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
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center"
                          >
                            Abrir pasta
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
  );
}
