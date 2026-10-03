const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const authMiddleware = require("./middleware/authMiddleware");

const router = express.Router();


// ============================================================
// GEMINI AI IMPORT
// ============================================================

const { generateGeminiResponse } = require("./gemini");


// ============================================================
// GEMINI CHAT + RECIPE ROUTE
// ============================================================

router.post("/chat", authMiddleware, async (req, res) => {
  try {

    const { message, profile } = req.body;

    console.log("");
    console.log("========================================");
    console.log("NUTRIAI AI REQUEST");
    console.log("========================================");

    console.log("AI request received:", message);


    // --------------------------------------------------------
    // CHECK MESSAGE
    // --------------------------------------------------------

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message."
      });
    }


    // --------------------------------------------------------
    // USER PROFILE
    // --------------------------------------------------------

    const userProfile = profile || {};


    // --------------------------------------------------------
    // GEMINI PROMPT
    // --------------------------------------------------------

    const prompt = `
You are NutriAI, a helpful AI nutrition assistant and recipe assistant.

Give simple, practical and personalized responses.


USER PROFILE:

Name: ${userProfile.name || "User"}
Age: ${userProfile.age || "Not provided"}
Gender: ${userProfile.gender || "Not provided"}
Height: ${userProfile.height || "Not provided"} cm
Weight: ${userProfile.weight || "Not provided"} kg
Activity Level: ${userProfile.activity || "Not provided"}
Goal: ${userProfile.goal || "Not provided"}
Food Preference: ${userProfile.foodPreference || "Not provided"}
Allergies / Foods to Avoid: ${userProfile.allergies || "None"}


USER REQUEST:

${message}


RULES:

- Answer the user's request directly.
- Keep the answer concise and easy to understand.
- Personalize the answer when the profile information is relevant.
- Use bullet points or numbered steps when useful.
- Give practical food and nutrition suggestions.
- If the user asks for a recipe, provide practical ingredients and preparation steps.
- Follow any specific output format requested by the user.
- Do not diagnose diseases.
- Do not prescribe medicines.
- For serious medical conditions, recommend consulting a qualified healthcare professional.
- Do not include unnecessary disclaimers.
`;


    // --------------------------------------------------------
    // CALL GEMINI
    // --------------------------------------------------------

    console.log("Sending request to Gemini...");

    // IMPORTANT:
    // generateGeminiResponse() already returns plain text.
    // Do NOT use response.text here.

    const reply = await generateGeminiResponse(
  prompt,
  userProfile.allergies || ""
);


    // --------------------------------------------------------
    // CHECK RESPONSE
    // --------------------------------------------------------

    if (!reply || typeof reply !== "string" || !reply.trim()) {

      console.error("Gemini returned an empty response.");

      return res.status(500).json({
        message: "AI returned an empty response."
      });

    }


    console.log("Gemini response successfully received.");
    console.log("========================================");
    console.log("");


    // --------------------------------------------------------
    // SEND RESPONSE TO FRONTEND
    // --------------------------------------------------------

    return res.json({
      reply: reply.trim()
    });


  } catch (error) {

    console.error("");
    console.error("========================================");
    console.error("GEMINI AI ERROR");
    console.error("========================================");
    console.error(error);
    console.error("");


    // --------------------------------------------------------
    // GEMINI TEMPORARILY UNAVAILABLE
    // --------------------------------------------------------

    if (
      error.status === 503 ||
      error.statusCode === 503 ||
      error.message?.includes("503") ||
      error.message?.toLowerCase().includes("unavailable") ||
      error.message?.toLowerCase().includes("high demand") ||
      error.message?.toLowerCase().includes("overloaded")
    ) {

      return res.status(503).json({
        message:
          "Gemini AI is temporarily busy. Please try again in a few seconds."
      });

    }


    // --------------------------------------------------------
    // TOO MANY REQUESTS
    // --------------------------------------------------------

    if (
      error.status === 429 ||
      error.statusCode === 429 ||
      error.message?.includes("429")
    ) {

      return res.status(429).json({
        message:
          "Too many AI requests right now. Please wait a moment and try again."
      });

    }


    // --------------------------------------------------------
    // TIMEOUT
    // --------------------------------------------------------

    if (
      error.message?.toLowerCase().includes("timed out") ||
      error.message?.toLowerCase().includes("timeout")
    ) {

      return res.status(504).json({
        message:
          "The AI response took too long. Please try again."
      });

    }


    // --------------------------------------------------------
    // GENERAL GEMINI ERROR
    // --------------------------------------------------------

    return res.status(500).json({
      message:
        "Unable to get an AI response right now."
    });

  }
});


