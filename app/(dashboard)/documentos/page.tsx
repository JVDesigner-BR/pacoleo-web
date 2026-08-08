"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, ExternalLink, Search } from "lucide-react";

type Documento = {
  id: string;
  tipo_doc: string;
  data_referencia: string;
  link_google_drive: string;
};

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data } = await supabase
        .from("documentos")
        .select("*")
        .order("data_referencia", { ascending: false });
        
      if (data) setDocumentos(data);
    }
    
    setLoading(false);
  };

  const docsFiltrados = documentos.filter(doc => 
    doc.data_referencia.includes(busca) || doc.tipo_doc.toLowerCase().includes(busca.toLowerCase())
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
            placeholder="Buscar por data ou tipo..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB5D9] focus:border-transparent outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Carregando documentos...</div>
        ) : docsFiltrados.length === 0 ? (
          <div className="py-20 text-center text-gray-500">Nenhum documento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600">Data de Referência</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Tipo</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {docsFiltrados.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-gray-800 font-medium">
                      {new Date(doc.data_referencia).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.tipo_doc === "CDF" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        <FileText size={14} />
                        {doc.tipo_doc}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <a 
                        href={doc.link_google_drive} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium text-sm transition-colors"
                      >
                        Baixar
                        <ExternalLink size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
