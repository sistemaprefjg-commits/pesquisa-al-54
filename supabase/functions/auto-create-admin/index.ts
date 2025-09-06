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

    console.log('Verificando se usuários já existem...')

    // Check if admin user already exists
    const { data: existingAdminUser } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    const adminExists = existingAdminUser?.users?.some(user => user.email === adminEmail)
    const receptionExists = existingAdminUser?.users?.some(user => user.email === receptionEmail)

    console.log('Admin exists:', adminExists, 'Reception exists:', receptionExists)

    let adminUser = null
    let receptionUser = null

    // Create admin user if it doesn't exist
    if (!adminExists) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          username: 'Administrador',
          role: 'admin'
        }
      })

      if (error) {
        console.error('Error creating admin user:', error)
      } else {
        console.log('Admin user created successfully')
        adminUser = data?.user

        // Create profile for admin user
        if (adminUser) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: adminUser.id,
              username: 'Administrador',
              role: 'admin'
            })

          if (profileError) {
            console.error('Error creating admin profile:', profileError)
          }
        }
      }
    }

    // Create receptionist user if it doesn't exist
    if (!receptionExists) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: receptionEmail,
        password: receptionPassword,
        email_confirm: true,
        user_metadata: {
          username: 'Recepcionista',
          role: 'receptionist'
        }
      })

      if (error) {
        console.error('Error creating reception user:', error)
      } else {
        console.log('Reception user created successfully')
        receptionUser = data?.user

        // Create profile for reception user
        if (receptionUser) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: receptionUser.id,
              username: 'Recepcionista',
              role: 'receptionist'
            })

          if (profileError) {
            console.error('Error creating reception profile:', profileError)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuários verificados/criados com sucesso',
        created: {
          admin: !adminExists,
          reception: !receptionExists
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