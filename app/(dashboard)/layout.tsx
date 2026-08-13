"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Image as ImageIcon, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      setUserEmail(session.user.email || "");

      const { data: cliente } = await supabase
        .from("clientes")
        .select("nome_empresa, nivel_acesso, is_primeiro_acesso")
        .eq("id", session.user.id)
        .single();

      if (cliente?.is_primeiro_acesso) {
        router.push("/primeiro-acesso");
        return;
      }

      if (cliente?.nome_empresa) {
        setCompanyName(cliente.nome_empresa.replace(/^\[\d+\]\s*/, ''));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3DB5D9]/20 border-t-[#3DB5D9] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">Carregando portal...</p>
      </div>
    );
  }

  const clientNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/documentos", label: "Central de Documentos", icon: FileText },
  ];

  const adminNavItems = [
    { href: "/admin/clientes", label: "Visão de Clientes", icon: Users },
    { href: "/admin/marketing", label: "Gerador de Marketing", icon: ImageIcon },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col border-r border-slate-800/80 shadow-xl z-20 shrink-0">
        {/* Brand Header */}
        <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-900/90 border-b border-slate-800 flex flex-col items-center justify-center">
          <Link href={isAdmin ? "/admin/clientes" : "/dashboard"} className="transition-opacity hover:opacity-90">
            <Image 
              src="/logo-branca.png" 
              alt="PacÓleo Logo" 
              width={150} 
              height={55} 
              className="object-contain" 
              priority
            />
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold uppercase tracking-wider text-[#3DB5D9] border border-slate-700">
            {isAdmin ? "Painel Administrador" : "Portal B2B"}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#3DB5D9] text-white shadow-lg shadow-[#3DB5D9]/20 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/80" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {companyName ? companyName.charAt(0).toUpperCase() : (isAdmin ? "A" : "P")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate" title={companyName || "Usuário PacÓleo"}>
                {companyName || (isAdmin ? "Administrador" : "Minha Empresa")}
              </p>
              <p className="text-[11px] text-slate-400 truncate" title={userEmail}>
                {userEmail || "Conectado"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-xl hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors text-xs font-medium cursor-pointer"
          >
            <LogOut size={16} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header with Hamburger Drawer Toggle */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-30 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white focus:outline-none"
              aria-label="Abrir menu de navegação"
            >
              <Menu size={22} />
            </button>
            <Image 
              src="/logo-branca.png" 
              alt="PacÓleo" 
              width={110} 
              height={36} 
              className="object-contain" 
              priority
            />
          </div>
          
          <button 
            onClick={handleLogout} 
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-4/5 max-w-xs bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <Image src="/logo-branca.png" alt="PacÓleo" width={130} height={45} className="object-contain" />
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Company Info Badge */}
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3DB5D9] to-[#2b9abf] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {companyName ? companyName.charAt(0).toUpperCase() : (isAdmin ? "A" : "P")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{companyName || (isAdmin ? "Administrador" : "Minha Empresa")}</div>
                  <div className="text-[11px] text-slate-400 truncate">{userEmail}</div>
                </div>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Navegação
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#3DB5D9] text-white font-semibold shadow-md shadow-[#3DB5D9]/20"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Logout */}
              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

