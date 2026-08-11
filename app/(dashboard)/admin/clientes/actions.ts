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

export async function getGlobalImpact(startDate?: string, endDate?: string) {
  try {
    let totalLitros = 0;
    let totalColetas = 0;
    let from = 0;
    const limit = 1000;
    
    // Insights stats
    const clientStats: Record<string, { litros: number, coletas: number }> = {};
    let largestCollection = { clienteId: "", litros: 0 };
    
    while (true) {
      let query = supabaseAdmin
        .from("coletas")
        .select("litros_coletados, cliente_id")
        .range(from, from + limit - 1);
      
      if (startDate) {
        query = query.gte("data_coleta", startDate);
      }
      if (endDate) {
        query = query.lte("data_coleta", endDate);
      }
        
      const { data, error } = await query;
        
      if (error) {
        console.error("Erro fetchGlobalImpact:", error);
        break;
      }
      
      if (!data || data.length === 0) break;
      
      for (const curr of data) {
        const litros = Number(curr.litros_coletados);
        const cid = curr.cliente_id;
        
        totalLitros += litros;
        
        if (cid) {
          if (!clientStats[cid]) clientStats[cid] = { litros: 0, coletas: 0 };
          clientStats[cid].litros += litros;
          clientStats[cid].coletas += 1;
          
          if (litros > largestCollection.litros) {
            largestCollection = { clienteId: cid, litros };
          }
        }
      }
      totalColetas += data.length;
      
      if (data.length < limit) break;
      from += limit;
    }
    
    let topClienteLitros = { id: "", value: 0 };
    let topClienteColetas = { id: "", value: 0 };
    
    for (const [cid, stats] of Object.entries(clientStats)) {
      if (stats.litros > topClienteLitros.value) {
        topClienteLitros = { id: cid, value: stats.litros };
      }
      if (stats.coletas > topClienteColetas.value) {
        topClienteColetas = { id: cid, value: stats.coletas };
      }
    }

    // Fetch min and max dates
    let minQuery = supabaseAdmin.from("coletas").select("data_coleta").order("data_coleta", { ascending: true }).limit(1);
    let maxQuery = supabaseAdmin.from("coletas").select("data_coleta").order("data_coleta", { ascending: false }).limit(1);

    if (startDate) {
      minQuery = minQuery.gte("data_coleta", startDate);
      maxQuery = maxQuery.gte("data_coleta", startDate);
    }
    if (endDate) {
      minQuery = minQuery.lte("data_coleta", endDate);
      maxQuery = maxQuery.lte("data_coleta", endDate);
    }

    const { data: minData } = await minQuery;
    const { data: maxData } = await maxQuery;
    
    const minDate = minData && minData.length > 0 ? minData[0].data_coleta : null;
    const maxDate = maxData && maxData.length > 0 ? maxData[0].data_coleta : null;
    
    return { 
      success: true, 
      totalLitros, 
      totalColetas, 
      minDate, 
      maxDate,
      insights: {
        topLitros: topClienteLitros,
        topColetas: topClienteColetas,
        largestCollection
      }
    };
  } catch (error: any) {
    console.error("Unexpected error in getGlobalImpact:", error);
    return { success: false, error: error.message };
  }
}
