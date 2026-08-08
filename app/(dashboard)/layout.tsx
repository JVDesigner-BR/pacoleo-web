"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, FileText, Users, Image as ImageIcon, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: cliente } = await supabase
        .from("clientes")
        .select("nivel_acesso, is_primeiro_acesso")
        .eq("id", session.user.id)
        .single();

      if (cliente?.is_primeiro_acesso) {
        router.push("/primeiro-acesso");
        return;
      }

      setIsAdmin(cliente?.nivel_acesso === "admin");
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1F2937] text-white flex flex-col hidden md:flex">
        <div className="p-6 bg-[#3DB5D9] flex justify-center items-center">
          <Image src="/logo-branca.png" alt="Logo" width={160} height={60} className="object-contain" />
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {!isAdmin && (
            <>
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === "/dashboard" ? "bg-[#3DB5D9] text-white" : "hover:bg-gray-800 text-gray-300"}`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/documentos" 
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === "/documentos" ? "bg-[#3DB5D9] text-white" : "hover:bg-gray-800 text-gray-300"}`}
              >
                <FileText size={20} />
                <span>Documentos</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administrador
              </div>
              <Link 
                href="/admin/clientes" 
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname.includes("/admin/clientes") ? "bg-[#3DB5D9] text-white" : "hover:bg-gray-800 text-gray-300"}`}
              >
                <Users size={20} />
                <span>Visão de Clientes</span>
              </Link>
              <Link 
                href="/admin/marketing" 
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname.includes("/admin/marketing") ? "bg-[#3DB5D9] text-white" : "hover:bg-gray-800 text-gray-300"}`}
              >
                <ImageIcon size={20} />
                <span>Marketing</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-md hover:bg-gray-800 text-gray-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#3DB5D9] p-4 flex justify-between items-center">
          <Image src="/logo-branca.png" alt="Logo" width={120} height={40} className="object-contain" />
          <button onClick={handleLogout} className="text-white">
            <LogOut size={24} />
          </button>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
