export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Only POST requests are supported." }, 405, corsHeaders);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ error: "The OPENAI_API_KEY secret is not configured." }, 500, corsHeaders);
    }

    let userInput;
    try {
      userInput = await request.json();
    } catch {
      return jsonResponse({ error: "The request body must be valid JSON." }, 400, corsHeaders);
    }

    if (!Array.isArray(userInput.messages)) {
      return jsonResponse({ error: "The request must include a messages array." }, 400, corsHeaders);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: ["Bearer", env.OPENAI_API_KEY].join(" "),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: userInput.messages,
        max_completion_tokens: 300,
      }),
    });

    const data = await response.json();
    return jsonResponse(data, response.status, corsHeaders);
  },
};

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
