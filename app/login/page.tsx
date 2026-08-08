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
      setError(authError.message);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center bg-[#3DB5D9] p-6 rounded-lg mb-8">
          <Image src="/logo-branca.png" alt="PacÓleo Logo" width={200} height={80} className="object-contain" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Portal B2B PacÓleo</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] focus:border-transparent outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3DB5D9] focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#3DB5D9] text-white font-medium py-2 px-4 rounded-md hover:bg-[#349ec0] transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
