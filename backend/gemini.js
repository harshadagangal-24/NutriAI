const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ============================================================
// GEMINI MODELS
// ============================================================

const models = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
];

// ============================================================
// TIMEOUT SETTINGS
// ============================================================

const REQUEST_TIMEOUT_MS = 12000;

// ============================================================
// EXTRACT TEXT FROM GEMINI RESPONSE
// ============================================================

function extractGeminiText(response) {
  // Standard response
  if (
    response &&
    typeof response.text === "string" &&
    response.text.trim()
  ) {
    return response.text.trim();
  }

  // Response where text is a function
  if (
    response &&
    typeof response.text === "function"
  ) {
    try {
      const text = response.text();

      if (
        typeof text === "string" &&
        text.trim()
      ) {
        return text.trim();
      }
    } catch (error) {
      console.log(
        "Gemini text() extraction failed:",
        error.message
      );
    }
  }

  // Extract from candidates
  const candidates =
    response?.candidates || [];

  for (const candidate of candidates) {
    const parts =
      candidate?.content?.parts || [];

    const textParts = parts
      .map((part) => part?.text)
      .filter(
        (text) =>
          typeof text === "string" &&
          text.trim()
      );

    if (textParts.length > 0) {
      return textParts.join("\n").trim();
    }
  }

  return "";
}

// ============================================================
// CHECK TEMPORARY GEMINI ERROR
// ============================================================

function isTemporaryGeminiError(error) {
  const status =
    error?.status ||
    error?.statusCode ||
    error?.code;

  const message =
    String(error?.message || "").toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("temporarily unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded")
  );
}

// ============================================================
// GEMINI REQUEST WITH TIMEOUT
// ============================================================

async function requestGemini(model, prompt) {
  return Promise.race([
    ai.models.generateContent({
      model,
      contents: prompt,
    }),

    new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error("Gemini request timed out")
          ),
        REQUEST_TIMEOUT_MS
      );
    }),
  ]);
}

// ============================================================
// ADD ALLERGY SAFETY INSTRUCTIONS
// ============================================================

function buildPromptWithAllergies(prompt, allergies) {
  if (!allergies) {
    return prompt;
  }

  const allergyText = Array.isArray(allergies)
    ? allergies.join(", ")
    : String(allergies).trim();

  if (!allergyText) {
    return prompt;
  }

  return `
${prompt}

IMPORTANT ALLERGY SAFETY INSTRUCTION:
The user has the following food allergies or foods to avoid:
${allergyText}

Do NOT recommend, suggest, or include foods containing these allergens.
If a suggested food commonly contains one of these allergens,
choose a suitable alternative instead.
If the user specifically asks about an allergen-containing food,
clearly mention that it should be avoided based on the user's
saved allergy information.
`;
}

// ============================================================
// GENERATE GEMINI RESPONSE
// ============================================================

async function generateGeminiResponse(
  prompt,
  allergies = ""
) {
  let lastError = null;

  // Add allergy information to the prompt
  const finalPrompt =
    buildPromptWithAllergies(
      prompt,
      allergies
    );

  for (const model of models) {
    try {
      console.log(
        `Sending request to Gemini using ${model}...`
      );

      if (allergies) {
        console.log(
          "Gemini allergy protection: enabled"
        );
      }

      // ------------------------------------------------------
      // CALL GEMINI
      // ------------------------------------------------------

      const response =
        await requestGemini(
          model,
          finalPrompt
        );

      // ------------------------------------------------------
      // EXTRACT RESPONSE
      // ------------------------------------------------------

      const text =
        extractGeminiText(response);

      // ------------------------------------------------------
      // CHECK RESPONSE
      // ------------------------------------------------------

      if (text) {
        console.log(
          `Gemini response received from ${model}.`
        );

        return text;
      }

      lastError = new Error(
        `Gemini returned an empty response from ${model}.`
      );

      console.error(
        lastError.message
      );

      // Move directly to next model
      continue;

    } catch (error) {
      lastError = error;

      console.error(
        `Gemini error with ${model}:`,
        error.message || error
      );

      // ------------------------------------------------------
      // PERMANENT ERROR
      // ------------------------------------------------------

      if (!isTemporaryGeminiError(error)) {
        throw error;
      }

      // ------------------------------------------------------
      // TEMPORARY ERROR
      // Immediately try next model.
      // NO RETRY DELAY.
      // ------------------------------------------------------

      console.log(
        `${model} is temporarily unavailable. Trying next model...`
      );

      continue;
    }
  }

  // ==========================================================
  // ALL MODELS FAILED
  // ==========================================================

  throw (
    lastError ||
    new Error(
      "All Gemini models are temporarily unavailable."
    )
  );
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  generateGeminiResponse,
};