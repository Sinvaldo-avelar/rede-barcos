import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackAnonKey = 'placeholder-anon-key'

if (!supabaseUrl || !supabaseAnonKey) {
	console.error(
		'Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas. O build não será interrompido, mas as operações do Supabase vão falhar até configurar as envs na hospedagem.'
	)
}

export const supabase = createClient(
	supabaseUrl || fallbackUrl,
	supabaseAnonKey || fallbackAnonKey
)