import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente simples (Browser-only ou onde SSR auth não é estritamente necessário para cookies)
// Para uma aplicação Next.js App Router completa com cookies HTTP-only,
// recomenda-se usar o pacote @supabase/ssr, mas por simplicidade e devido à restrição B2B,
// usaremos a instância singleton do lado do cliente para chamadas diretas de componente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
