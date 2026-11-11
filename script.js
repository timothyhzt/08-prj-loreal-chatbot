// The worker will receive this conversation, including the system instructions.
const SYSTEM_PROMPT =
  "You are a helpful L'Oréal beauty assistant. You help users discover and understand L'Oréal products, including makeup, skincare, haircare, and fragrances. You may provide personalized beauty routines and product recommendations. Keep recommendations helpful, concise, and friendly. Only answer questions related to L'Oréal, L'Oréal products, beauty routines, product recommendations, or closely related beauty topics. Politely refuse unrelated questions and redirect the user toward L'Oréal or beauty topics.";

// The browser needs the full HTTPS URL to reach the Cloudflare Worker.
const WORKER_URL =
  "https://soft-frog-9d6e.timothytu0807.workers.dev/";


// Keeping the full history lets the assistant refer to earlier questions.
const conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Add one message bubble and scroll it into view.
function addMessage(content, sender) {
  const message = document.createElement("div");
  message.className = `msg ${sender}`;
  message.textContent = content;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send the current input to the worker and display its response.
async function sendMessage() {
  const messageText = userInput.value.trim();

  if (!messageText || sendBtn.disabled) {
    return;
  }

  addMessage(messageText, "user");
  conversationHistory.push({ role: "user", content: messageText });
  userInput.value = "";
  sendBtn.disabled = true;

  try {
    if (WORKER_URL === "YOUR_CLOUDFLARE_WORKER_URL") {
      throw new Error("The Cloudflare Worker URL has not been configured yet.");
    }

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
      throw new Error(`Worker request failed with status ${response.status}.`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("The worker returned an unexpected response.");
    }

    conversationHistory.push({ role: "assistant", content: assistantMessage });
    addMessage(assistantMessage, "ai");
  } catch (error) {
    console.error(error);
    addMessage(
      "I am ready to help with L'Oréal beauty questions. Please connect the Cloudflare Worker URL in script.js to enable live recommendations.",
      "ai",
    );
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// A form submit supports both the Send button and Enter in the input field.
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

addMessage(
  "Hello. I am your L'Oréal beauty assistant. Ask me about products, routines, or finding the right formula for you.",
  "ai",
);
