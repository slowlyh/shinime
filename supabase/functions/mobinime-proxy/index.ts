import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOBINIME_BASE_URL = 'https://air.vunime.my.id/mobinime';
const MOBINIME_HEADERS = {
  'accept-encoding': 'gzip',
  'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
  'host': 'air.vunime.my.id',
  'user-agent': 'Dart/3.3 (dart:io)',
  'x-api-key': 'ThWmZq4t7w!z%C*F-JaNdRgUkXn2r5u8',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'GET', body } = await req.json();
    
    console.log(`Proxying request to: ${endpoint}, method: ${method}`);
    
    const url = `${MOBINIME_BASE_URL}${endpoint}`;
    
    const fetchOptions: RequestInit = {
      method,
      headers: MOBINIME_HEADERS,
    };

    if (method === 'POST' && body) {
      // Convert body object to URL-encoded string
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(body)) {
        formData.append(key, String(value));
      }
      fetchOptions.body = formData.toString();
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    console.log(`Response status: ${response.status}`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Proxy error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
