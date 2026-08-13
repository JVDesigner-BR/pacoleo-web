"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  KeyRound,
  Sparkles,
  HelpCircle
} from "lucide-react";

export default function PrimeiroAcessoPage() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário já está autenticado com senha temporária
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const hasMinLength = password.length >= 6;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && passwordsMatch;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasMinLength) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (!passwordsMatch) {
      setError("As senhas não conferem. Certifique-se de digitar a mesma senha nos dois campos.");
      return;
    }

    setLoading(true);

    // Atualiza a senha no Auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      password: password
    });

    if (authError) {
      setError(authError.message || "Erro ao atualizar a senha. Tente novamente.");
      setLoading(false);
      return;
    }

    // Atualiza a flag na tabela clientes
    if (authData.user) {
      const { data: clienteData, error: dbError } = await supabase
        .from("clientes")
        .update({ is_primeiro_acesso: false })
        .eq("id", authData.user.id)
        .select("nivel_acesso")
        .single();

      if (dbError) {
        setError("Erro ao atualizar o perfil. Tente novamente.");
        setLoading(false);
        return;
      }

      // Redireciona para a tela certa
      if (clienteData?.nivel_acesso === "admin") {
        router.push("/admin/clientes");
      } else {
        router.push("/dashboard");
      }
    }
  };

  // Carregando verificação de sessão
  if (hasSession === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3DB5D9]"></div>
      </div>
    );
  }

  // CASO 1: Usuário NÃO está logado (veio pelo rodapé ou link direto)
  // Exibimos uma tela explicativa sem redirecionamento forçado, permitindo voltar pelo botão do navegador
  if (!hasSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-[#3DB5D9]/15 to-transparent pointer-events-none -z-10 blur-3xl"></div>

        <div className="max-w-md w-full">
          {/* Header Link */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#3DB5D9] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft size={15} />
              <span>Voltar para o Início</span>
            </Link>

            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-[#3DB5D9] transition-colors"
            >
              Fazer Login
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8 text-center space-y-6">
            <Link 
              href="/"
              title="Ir para a Página Inicial"
              className="bg-[#3DB5D9] p-4 rounded-2xl shadow-lg shadow-[#3DB5D9]/20 inline-flex items-center justify-center transition-transform hover:scale-105"
            >
              <Image 
                src="/logo-branca.png" 
                alt="PacÓleo Logo" 
                width={160} 
                height={60} 
                className="object-contain" 
                priority
              />
            </Link>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3DB5D9]/10 text-[#2488a4] text-xs font-bold uppercase tracking-wider">
                <KeyRound size={14} /> Ativação de Acesso
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Como funciona o Primeiro Acesso?
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Para cadastrar sua senha pessoal definitiva, faça login primeiro com a <strong>senha provisória</strong> gerada para o seu estabelecimento.
              </p>
            </div>

            {/* Passo a Passo Didático */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#3DB5D9] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <span>Acesse a página de login informando seu e-mail e a senha temporária recebida.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#3DB5D9] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <span>O portal identificará que é seu primeiro login e abrirá a tela de nova senha.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#3DB5D9] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <span>Pronto! Sua senha segura estará ativada para todos os próximos acessos.</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href="/login"
                className="w-full py-3.5 rounded-xl bg-[#3DB5D9] hover:bg-[#329fbe] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#3DB5D9]/25 hover:shadow-[#3DB5D9]/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Ir para a Tela de Login</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Voltar para a Página Inicial</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASO 2: Usuário ESTÁ logado com sessão ativa (definir nova senha)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      {/* Background ambient accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-[#3DB5D9]/15 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      <div className="max-w-md w-full">
        {/* Botão de Voltar para a Página Inicial */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#3DB5D9] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft size={15} />
            <span>Voltar para o Início</span>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-[#3DB5D9] transition-colors"
          >
            Fazer Login
          </Link>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link 
            href="/"
            title="Ir para a Página Inicial"
            className="bg-[#3DB5D9] p-4 rounded-2xl shadow-lg shadow-[#3DB5D9]/20 mb-4 inline-flex items-center justify-center transition-transform hover:scale-105"
          >
            <Image 
              src="/logo-branca.png" 
              alt="PacÓleo Logo" 
              width={160} 
              height={60} 
              className="object-contain" 
              priority
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3DB5D9]/10 text-[#2488a4] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Ativação de Acesso
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Defina sua Senha Pessoal
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Bem-vindo(a) à PacÓleo! Por segurança, crie uma senha exclusiva para os seus próximos acessos.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span className="text-sm text-red-700 font-medium leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Nova Senha
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
                  className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#3DB5D9]/40 focus:border-[#3DB5D9] outline-none text-sm text-slate-800 placeholder-slate-400 font-medium transition-all"
                  placeholder="Mínimo de 6 caracteres"
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

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#3DB5D9]/40 focus:border-[#3DB5D9] outline-none text-sm text-slate-800 placeholder-slate-400 font-medium transition-all"
                  placeholder="Repita sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? "Ocultar confirmação" : "Exibir confirmação"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checklist de Validação Visual */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Requisitos de Segurança:
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                {hasMinLength ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> : <XCircle size={15} className="text-slate-300 shrink-0" />}
                <span>Pelo menos 6 caracteres</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors ${passwordsMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                {passwordsMatch ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> : <XCircle size={15} className="text-slate-300 shrink-0" />}
                <span>Senhas coincidem perfeitamente</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !isFormValid}
              className="w-full bg-[#3DB5D9] hover:bg-[#329fbe] text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-[#3DB5D9]/25 hover:shadow-[#3DB5D9]/40 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Salvando nova senha...</span>
                </>
              ) : (
                <>
                  <span>Salvar Senha e Entrar</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
