import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Admin user credentials
    const adminEmail = 'admin@hospital.com'
    const adminPassword = 'Hospital@Admin2024'
    
    // Receptionist user credentials  
    const receptionEmail = 'recepcao@hospital.com'
    const receptionPassword = 'Recepcao@2024'

    // Create admin user
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        username: 'Administrador',
        role: 'admin'
      }
    })

    if (adminError) {
      console.error('Error creating admin user:', adminError)
    } else {
      console.log('Admin user created successfully')
    }

    // Create receptionist user
    const { data: receptionUser, error: receptionError } = await supabaseAdmin.auth.admin.createUser({
      email: receptionEmail,
      password: receptionPassword,
      email_confirm: true,
      user_metadata: {
        username: 'Recepcionista',
        role: 'receptionist'
      }
    })

    if (receptionError) {
      console.error('Error creating reception user:', receptionError)
    } else {
      console.log('Reception user created successfully')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuários administrativos criados com sucesso',
        credentials: {
          admin: {
            email: adminEmail,
            password: adminPassword
          },
          recepcao: {
            email: receptionEmail,
            password: receptionPassword
          }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})