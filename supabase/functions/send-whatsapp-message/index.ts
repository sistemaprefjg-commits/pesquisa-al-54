import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const megaApiHost = Deno.env.get('MEGAAPI_HOST')!;
const megaApiInstanceKey = Deno.env.get('MEGAAPI_INSTANCE_KEY')!;
const megaApiToken = Deno.env.get('MEGAAPI_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, patientName, userId } = await req.json();

    console.log('Enviando mensagem via MegaAPI:', { phone, patientName });

    // Formatar número para padrão brasileiro
    const formattedPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;

    // Enviar mensagem através da MegaAPI
    const megaApiUrl = `https://${megaApiHost}/message/sendText/${megaApiInstanceKey}`;
    
    const megaApiResponse = await fetch(megaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${megaApiToken}`,
      },
      body: JSON.stringify({
        number: phoneWithCountry,
        textMessage: {
          text: message
        }
      }),
    });

    const megaApiResult = await megaApiResponse.json();
    console.log('Resposta da MegaAPI:', megaApiResult);

    let status = 'pending';
    if (megaApiResponse.ok && megaApiResult.success) {
      status = 'sent';
    } else {
      status = 'failed';
      console.error('Erro na MegaAPI:', megaApiResult);
    }

    // Registrar a mensagem no banco de dados
    const { error: dbError } = await supabase
      .from('whatsapp_messages')
      .insert({
        phone: phoneWithCountry,
        message: message,
        patient_name: patientName,
        status: status,
        sent_by: userId,
        sent_at: new Date().toISOString(),
        attempted_at: new Date().toISOString(),
        delay_applied_seconds: 0,
        safety_status: 'normal'
      });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
    }

    return new Response(JSON.stringify({ 
      success: megaApiResponse.ok && megaApiResult.success,
      status: status,
      megaApiResponse: megaApiResult,
      phoneUsed: phoneWithCountry
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no send-whatsapp-message:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});