// ============================================================
// ML FOOD RECOMMENDATION ROUTE
// ============================================================

router.post("/recommend", authMiddleware, async (req, res) => {

  try {


    // --------------------------------------------------------
    // GET REQUEST DATA
    // --------------------------------------------------------

    const {
      nutrition,
      foodPreference,
      mealType,
      goal,
      allergies
    } = req.body;


    console.log("");
    console.log("========================================");
    console.log("NUTRIAI ML RECOMMENDATION REQUEST");
    console.log("========================================");

    console.log("Goal:", goal);
    console.log("Food preference:", foodPreference);
    console.log("Meal type:", mealType);
    console.log("Allergies:", allergies || "None");
    console.log("Nutrition:", nutrition);


    // --------------------------------------------------------
    // CHECK REQUIRED DATA
    // --------------------------------------------------------

    if (!nutrition) {

      return res.status(400).json({
        message: "Nutrition targets are required."
      });

    }


    const requiredNutrition = [
      "calories",
      "protein",
      "carbohydrates",
      "fat",
      "fiber",
      "sugar"
    ];


    for (const field of requiredNutrition) {

      if (
        nutrition[field] === undefined ||
        nutrition[field] === null ||
        Number.isNaN(Number(nutrition[field]))
      ) {

        return res.status(400).json({
          message:
            `Missing or invalid nutrition value: ${field}`
        });

      }

    }


    // --------------------------------------------------------
    // CHECK FOOD PREFERENCE AND MEAL TYPE
    // --------------------------------------------------------

    if (!foodPreference || !mealType) {

      return res.status(400).json({
        message:
          "Food preference and meal type are required."
      });

    }


    // --------------------------------------------------------
    // CHECK GOAL
    // --------------------------------------------------------

    if (!goal) {

      return res.status(400).json({
        message:
          "Nutrition goal is required for goal-aware ML recommendations."
      });

    }


    // --------------------------------------------------------
    // PYTHON FILE LOCATION
    // --------------------------------------------------------

    const pythonScript = path.join(
      __dirname,
      "Indian Dataset",
      "recommend_indian_food.py"
    );


    // --------------------------------------------------------
    // PYTHON COMMAND
    // --------------------------------------------------------

    const pythonCommand =
      process.platform === "win32"
        ? "python"
        : "python3";


    // --------------------------------------------------------
    // PYTHON ARGUMENTS
    // --------------------------------------------------------

    const pythonArgs = [

      pythonScript,

      String(Number(nutrition.calories)),

      String(Number(nutrition.protein)),

      String(Number(nutrition.carbohydrates)),

      String(Number(nutrition.fat)),

      String(Number(nutrition.fiber)),

      String(Number(nutrition.sugar)),

      String(foodPreference),

      String(mealType),

      String(goal),

      // Allergies are passed to Python as a
      // comma-separated string.
      String(
        Array.isArray(allergies)
          ? allergies.join(",")
          : allergies || ""
      ),

      "--json"

    ];


    // --------------------------------------------------------
    // PYTHON WORKING DIRECTORY
    // --------------------------------------------------------

    const pythonWorkingDirectory = path.join(
      __dirname,
      "Indian Dataset"
    );


    // --------------------------------------------------------
    // DEBUG INFORMATION
    // --------------------------------------------------------

    console.log("");

    console.log("Python command:");
    console.log(pythonCommand);

    console.log("Python script:");
    console.log(pythonScript);

    console.log("Python working directory:");
    console.log(pythonWorkingDirectory);

    console.log("Python arguments:");
    console.log(pythonArgs);

    console.log("========================================");
    console.log("");


    // --------------------------------------------------------
    // RUN PYTHON ML MODEL
    // --------------------------------------------------------

    const pythonProcess = spawn(
      pythonCommand,
      pythonArgs,
      {
        cwd: pythonWorkingDirectory,
        windowsHide: true
      }
    );


    let stdout = "";
    let stderr = "";
    let responseSent = false;


    // --------------------------------------------------------
    // PYTHON STANDARD OUTPUT
    // --------------------------------------------------------

    pythonProcess.stdout.on(
      "data",
      (data) => {

        const output = data.toString();

        stdout += output;

        console.log(
          "Python output:",
          output.trim()
        );

      }
    );


    // --------------------------------------------------------
    // PYTHON ERROR OUTPUT
    // --------------------------------------------------------

    pythonProcess.stderr.on(
      "data",
      (data) => {

        const errorOutput =
          data.toString();

        stderr += errorOutput;

        console.error(
          "Python stderr:",
          errorOutput.trim()
        );

      }
    );


    // --------------------------------------------------------
    // PYTHON PROCESS ERROR
    // --------------------------------------------------------

    pythonProcess.on(
      "error",
      (error) => {

        console.error("");
        console.error("PYTHON PROCESS ERROR");
        console.error(error);
        console.error("");

        if (responseSent) {
          return;
        }

        responseSent = true;

        return res.status(500).json({
          message:
            "Unable to start the ML recommendation system.",
          error:
            error.message
        });

      }
    );


    // --------------------------------------------------------
    // PYTHON PROCESS COMPLETED
    // --------------------------------------------------------

    pythonProcess.on(
      "close",
      (code) => {

        console.log("");

        console.log(
          "Python process exited with code:",
          code
        );


        if (responseSent) {
          return;
        }


        // ----------------------------------------------------
        // CHECK PYTHON ERROR
        // ----------------------------------------------------

        if (code !== 0) {

          console.error(
            "Python ML process failed."
          );

          console.error(
            "STDERR:",
            stderr
          );

          responseSent = true;

          return res.status(500).json({
            message:
              "ML recommendation failed.",
            error:
              stderr ||
              "Python process returned an error."
          });

        }


        // ----------------------------------------------------
        // FIND JSON OUTPUT
        // ----------------------------------------------------

        const outputLines = stdout
          .trim()
          .split(/\r?\n/)
          .filter(Boolean);


        if (outputLines.length === 0) {

          responseSent = true;

          return res.status(500).json({
            message:
              "ML recommendation system returned no output."
          });

        }


        // ----------------------------------------------------
        // GET FINAL JSON LINE
        // ----------------------------------------------------

        // The Python script prints logs before
        // the final JSON response.
        // Therefore we use the last line.

        const jsonLine =
          outputLines[outputLines.length - 1];


        // ----------------------------------------------------
        // PARSE ML JSON
        // ----------------------------------------------------

        try {

          const result =
            JSON.parse(jsonLine);


          console.log(
            "ML recommendation result:",
            result
          );


          responseSent = true;

          return res.json(result);


        } catch (parseError) {

          console.error(
            "Failed to parse ML JSON:"
          );

          console.error(
            jsonLine
          );

          responseSent = true;

          return res.status(500).json({
            message:
              "Invalid response from ML recommendation system.",
            rawOutput:
              stdout
          });

        }

      }
    );


  } catch (error) {

    console.error(
      "ML recommendation route error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate ML recommendations."
    });

  }

});


module.exports = router;