"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PrimeiroAcessoPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Garantir que temos uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      }
    });
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    // Atualiza a senha no Auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      password: password
    });

    if (authError) {
      setError(authError.message);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">Primeiro Acesso</h2>
        <p className="text-gray-600 text-center text-sm mb-6">
          Por segurança, cadastre uma nova senha própria para continuar.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] focus:border-transparent outline-none"
              placeholder="Nova senha segura"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] focus:border-transparent outline-none"
              placeholder="Confirme a nova senha"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#3DB5D9] text-white font-medium py-2 px-4 rounded-md hover:bg-[#349ec0] transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Senha e Acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}
