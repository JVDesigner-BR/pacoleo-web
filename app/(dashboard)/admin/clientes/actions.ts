"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize a Supabase client with the service role key to bypass RLS and create users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function createClientAccount(formData: FormData) {
  const nome_empresa = formData.get("nome_empresa") as string;
  const cnpj = formData.get("cnpj") as string;
  const email = formData.get("email") as string;
  
  // Generate a random 6-digit temporary password
  const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email so they can log in immediately
    });

    if (authError) {
      console.error("Erro ao criar usuário auth:", authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user.id;

    // 2. Insert row in public.clientes
    const { error: dbError } = await supabaseAdmin
      .from("clientes")
      .insert({
        id: userId,
        nome_empresa,
        cnpj,
        email,
        nivel_acesso: "cliente",
        is_primeiro_acesso: true
      });

    if (dbError) {
      console.error("Erro ao criar perfil cliente:", dbError);
      // Rollback: delete the auth user if db insertion fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { success: false, error: dbError.message };
    }

    // Revalidate the page so the list updates
    revalidatePath("/admin/clientes");

    return { 
      success: true, 
      tempPassword 
    };

  } catch (error: any) {
    console.error("Erro interno:", error);
    return { success: false, error: error.message };
  }
}
