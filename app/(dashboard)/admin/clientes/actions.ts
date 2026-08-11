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
  let email = formData.get("email") as string;
  
  if (!email || email.trim() === "") {
    // Generate a placeholder email based on a timestamp to guarantee uniqueness
    email = `cliente_${Date.now()}@pacoleo.sistema`;
  }
  
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

export type PeriodFilter = "1_semana" | "1_mes" | "total";

export async function getGlobalImpact(period: PeriodFilter = "total") {
  try {
    let minDateThreshold: string | null = null;
    if (period !== "total") {
       const date = new Date();
       if (period === "1_semana") date.setDate(date.getDate() - 7);
       if (period === "1_mes") date.setMonth(date.getMonth() - 1);
       minDateThreshold = date.toISOString().split('T')[0];
    }

    let totalLitros = 0;
    let from = 0;
    const limit = 1000;
    
    while (true) {
      let query = supabaseAdmin
        .from("coletas")
        .select("litros_coletados")
        .range(from, from + limit - 1);
      
      if (minDateThreshold) {
        query = query.gte("data_coleta", minDateThreshold);
      }
        
      const { data, error } = await query;
        
      if (error) {
        console.error("Erro fetchGlobalImpact:", error);
        break;
      }
      
      if (!data || data.length === 0) break;
      
      const sum = data.reduce((acc, curr) => acc + Number(curr.litros_coletados), 0);
      totalLitros += sum;
      
      if (data.length < limit) break;
      from += limit;
    }
    
    // Fetch min and max dates
    let minQuery = supabaseAdmin.from("coletas").select("data_coleta").order("data_coleta", { ascending: true }).limit(1);
    let maxQuery = supabaseAdmin.from("coletas").select("data_coleta").order("data_coleta", { ascending: false }).limit(1);

    if (minDateThreshold) {
      minQuery = minQuery.gte("data_coleta", minDateThreshold);
      maxQuery = maxQuery.gte("data_coleta", minDateThreshold);
    }

    const { data: minData } = await minQuery;
    const { data: maxData } = await maxQuery;
    
    let minDate = "";
    let maxDate = "";
    if (minData && minData.length > 0) minDate = minData[0].data_coleta;
    if (maxData && maxData.length > 0) maxDate = maxData[0].data_coleta;
    
    return { success: true, totalLitros, minDate, maxDate };
  } catch (error: any) {
    console.error("Exception in getGlobalImpact:", error);
    return { success: false, totalLitros: 0, minDate: "", maxDate: "" };
  }
}
