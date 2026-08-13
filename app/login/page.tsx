"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, AlertCircle, HelpCircle, ShieldCheck, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos. Verifique suas credenciais.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Verificar se é primeiro acesso na tabela clientes
        const { data: cliente, error: clienteError } = await supabase
          .from("clientes")
          .select("is_primeiro_acesso, nivel_acesso")
          .eq("id", data.user.id)
          .single();

        if (clienteError) {
          console.error("Erro ao buscar dados do cliente:", clienteError);
        }

        if (cliente?.is_primeiro_acesso) {
          router.push("/primeiro-acesso");
        } else if (cliente?.nivel_acesso === "admin") {
          router.push("/admin/clientes");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError("Ocorreu um erro inesperado ao tentar fazer login.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Panel - Branding & Highlights */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#3DB5D9] via-[#329fbe] to-[#1e7a96] flex-col items-center justify-center p-12 overflow-hidden shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-25 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center max-w-lg text-center">
          <Link
            href="/"
            title="Ir para a Página Inicial"
            className="mb-10 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl transition-transform duration-500 hover:scale-105"
          >
            <Image 
              src="/logo-branca.png" 
              alt="PacÓleo Logo" 
              width={280} 
              height={100} 
              className="object-contain drop-shadow-md"
              priority
            />
          </Link>
          
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider border border-white/30">
              <ShieldCheck size={14} /> Portal do Cliente B2B
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Sustentabilidade e Gestão em Tempo Real
            </h1>
            <p className="text-base text-white/90 font-light leading-relaxed">
              Monitore suas coletas de óleo, acesse laudos ambientais (MTR/CDF) e acompanhe seu impacto ecológico positivo.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 w-full text-white/90 text-xs font-medium">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
              <div className="font-bold text-sm text-yellow-300">100%</div>
              <div>Rastreabilidade</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
              <div className="font-bold text-sm text-cyan-200">MTR & CDF</div>
              <div>Conformidade</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
              <div className="font-bold text-sm text-emerald-300">ESG</div>
              <div>Impacto Real</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Back to Home Link */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#3DB5D9] transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft size={14} />
              <span>Voltar para a Página Inicial</span>
            </Link>
          </div>

          {/* Mobile Logo */}
          <Link 
            href="/" 
            title="Ir para a Página Inicial"
            className="flex lg:hidden justify-center bg-gradient-to-r from-[#3DB5D9] to-[#2b9abf] p-6 rounded-2xl mb-8 shadow-md"
          >
            <Image 
              src="/logo-branca.png" 
              alt="PacÓleo Logo" 
              width={180} 
              height={70} 
              className="object-contain" 
            />
          </Link>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bem-vindo(a)</h2>
            <p className="mt-2 text-sm text-slate-500">
              Digite seu e-mail e senha para acessar o portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span className="text-sm text-red-700 font-medium leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-[#3DB5D9]/40 focus:border-[#3DB5D9] transition-all outline-none text-slate-800 placeholder-slate-400 text-sm font-medium"
                  placeholder="exemplo@empresa.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-[#3DB5D9]/40 focus:border-[#3DB5D9] transition-all outline-none text-slate-800 placeholder-slate-400 text-sm font-medium"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#3DB5D9] hover:bg-[#329fbe] active:bg-[#2b8aa6] text-white font-semibold shadow-lg shadow-[#3DB5D9]/25 hover:shadow-[#3DB5D9]/40 transition-all active:scale-[0.99] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2 text-sm cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Acessar Portal</span>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <HelpCircle size={14} className="text-slate-400" />
              <span>Precisa de suporte com seu acesso?</span>
            </div>
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#3DB5D9] hover:text-[#2b8aa6] hover:underline transition-colors"
            >
              Fale com o atendimento PacÓleo
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} PacÓleo. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
