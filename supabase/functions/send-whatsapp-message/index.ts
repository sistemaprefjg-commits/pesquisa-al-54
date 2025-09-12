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
    const formattedPhone = String(phone || '').replace(/\D/g, '');
    const phoneWithCountry = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;

    // ========== Tentativas de compatibilidade com diferentes variantes de MegaAPI ==========
    const base = `https://${megaApiHost}`.replace(/\/$/, '');

    const endpoints = [
      `${base}/api/message/sendText/${megaApiInstanceKey}`,
      `${base}/message/sendText/${megaApiInstanceKey}`,
      `${base}/api/messages/sendText/${megaApiInstanceKey}`,
      `${base}/api/message/send-text/${megaApiInstanceKey}`,
      `${base}/api/v1/message/sendText/${megaApiInstanceKey}`,
      // Estruturas onde o instanceId vem antes
      `${base}/api/instance/${megaApiInstanceKey}/message/sendText`,
      `${base}/api/instances/${megaApiInstanceKey}/message/sendText`,
      `${base}/api/instances/${megaApiInstanceKey}/sendText`,
      `${base}/api/${megaApiInstanceKey}/message/sendText`,
      // Query params
      `${base}/message/sendText?instanceKey=${megaApiInstanceKey}`,
      `${base}/api/message/sendText?instanceKey=${megaApiInstanceKey}`,
      `${base}/api/message/sendText?session=${megaApiInstanceKey}`,
    ];

    const payloads: Array<{ [k: string]: unknown, _type?: string }> = [
      { number: phoneWithCountry, textMessage: { text: message }, _type: 'textMessage.text' },
      { number: phoneWithCountry, text: message, _type: 'text' },
      { number: phoneWithCountry, message, _type: 'message' },
      { number: phoneWithCountry, body: message, _type: 'body' },
      { chatId: `${phoneWithCountry}@c.us`, text: message, _type: 'chatId.text' },
    ];

    const headersVariants: Array<Record<string, string> & { _auth?: string }> = [
      { 'Content-Type': 'application/json', 'Authorization': `Bearer ${megaApiToken}`, _auth: 'Bearer' },
      { 'Content-Type': 'application/json', 'Authorization': megaApiToken, _auth: 'Authorization-raw' },
      { 'Content-Type': 'application/json', 'apikey': megaApiToken, _auth: 'apikey' },
      { 'Content-Type': 'application/json', 'x-api-key': megaApiToken, _auth: 'x-api-key' },
      { 'Content-Type': 'application/json', 'token': megaApiToken, _auth: 'token' },
    ];

    let finalOk = false;
    let megaApiResponse: Response | null = null;
    let megaApiResult: any = null;
    let endpointUsed: string | null = null;
    let payloadUsed: string | null = null;
    let authUsed: string | null = null;

    // Realiza múltiplas tentativas com diferentes combinações
    for (const url of endpoints) {
      for (const headers of headersVariants) {
        for (const body of payloads) {
          console.log('Tentando envio MegaAPI', { url, auth: headers._auth, payload: body._type });
          try {
            const resp = await fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify(body),
            });

            const json = await resp.json().catch(() => ({}));
            console.log('Resposta tentativa MegaAPI:', { status: resp.status, ok: resp.ok, json });

            const looksSuccessful = resp.ok && !json?.error && json?.statusCode !== 404 && json?.name !== 'NOT_FOUND';

            if (looksSuccessful) {
              finalOk = true;
              megaApiResponse = resp;
              megaApiResult = json;
              endpointUsed = url;
              payloadUsed = String(body._type);
              authUsed = headers._auth || null;
              break;
            }
          } catch (err) {
            console.error('Falha ao chamar endpoint MegaAPI:', { url, err });
          }
        }
        if (finalOk) break;
      }
      if (finalOk) break;
    }

    // Se nada funcionou, realiza uma tentativa final para log detalhado
    if (!finalOk) {
      const fallbackUrl = `${base}/api/message/sendText/${megaApiInstanceKey}`;
      try {
        megaApiResponse = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${megaApiToken}` },
          body: JSON.stringify({ number: phoneWithCountry, textMessage: { text: message } }),
        });
        megaApiResult = await megaApiResponse.json().catch(() => ({}));
        endpointUsed = fallbackUrl;
        payloadUsed = 'textMessage.text';
        authUsed = 'Bearer';
      } catch (err) {
        console.error('Falha na tentativa final MegaAPI:', { fallbackUrl, err });
      }
    }

    console.log('Resposta da MegaAPI (final):', { endpointUsed, payloadUsed, authUsed, status: megaApiResponse?.status, ok: megaApiResponse?.ok, body: megaApiResult });

    let status = 'pending';
    const success = Boolean(finalOk || (megaApiResponse && megaApiResponse.ok && !megaApiResult?.error && megaApiResult?.statusCode !== 404));
    if (success) {
      status = 'sent';
    } else {
      status = 'failed';
      console.error('Erro na MegaAPI:', { endpointUsed, payloadUsed, authUsed, body: megaApiResult });
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
      success,
      status,
      megaApiResponse: megaApiResult,
      phoneUsed: phoneWithCountry,
      endpointUsed,
      payloadUsed,
      authUsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro no send-whatsapp-message:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'unknown_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
