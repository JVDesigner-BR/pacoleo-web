"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("E-mail ou senha inválidos. Tente novamente.");
      setLoading(false);
      return;
    }

    if (data.user) {
      // Verificar se é primeiro acesso
      const { data: cliente, error: dbError } = await supabase
        .from("clientes")
        .select("is_primeiro_acesso, nivel_acesso")
        .eq("id", data.user.id)
        .single();

      if (dbError) {
        setError("Erro ao buscar dados do cliente.");
        setLoading(false);
        return;
      }

      if (cliente.is_primeiro_acesso) {
        router.push("/primeiro-acesso");
      } else if (cliente.nivel_acesso === "admin") {
        router.push("/admin/clientes");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#4fbddb] flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-12 drop-shadow-lg">
            <Image 
              src="/logo-branca.png" 
              alt="PacÓleo Logo" 
              width={300} 
              height={120} 
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center text-white mt-8 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Portal B2B</h1>
            <p className="text-lg text-white/90 max-w-md mx-auto font-light leading-relaxed">
              Acompanhe suas coletas, gerencie documentos e veja o impacto ambiental da sua empresa em tempo real.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center bg-[#4fbddb] p-6 rounded-2xl mb-8 shadow-md">
            <Image 
              src="/logo-branca.png" 
              alt="PacÓleo Logo" 
              width={180} 
              height={70} 
              className="object-contain" 
            />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-gray-500">
              Acesse sua conta para continuar
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#4fbddb]/50 focus:border-[#4fbddb] transition-all outline-none text-gray-800 placeholder-gray-400"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#4fbddb]/50 focus:border-[#4fbddb] transition-all outline-none text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#4fbddb] hover:bg-[#3ca5c2] text-white font-semibold shadow-lg shadow-[#4fbddb]/30 hover:shadow-[#4fbddb]/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar no Portal</span>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} PacÓleo. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
