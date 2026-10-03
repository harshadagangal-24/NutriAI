import { useEffect, useRef, useState } from "react";
import "./App.css";
import Auth from "./Auth";
import API, { getFoodRecommendations } from "./api";
const NUTRIAI_LEAF = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjYwIj4KPHBhdGggZmlsbD0iIzVEQ0MyQyIgZD0iTTEyIDE5NkM4IDE1NiAxOCAxMTYgNDUgODJDNzkgMzkgMTM0IDE5IDIwNCAyNkMyMTMgMjcgMjE2IDM0IDIwNyAzOUMxODcgNTEgMTgxIDc1IDE3NCAxMDJDMTY0IDE0MyAxNDggMTgxIDExOSAyMDJDODkgMjIzIDU2IDIyMCAzMSAyMDhMMTkgMjUzQzE3IDI2MSA1IDI1OCA2IDI1MEwxOCAyMDZDMTUgMjAzIDEzIDIwMCAxMiAxOTZaIi8+CjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMCAxOTBDMzkgMTUzIDcyIDExNiAxMTYgODdDNzggMTA1IDQ1IDEzMiAyMSAxNjRDMTcgMTcwIDE0IDE4MCAyMCAxOTBaIi8+Cjwvc3ZnPg==";

const NutriAILogo = ({ className = "logo", style = {} }) => (
  <div
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      position: "relative",
      ...style,
    }}
    aria-label="NutriAI logo"
  >
    <span>Nutri</span>
    <span>AI</span>
    <img
      src={NUTRIAI_LEAF}
      alt=""
      aria-hidden="true"
      style={{
        width: "25px",
        height: "27px",
        objectFit: "contain",
        marginLeft: "2px",
        marginTop: "-18px",
        display: "block",
      }}
    />
  </div>
);


/* =========================================================
   GOAL-BASED DAILY NUTRITION TIP
========================================================= */

const goalBasedNutritionTips = {
  "Lose weight": [
    "Focus on balanced portions and include protein and fiber to help you stay satisfied between meals.",
    "Choose more vegetables, whole grains and protein-rich foods while keeping portions balanced.",
    "Avoid skipping meals just to reduce calories. Consistent, balanced meals can support healthier eating habits.",
    "Choose water or unsweetened drinks more often instead of sugary beverages.",
    "Build meals around vegetables and a good protein source, then add a suitable portion of carbohydrates.",
  ],
  "Gain weight": [
    "Choose nutrient-dense foods such as nuts, dairy, legumes, whole grains and healthy fats to add nourishment to meals.",
    "Try adding an extra nutritious snack between meals when you need more energy.",
    "Include protein in your meals and snacks to support healthy weight gain.",
    "Add healthy calorie sources such as nuts, seeds, paneer, yogurt or legumes to balanced meals.",
    "Choose nutrient-rich foods that provide both energy and essential nutrients.",
  ],
  "Build muscle": [
    "Include a good protein source in each main meal to support your muscle-building nutrition goals.",
    "Pair protein-rich foods with carbohydrates around active periods to support energy and recovery.",
    "Include foods such as dal, paneer, eggs, dairy, beans or other protein-rich choices according to your preference.",
    "A balanced meal with protein, carbohydrates and vegetables can support training and recovery.",
    "Remember to stay hydrated throughout the day, especially around workouts.",
  ],
  "Improve fitness": [
    "Combine protein, complex carbohydrates and vegetables to create balanced meals that support an active lifestyle.",
    "Choose whole grains, fruits and vegetables regularly to add a variety of nutrients to your meals.",
    "Stay hydrated throughout the day, especially before and after physical activity.",
    "Include a protein-rich food after activity as part of a balanced meal or snack.",
    "Consistent nutritious meals can help support your daily energy and fitness routine.",
  ],
  "Improve nutrition": [
    "Add different colors of fruits and vegetables to your meals to increase food variety.",
    "Include a mix of whole grains, legumes, vegetables, fruits and protein-rich foods throughout the day.",
    "Try to include fiber-rich foods such as vegetables, fruits, beans and whole grains regularly.",
    "Choose a variety of nutritious foods instead of depending on the same few foods every day.",
    "Make small improvements to your meals by adding vegetables, fruit, legumes or other nutrient-rich foods.",
  ],
  "Improve hydration": [
    "Drink water regularly throughout the day instead of waiting until you feel thirsty.",
    "Keep water nearby so it is easier to remember to drink throughout the day.",
    "Include water-rich foods such as fruits and vegetables as part of a balanced diet.",
    "Start your day with water and continue drinking regularly throughout the day.",
    "Remember to drink more fluids around physical activity and in hot weather.",
  ],
  "Eat healthier": [
    "Build balanced meals with vegetables, protein, whole grains and a suitable portion of healthy fats.",
    "Choose minimally processed foods more often and include a variety of fruits and vegetables.",
    "Small, consistent healthy choices can be easier to maintain than extreme dietary changes.",
    "Try adding one extra serving of vegetables or fruit to your day.",
    "Choose nutrient-rich snacks such as fruit, yogurt, nuts or roasted legumes when appropriate.",
  ],
  "Maintain weight": [
    "Keep portions balanced and include protein, vegetables and carbohydrates in your main meals.",
    "Regular meal patterns and balanced portions can help support your weight-maintenance goal.",
    "Include a variety of vegetables, fruits, whole grains and protein-rich foods in your meals.",
    "Stay active and pair your routine with balanced, nutrient-rich meals.",
    "Pay attention to portion sizes while keeping your meals varied and nutritious.",
  ],
  "Healthy lifestyle": [
    "Aim for balanced meals that include vegetables, protein, whole grains and healthy fats.",
    "Stay hydrated and include a variety of nutritious foods throughout your day.",
    "Small, consistent healthy habits can be more sustainable than making extreme changes.",
    "Try to include fruits and vegetables in different meals throughout the day.",
    "A healthy lifestyle is built through consistent eating, hydration, activity and rest habits.",
  ],
  "Overall wellness": [
    "Include a variety of whole foods such as vegetables, fruits, whole grains, legumes and protein-rich foods.",
    "Balanced meals and regular hydration can support your overall nutrition and everyday wellbeing.",
    "Try to include different food groups across your meals rather than relying on the same foods every day.",
    "Choose nutrient-rich foods regularly while keeping your meals enjoyable and balanced.",
    "Consistent healthy eating habits can support overall wellness over time.",
  ],
};

const normalizeGoals = (goal) => {
  if (Array.isArray(goal)) return goal.filter(Boolean);
  if (typeof goal === "string" && goal.trim()) return [goal];
  return [];
};

const hasGoal = (goal, selectedGoals) =>
  normalizeGoals(selectedGoals).includes(goal);

const getPrimaryGoal = (selectedGoals) =>
  normalizeGoals(selectedGoals)[0] || "Healthy lifestyle";

const getRandomGoalTip = (goal) => {
  const selectedGoals = normalizeGoals(goal);
  const selectedGoal =
    selectedGoals.find((item) => goalBasedNutritionTips[item]) ||
    "Healthy lifestyle";

  const tips =
    goalBasedNutritionTips[selectedGoal];

  const storageKey =
    `nutriai_daily_tip_${selectedGoal}`;

  let lastIndex = -1;

  try {
    const savedIndex =
      window.localStorage.getItem(storageKey);

    if (savedIndex !== null) {
      lastIndex = Number(savedIndex);
    }
  } catch (error) {
    // Continue normally if browser storage is unavailable.
  }

  let newIndex =
    Math.floor(Math.random() * tips.length);

  if (
    tips.length > 1 &&
    Number.isInteger(lastIndex) &&
    newIndex === lastIndex
  ) {
    newIndex =
      (newIndex + 1) % tips.length;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      String(newIndex)
    );
  } catch (error) {
    // Tip still works even if storage is unavailable.
  }

  return tips[newIndex];
};

function NutriAIDashboard({ initialUser = null, onLogout }) {
  /* ================= AUTHENTICATION ================= */

  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(initialUser));
  const [loggedInUser, setLoggedInUser] = useState(initialUser || null);

  /* ================= PASSWORD RESET ================= */

  const [resetToken, setResetToken] = useState(() => {
    const match = window.location.pathname.match(/^\/reset-password\/([^/]+)\/?$/);
    return match ? match[1] : null;
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingFoodPreference, setEditingFoodPreference] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ================= FEEDBACK ================= */
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    helpfulness: "",
    usefulFeatures: [],
    improvement: "",
    useAgain: "",
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* ================= PROFILE SETTINGS ================= */

  const [profileSettings, setProfileSettings] = useState(() => {
    try {
      const saved = window.localStorage.getItem("nutriai_profile_settings");
      return saved
        ? JSON.parse(saved)
        : {
            theme: "dark",
            allergies: "",
            mealsPerDay: "4",
            notifications: true,
          };
    } catch (error) {
      return {
        theme: "dark",
        allergies: "",
        mealsPerDay: "4",
        notifications: true,
      };
    }
  });

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  /* ================= USER DATA ================= */

  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    age: initialUser?.age || "",
    gender: initialUser?.gender || "",
    height: initialUser?.height || "",
    weight: initialUser?.weight || "",
    activity: initialUser?.activity || "",
    goal: normalizeGoals(initialUser?.goals || initialUser?.goal),
    foodPreference: initialUser?.foodPreference || "",
  });

  /* ================= MEAL DATA ================= */

  const [meals, setMeals] = useState([]);
  const [showMealForm, setShowMealForm] = useState(false);

  const [mealData, setMealData] = useState({
    type: "Breakfast",
    name: "",
    calories: "",
    protein: "",
  });

  /* ================= MEAL REMINDERS ================= */

  const [mealReminders, setMealReminders] = useState(() => {
    try {
      const saved = window.localStorage.getItem("nutriai_meal_reminders");
      return saved
        ? JSON.parse(saved)
        : [
            { id: 1, type: "Breakfast", time: "08:00", enabled: true },
            { id: 2, type: "Lunch", time: "13:00", enabled: true },
            { id: 3, type: "Snack", time: "17:00", enabled: false },
            { id: 4, type: "Dinner", time: "20:00", enabled: true },
          ];
    } catch (error) {
      return [
        { id: 1, type: "Breakfast", time: "08:00", enabled: true },
        { id: 2, type: "Lunch", time: "13:00", enabled: true },
        { id: 3, type: "Snack", time: "17:00", enabled: false },
        { id: 4, type: "Dinner", time: "20:00", enabled: true },
      ];
    }
  });

  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: "Breakfast",
    time: "08:00",
  });

  /* ================= WATER DATA ================= */

  const [waterGlasses, setWaterGlasses] = useState(0);

  /* ================= MEAL DETAIL ================= */

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);

  /* ================= RECOMMENDATION REFRESH ================= */

  const [recommendationOffset, setRecommendationOffset] = useState(0);
  const [mlRecommendations, setMlRecommendations] = useState([]);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState("");

  // Cache ML recommendations so returning to the dashboard is instant.
  // A Refresh request can bypass this cache and ask the ML backend for new results.
  const getMLCacheKey = (profileData) =>
    `nutriai_ml_${JSON.stringify({
      age: profileData?.age || "",
      height: profileData?.height || "",
      weight: profileData?.weight || "",
      gender: profileData?.gender || "",
      activity: profileData?.activity || "",
      goals: normalizeGoals(profileData?.goal),
      foodPreference: profileData?.foodPreference || "",
    })}`;

  const getCachedMLRecommendations = (profileData) => {
    try {
      const saved = window.localStorage.getItem(
        getMLCacheKey(profileData)
      );

      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // Cache recommendations for 30 minutes.
      if (
        !parsed?.savedAt ||
        Date.now() - parsed.savedAt > 30 * 60 * 1000
      ) {
        window.localStorage.removeItem(getMLCacheKey(profileData));
        return null;
      }

      return Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : null;
    } catch (error) {
      return null;
    }
  };

  const saveCachedMLRecommendations = (
    profileData,
    recommendations
  ) => {
    try {
      window.localStorage.setItem(
        getMLCacheKey(profileData),
        JSON.stringify({
          savedAt: Date.now(),
          recommendations,
        })
      );
    } catch (error) {
      // Continue normally if localStorage is unavailable.
    }
  };

  /* ================= AI NUTRITION CHATBOT ================= */

  const [showChatbot, setShowChatbot] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: `Hi${formData.name ? ` ${formData.name}` : ""}! I'm NutriAI 🤖🥗. I can help you with meals, protein, calories, hydration and healthier food choices.`,
    },
  ]);
  const chatEndRef = useRef(null);

  // Goal-based nutrition tip.
  // This hook is declared before any conditional return so the
  // hook order stays the same after login.
  const [dailyTip, setDailyTip] = useState(
    () => getRandomGoalTip(formData.goal)
  );

  const quickQuestions = [
    { icon: "🥗", label: "Healthy breakfast", prompt: "Suggest a healthy breakfast" },
    { icon: "💪", label: "Increase protein", prompt: "How can I increase my protein?" },
    { icon: "🍎", label: "Healthy snack", prompt: "Give me a healthy snack" },
    { icon: "💧", label: "Stay hydrated", prompt: "How can I stay hydrated?" },
    { icon: "🎯", label: "Healthy weight gain", prompt: "What healthy foods can help me gain weight?" },
    { icon: "📅", label: "Daily meal plan", prompt: "Create a simple daily meal plan for me based on my profile" },
  ];

  const moreQuestions = [
    { icon: "🍛", label: "Healthy lunch", prompt: "Suggest a healthy lunch" },
    { icon: "🌙", label: "Healthy dinner", prompt: "Suggest a healthy dinner" },
    { icon: "🔥", label: "Manage calories", prompt: "How can I manage my daily calories?" },
    { icon: "🥦", label: "Eat more nutrients", prompt: "Suggest nutrient-rich foods I can add to my diet" },
    { icon: "🏋️", label: "Build muscle", prompt: "What foods can support muscle growth?" },
    { icon: "⚡", label: "Improve fitness", prompt: "What should I eat to support my fitness?" },
  ];

  useEffect(() => {
    if (showChatbot) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading, showChatbot]);

  /* ================= PROFILE SETTINGS EFFECTS ================= */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "nutriai_profile_settings",
        JSON.stringify(profileSettings)
      );
    } catch (error) {
      // Settings still work during the current session.
    }

    document.documentElement.style.colorScheme =
      profileSettings.theme === "light" ? "light" : "dark";
  }, [profileSettings]);

  /* ================= MEAL REMINDER EFFECTS ================= */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "nutriai_meal_reminders",
        JSON.stringify(mealReminders)
      );
    } catch (error) {
      // Reminders still work during the current session if storage is unavailable.
    }
  }, [mealReminders]);

  useEffect(() => {
    const checkMealReminders = () => {
      const now = new Date();
      const currentTime =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0");

      mealReminders.forEach((reminder) => {
        if (!reminder.enabled || reminder.time !== currentTime) {
          return;
        }

        const notificationKey =
          `nutriai_reminder_${reminder.id}_${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${currentTime}`;

        try {
          if (window.localStorage.getItem(notificationKey)) {
            return;
          }

          window.localStorage.setItem(notificationKey, "1");
        } catch (error) {
          // Continue with the notification even if storage is unavailable.
        }

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`NutriAI ${reminder.type} Reminder 🍽️`, {
            body: `It's time for your ${reminder.type.toLowerCase()}!`,
          });
        }
      });
    };

    checkMealReminders();
    const interval = setInterval(checkMealReminders, 30000);

    return () => clearInterval(interval);
  }, [mealReminders]);

  // Initialize the dashboard from the user authenticated by the lightweight App wrapper.
  useEffect(() => {
    if (!initialUser) return;

    const goals = normalizeGoals(initialUser.goals || initialUser.goal);

    setLoggedInUser(initialUser);
    setFormData({
      name: initialUser.name || "",
      age: initialUser.age || "",
      gender: initialUser.gender || "",
      height: initialUser.height || "",
      weight: initialUser.weight || "",
      activity: initialUser.activity || "",
      goal: goals,
      foodPreference: initialUser.foodPreference || "",
    });

    const profileComplete = Boolean(
      initialUser.name &&
      initialUser.age &&
      initialUser.gender &&
      initialUser.height &&
      initialUser.weight &&
      initialUser.activity &&
      goals.length > 0 &&
      initialUser.foodPreference
    );

    setShowDashboard(profileComplete);
    setShowModal(!profileComplete);
    setStep(1);
  }, [initialUser]);

  // Change the tip whenever the user's nutrition goal changes.
  useEffect(() => {
    setDailyTip(getRandomGoalTip(formData.goal));
  }, [JSON.stringify(formData.goal)]);

  /* ================= FORM HANDLING ================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStepOne = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleGoalToggle = (goal) => {
    setFormData((previous) => {
      const currentGoals = normalizeGoals(previous.goal);
      const nextGoals = currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal];

      return {
        ...previous,
        goal: nextGoals,
      };
    });
  };

  const saveLocalProfile = (user) => {
    try {
      if (!user?.email) return;

      window.localStorage.setItem(
        `nutriai_user_profile_${user.email.toLowerCase()}`,
        JSON.stringify({
          name: user.name,
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activity: user.activity,
          goal: getPrimaryGoal(user.goals?.length ? user.goals : user.goal),
          goals: normalizeGoals(user.goals?.length ? user.goals : user.goal),
          foodPreference: user.foodPreference || "",
        })
      );
    } catch (error) {
      console.error("Could not save local profile:", error);
    }
  };

  const getSavedLocalProfile = (user) => {
    try {
      if (!user?.email) return null;

      const saved = window.localStorage.getItem(
        `nutriai_user_profile_${user.email.toLowerCase()}`
      );

      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  };

  const isNutritionProfileComplete = (user) => {
    if (!user) return false;

    const goals = normalizeGoals(user.goals || user.goal);

    return Boolean(
      user.name &&
      user.age &&
      user.gender &&
      user.height &&
      user.weight &&
      user.activity &&
      goals.length > 0 &&
      user.foodPreference
    );
  };

  /* =========================================================
     LOAD ML RECOMMENDATIONS
     Shared by the Get Started flow and automatic dashboard
     loading after login.
  ========================================================= */

  const loadMLRecommendations = async (profileData, forceRefresh = false) => {
    const selectedGoals = normalizeGoals(profileData?.goal);
    const age = Number(profileData?.age);
    const height = Number(profileData?.height);
    const weight = Number(profileData?.weight);

    if (!selectedGoals.length || !profileData?.foodPreference) {
      return;
    }

    let bmr = 0;

    if (age && height && weight) {
      if (profileData.gender === "Male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else if (profileData.gender === "Female") {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 78;
      }
    }

    const activityMultipliers = {
      Sedentary: 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Very Active": 1.725,
    };

    let targetCalories = Math.round(
      bmr * (activityMultipliers[profileData.activity] || 1.2)
    );

    if (hasGoal("Lose weight", selectedGoals)) targetCalories -= 300;
    if (hasGoal("Gain weight", selectedGoals)) targetCalories += 300;
    if (hasGoal("Build muscle", selectedGoals)) targetCalories += 250;
    if (hasGoal("Improve fitness", selectedGoals)) targetCalories += 100;

    targetCalories = Math.max(1200, targetCalories);

    let proteinMultiplier = 0.8;

    if (hasGoal("Build muscle", selectedGoals)) {
      proteinMultiplier = 1.6;
    } else if (hasGoal("Improve fitness", selectedGoals)) {
      proteinMultiplier = 1.3;
    } else if (
      hasGoal("Lose weight", selectedGoals) ||
      hasGoal("Gain weight", selectedGoals)
    ) {
      proteinMultiplier = 1.2;
    } else if (profileData.activity === "Very Active") {
      proteinMultiplier = 1.3;
    } else if (profileData.activity === "Moderately Active") {
      proteinMultiplier = 1.1;
    }

    const nutrition = {
      calories: targetCalories,
      protein: Math.round(weight * proteinMultiplier),
      carbohydrates: Math.round((targetCalories * 0.45) / 4),
      fat: Math.round((targetCalories * 0.25) / 9),
      fiber: 25,
      sugar: 30,
    };

    const preference = profileData.foodPreference;

    const cachedRecommendations = forceRefresh
      ? null
      : getCachedMLRecommendations(profileData);

    if (cachedRecommendations?.length) {
      setMlRecommendations(cachedRecommendations);
      setRecommendationOffset(0);
      setMlError("");
      return cachedRecommendations;
    }

    setMlLoading(true);
    setMlError("");

    try {
      const mealTypes = [
        "Breakfast",
        "Main Meal",
        "Snack",
        "Dinner",
      ];

      const goalText = selectedGoals.join(", ");

      const results = await Promise.all(
        mealTypes.map((mealType) =>
          getFoodRecommendations({
            nutrition,
            foodPreference: preference,
            mealType,
            goal: goalText,
            goals: selectedGoals,
          })
        )
      );

      const combinedRecommendations = results.flatMap(
        (result, index) =>
          (result.recommendations || []).map((food) => ({
            id: `${index}-${food.rank}-${food.food}-${Date.now()}-${Math.random()}`,
            emoji:
              mealTypes[index] === "Breakfast"
                ? "🌅"
                : mealTypes[index] === "Snack"
                ? "🍎"
                : mealTypes[index] === "Dinner"
                ? "🌙"
                : "🍛",
            type: mealTypes[index],
            name: food.food,
            calories: food.calories,
            protein: food.protein,
            description: `ML-recommended ${preference.toLowerCase()} food based on your selected nutrition goals.`,
            ingredients: [
              `Serving: ${food.serving || "as listed in the dataset"}`,
            ],
            instructions:
              "Nutrition values are taken from the Indian food dataset used by the NutriAI ML recommender.",
            carbohydrates: food.carbohydrates,
            fat: food.fat,
            fiber: food.fiber,
            sugar: food.sugar,
            mlCluster: food.mlCluster,
            recommendationScore: food.recommendationScore,
            isML: true,
          }))
      );

      if (combinedRecommendations.length === 0) {
        throw new Error("The ML model returned no food recommendations.");
      }

      setMlRecommendations(combinedRecommendations);
      saveCachedMLRecommendations(
        profileData,
        combinedRecommendations
      );
      setRecommendationOffset(0);

      console.log(
        "NutriAI ML Recommendations:",
        combinedRecommendations
      );
    } catch (error) {
      console.error("ML recommendation error:", error);

      setMlError(
        error.response?.data?.message ||
          error.message ||
          "ML recommendations could not be loaded. Please make sure the backend and Python environment are running."
      );
    } finally {
      setMlLoading(false);
    }
  };

  const handleGoalContinue = async () => {
    const selectedGoals = normalizeGoals(formData.goal);

    if (selectedGoals.length === 0) {
      setMlError("Please select at least one nutrition goal.");
      return;
    }

    if (!formData.foodPreference) {
      setMlError("Please select your food preference to continue.");
      setStep(1);
      return;
    }

    const updatedData = {
      ...formData,
      goal: selectedGoals,
    };

    try {
      const response = await API.put("/auth/profile", {
        name: updatedData.name,
        age: Number(updatedData.age),
        gender: updatedData.gender,
        height: Number(updatedData.height),
        weight: Number(updatedData.weight),
        activity: updatedData.activity,
        goal: getPrimaryGoal(selectedGoals),
        goals: selectedGoals,
        foodPreference: updatedData.foodPreference,
      });

      const savedUser = {
        ...(response.data.user || {}),
        ...updatedData,
        goal: getPrimaryGoal(selectedGoals),
        goals: selectedGoals,
        foodPreference: updatedData.foodPreference,
      };

      setLoggedInUser(savedUser);
      saveLocalProfile(savedUser);
    } catch (error) {
      console.error("Profile save error:", error);
      saveLocalProfile({
        ...updatedData,
        goal: getPrimaryGoal(selectedGoals),
        goals: selectedGoals,
        foodPreference: updatedData.foodPreference,
      });
    }

    setFormData(updatedData);
    setShowModal(false);
    setShowDashboard(true);
    setStep(1);
    setRecommendationOffset(0);
    setMlRecommendations([]);
    setMlError("");

    await loadMLRecommendations(updatedData);

    console.log("User Profile:", updatedData);
  };

  // Automatically load ML recommendations for returning users whose
  // nutrition profile is already complete.
  useEffect(() => {
    if (
      !isLoggedIn ||
      !showDashboard ||
      showModal ||
      mlLoading ||
      mlRecommendations.length > 0 ||
      !isNutritionProfileComplete(loggedInUser)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      loadMLRecommendations(formData);
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    isLoggedIn,
    showDashboard,
    showModal,
    mlRecommendations.length,
    loggedInUser?.email,
    formData.name,
    formData.age,
    formData.gender,
    formData.height,
    formData.weight,
    formData.activity,
    JSON.stringify(formData.goal),
    formData.foodPreference,
  ]);

  
  const getRecipeCacheKey = (meal) =>
    `nutriai_recipe_${String(meal?.name || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")}_${String(
      formData.foodPreference || "any"
    )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")}`;

  const getCachedRecipe = (meal) => {
    try {
      const saved = window.localStorage.getItem(
        getRecipeCacheKey(meal)
      );

      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // Recipe cache lasts for 24 hours.
      if (
        !parsed?.savedAt ||
        Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000
      ) {
        window.localStorage.removeItem(getRecipeCacheKey(meal));
        return null;
      }

      return parsed.recipe || null;
    } catch (error) {
      return null;
    }
  };

  const saveCachedRecipe = (meal, recipe) => {
    try {
      window.localStorage.setItem(
        getRecipeCacheKey(meal),
        JSON.stringify({
          savedAt: Date.now(),
          recipe,
        })
      );
    } catch (error) {
      // Continue normally if localStorage is unavailable.
    }
  };

  const handleMealClick = async (meal) => {
    // Local meals already contain ingredients and preparation steps.
    if (!meal.isML) {
      setSelectedMeal(meal);
      return;
    }

    // The ML recommender provides nutrition data. Gemini supplies
    // the actual ingredients and preparation steps for the selected dish.
    const cachedRecipe = getCachedRecipe(meal);

    if (cachedRecipe) {
      setSelectedMeal({
        ...meal,
        ...cachedRecipe,
      });
      return;
    }

    setSelectedMeal({
      ...meal,
      ingredients: [],
      instructions: "",
      preparationSteps: [],
    });
    setRecipeLoading(true);

    try {
      const response = await API.post("/ai/chat", {
        message: `You are NutriAI's recipe assistant. Create a simple, practical recipe for the Indian dish "${meal.name}".

Food preference: ${formData.foodPreference || "not specified"}
Serving: ${meal.ingredients?.[0] || "as listed in the dataset"}

Return ONLY this format:
INGREDIENTS:
- ingredient 1
- ingredient 2
- ingredient 3

PREPARATION:
1. Step one.
2. Step two.
3. Step three.

Keep it concise and suitable for a home cook. Do not include nutrition values, medical advice, or extra sections.`,
        profile: {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          activity: formData.activity,
          goal: getPrimaryGoal(formData.goal),
          goals: normalizeGoals(formData.goal),
          foodPreference: formData.foodPreference,
        },
      });

      const recipeText = response.data.reply || "";
      const parts = recipeText.split(/PREPARATION\s*:?/i);
      const ingredientText = (parts[0] || "")
        .replace(/INGREDIENTS\s*:?/i, "")
        .trim();
      const preparationText = (parts[1] || "").trim();

      const ingredients = ingredientText
        .split(/\r?\n/)
        .map((line) =>
          line
            .replace(/^\s*[-•*]\s*/, "")
            .replace(/^\s*\d+[.)]\s*/, "")
            .trim()
        )
        .filter(Boolean);

      // Gemini may return all preparation steps in one paragraph.
      // Split numbered steps so the UI can display them cleanly.
      const preparationSteps = preparationText
        .replace(/\r/g, "")
        .split(/(?=\d+[.)]\s+)/)
        .map((step) => step.replace(/^\s*\d+[.)]\s*/, "").trim())
        .filter(Boolean);

      const cleanPreparationSteps =
        preparationSteps.length > 0
          ? preparationSteps
          : preparationText
              .split(/\n+/)
              .map((step) => step.trim())
              .filter(Boolean);

      const recipeData = {
        ingredients:
          ingredients.length > 0
            ? ingredients
            : ["Ingredients could not be loaded right now."],
        preparationSteps: cleanPreparationSteps,
        instructions:
          preparationText ||
          recipeText ||
          "Recipe preparation could not be generated. Please try again.",
      };

      saveCachedRecipe(meal, recipeData);

      setSelectedMeal((previous) => ({
        ...previous,
        ...recipeData,
      }));
    } catch (error) {
      console.error("Recipe generation error:", error);
      setSelectedMeal((previous) => ({
        ...previous,
        ingredients: ["Ingredients could not be loaded right now."],
        preparationSteps: [
          "NutriAI could not generate this recipe right now. Please try again in a few seconds.",
        ],
        instructions:
          "NutriAI could not generate this recipe right now. Please try again in a few seconds.",
      }));
    } finally {
      setRecipeLoading(false);
    }
  };


  const openModal = () => {
    setShowModal(true);
    setShowDashboard(false);
    setStep(1);
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(1);
  };

  const goHome = () => {
    setShowDashboard(false);
    setShowProfile(false);
    setEditingProfile(false);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    setShowDashboard(false);
    setShowProfile(false);
    setEditingProfile(false);
    setEditingPersonalInfo(false);
    setEditingFoodPreference(false);
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const openProfile = () => {
    setShowProfile(true);
    setEditingProfile(false);
    setShowChangePassword(false);
  };

  const closeProfile = () => {
    setShowProfile(false);
    setEditingProfile(false);
    setShowChangePassword(false);
  };

  const handleProfileSave = async () => {
    try {
      const response = await API.put("/auth/profile", {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        activity: formData.activity,
        goal: getPrimaryGoal(formData.goal),
        goals: normalizeGoals(formData.goal),
        foodPreference: formData.foodPreference,
      });

      const updatedUser = {
        ...response.data.user,
        goals: normalizeGoals(
          response.data.user?.goals ||
          response.data.user?.goal ||
          formData.goal
        ),
        goal: getPrimaryGoal(
          response.data.user?.goals ||
          response.data.user?.goal ||
          formData.goal
        ),
        foodPreference:
          response.data.user?.foodPreference ||
          formData.foodPreference ||
          "",
      };

      setLoggedInUser(updatedUser);
      saveLocalProfile(updatedUser);

      setFormData({
        name: updatedUser.name,
        age: updatedUser.age,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        activity: updatedUser.activity,
        goal: normalizeGoals(updatedUser.goals || updatedUser.goal),
        foodPreference: updatedUser.foodPreference || "",
      });

      setEditingProfile(false);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to update profile. Please try again."
      );
    }
  };

  const handlePersonalInfoSave = async () => {
    try {
      const response = await API.put("/auth/profile", {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        activity: formData.activity,
        goal: getPrimaryGoal(formData.goal),
        goals: normalizeGoals(formData.goal),
        foodPreference: formData.foodPreference,
      });

      const updatedUser = {
        ...response.data.user,
        goals: normalizeGoals(
          response.data.user?.goals ||
          response.data.user?.goal ||
          formData.goal
        ),
        goal: getPrimaryGoal(
          response.data.user?.goals ||
          response.data.user?.goal ||
          formData.goal
        ),
        foodPreference:
          response.data.user?.foodPreference ||
          formData.foodPreference ||
          "",
      };

      setLoggedInUser(updatedUser);
      saveLocalProfile(updatedUser);

      setFormData((previous) => ({
        ...previous,
        name: updatedUser.name,
        age: updatedUser.age,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        activity: updatedUser.activity,
        goal: normalizeGoals(updatedUser.goals || updatedUser.goal),
        foodPreference: updatedUser.foodPreference || "",
      }));
      setEditingPersonalInfo(false);
      alert("Personal information updated successfully!");
    } catch (error) {
      console.error("Personal information update error:", error);
      alert(error.response?.data?.message || "Failed to update personal information. Please try again.");
    }
  };

  const handleFoodPreferenceSave = async () => {
    try {
      const response = await API.put("/auth/profile", {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        activity: formData.activity,
        goal: getPrimaryGoal(formData.goal),
        goals: normalizeGoals(formData.goal),
        foodPreference: formData.foodPreference,
      });

      const updatedUser = {
        ...response.data.user,
        goals: normalizeGoals(
          response.data.user?.goals ||
          response.data.user?.goal ||
          formData.goal
        ),
        goal: getPrimaryGoal(
          response.data.user?.goals ||
          response.data.user?.goal ||
          formData.goal
        ),
        foodPreference:
          response.data.user?.foodPreference ||
          formData.foodPreference ||
          "",
      };

      setLoggedInUser(updatedUser);
      saveLocalProfile(updatedUser);

      setFormData((previous) => ({
        ...previous,
        goal: normalizeGoals(updatedUser.goals || updatedUser.goal),
        foodPreference: updatedUser.foodPreference,
      }));
      setEditingFoodPreference(false);
      alert("Food preference updated successfully!");
    } catch (error) {
      console.error("Food preference update error:", error);
      alert(error.response?.data?.message || "Failed to update food preference. Please try again.");
    }
  };

  const handleFeedbackFeatureToggle = (feature) => {
    setFeedbackData((previous) => ({
      ...previous,
      usefulFeatures: previous.usefulFeatures.includes(feature)
        ? previous.usefulFeatures.filter((item) => item !== feature)
        : [...previous.usefulFeatures, feature],
    }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackData.rating || !feedbackData.helpfulness || !feedbackData.useAgain) {
      alert("Please complete the required feedback fields.");
      return;
    }

    try {
      setFeedbackSubmitting(true);

      const response = await API.post("/feedback", feedbackData);

      alert(response.data.message || "Thank you for your feedback!");
      setFeedbackData({
        rating: 0,
        helpfulness: "",
        usefulFeatures: [],
        improvement: "",
        useAgain: "",
      });
      setShowFeedback(false);
    } catch (error) {
      console.error("Feedback submission error:", error);
      alert(
        error.response?.data?.message ||
        "Failed to submit feedback. Please try again."
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfileSetting = (key, value) => {
    setProfileSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      updateProfileSetting("notifications", true);
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      updateProfileSetting("notifications", true);
      alert("Meal reminder notifications are enabled.");
    } else {
      updateProfileSetting("notifications", false);
      alert("Notifications were not enabled. You can allow them in your browser settings.");
    }
  };

  const clearLocalNutritionData = () => {
    const confirmed = window.confirm(
      "Clear your local meal history, water progress and saved recommendations?"
    );

    if (!confirmed) return;

    setMeals([]);
    setWaterGlasses(0);
    setMlRecommendations([]);
    setRecommendationOffset(0);

    try {
      window.localStorage.removeItem("nutriai_meal_history");
      window.localStorage.removeItem("nutriai_water_glasses");
    } catch (error) {
      // Continue even if local storage is unavailable.
    }

    alert("Local nutrition data cleared.");
  };

  const clearSavedRecommendations = () => {
    setMlRecommendations([]);
    setRecommendationOffset(0);
    alert("Saved recommendations cleared.");
  };

  const handleEmailSave = () => {
    const email = newEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    /*
      The current backend has profile/password endpoints but no
      change-email endpoint. Keep the UI ready without pretending
      that the account email was changed in MongoDB.
    */
    alert(
      "Your new email was entered, but changing the login email requires a backend email-update endpoint. Your current login email remains unchanged."
    );
    setEditingEmail(false);
    setNewEmail("");
  };

  const sendChatMessage = async (e, suggestedMessage = null) => {
    e?.preventDefault();

    const message = (suggestedMessage || chatInput).trim();

    if (!message || chatLoading) {
      return;
    }

    const userMessage = {
      role: "user",
      text: message,
    };

    const updatedMessages = [...chatMessages, userMessage];

    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const conversation = updatedMessages
        .slice(-10)
        .map((item) =>
          `${item.role === "user" ? "User" : "NutriAI"}: ${item.text}`
        )
        .join("\n");

      const nutritionInstruction = `You are NutriAI, a friendly nutrition-focused AI assistant. Answer nutrition and healthy-eating questions in simple, practical language. Use the user profile and calculated targets when relevant. Prefer balanced food suggestions and explain your reasoning briefly. Do not diagnose medical conditions or present medical advice as a certainty. If a question is unrelated to nutrition, politely redirect it to nutrition, food, hydration, fitness-supportive eating, or the user's NutriAI profile. Keep answers concise and easy to read. User profile: name=${formData.name || "not provided"}, age=${formData.age || "not provided"}, gender=${formData.gender || "not provided"}, height=${formData.height || "not provided"} cm, weight=${formData.weight || "not provided"} kg, activity=${formData.activity || "not provided"}, goals=${normalizeGoals(formData.goal).join(", ") || "not provided"}, daily calorie estimate=${dailyCalories}, protein target=${proteinTarget} g, water target=${waterTarget} glasses, BMI=${bmi}, BMI category=${bmiCategory}.`;

      const response = await API.post("/ai/chat", {
        message: `${nutritionInstruction}\n\nConversation:\n${conversation}`,
        profile: {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          activity: formData.activity,
          goal: getPrimaryGoal(formData.goal),
          goals: normalizeGoals(formData.goal),
          dailyCalories,
          proteinTarget,
          waterTarget,
          bmi,
          bmiCategory,
        },
      });

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            response.data.reply ||
            "I couldn't generate a response right now. Please try again.",
        },
      ]);
    } catch (error) {
      console.error("AI chatbot error:", error);

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            error.response?.data?.message ||
            "Sorry, I couldn't connect to NutriAI right now. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        role: "assistant",
        text: `Hi${formData.name ? ` ${formData.name}` : ""}! I'm NutriAI 🤖🥗. What would you like help with today?`,
      },
    ]);
  };

  // =========================================================
  // CHATBOT RESPONSE FORMATTER
  // Keeps the AI response readable without changing
  // the chatbot/backend logic.
  // =========================================================

  const formatChatInline = (text) => {
    const parts = String(text || "")
      .replace(/\*\*([^*]+)\*\*/g, "|BOLD:$1|BOLD|")
      .split(/(\|BOLD:.*?\|BOLD\|)/g);

    return parts.map((part, index) => {
      if (part.startsWith("|BOLD:") && part.endsWith("|BOLD|")) {
        return (
          <strong
            key={index}
            style={{
              color: "#9af5a6",
              fontWeight: 700,
            }}
          >
            {part.slice(6, -6)}
          </strong>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const renderChatResponse = (text) => {
    const lines = String(text || "")
      .replace(/\r/g, "")
      .split("\n");

    const visibleLines = lines.filter((line) => line.trim() !== "");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
        }}
      >
        {visibleLines.map((rawLine, index) => {
          const line = rawLine.trim();

          // Markdown headings
          if (/^#{1,3}\s+/.test(line)) {
            return (
              <div
                key={index}
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#9af5a6",
                  marginTop: index === 0 ? 0 : "6px",
                  marginBottom: "2px",
                }}
              >
                {formatChatInline(line.replace(/^#{1,3}\s+/, ""))}
              </div>
            );
          }

          // Bullet-point recommendations become individual cards.
          if (/^[-*•]\s+/.test(line)) {
            const content = line.replace(/^[-*•]\s+/, "");

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px",
                  padding: "10px 11px",
                  borderRadius: "11px",
                  background: "rgba(124,241,143,0.045)",
                  border: "1px solid rgba(124,241,143,0.10)",
                  color: "#dce6df",
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    minWidth: "22px",
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(124,241,143,0.10)",
                    color: "#7cf18f",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </span>
                <span>{formatChatInline(content)}</span>
              </div>
            );
          }

          // Numbered instructions become separate step blocks.
          if (/^\d+[.)]\s+/.test(line)) {
            const match = line.match(/^(\d+)[.)]\s+(.*)$/);

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "9px 10px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#dce6df",
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    minWidth: "24px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(124,241,143,0.10)",
                    color: "#8df39b",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {match[1]}
                </span>
                <span>{formatChatInline(match[2])}</span>
              </div>
            );
          }

          // A standalone bold line works as a section heading.
          if (/^\*\*.*\*\*:?$/.test(line)) {
            return (
              <div
                key={index}
                style={{
                  color: "#9af5a6",
                  fontSize: "14px",
                  fontWeight: 800,
                  marginTop: index === 0 ? 0 : "5px",
                }}
              >
                {formatChatInline(line.replace(/:$/, ""))}
              </div>
            );
          }

          // Normal paragraph/intro text.
          return (
            <div
              key={index}
              style={{
                color: "#dce6df",
                lineHeight: 1.65,
              }}
            >
              {formatChatInline(line)}
            </div>
          );
        })}
      </div>
    );
  };

  /* =========================================================
     RESET PASSWORD PAGE
  ========================================================= */

  if (resetToken) {
    const handleResetPassword = async (e) => {
      e.preventDefault();

      setResetPasswordMessage("");
      setResetPasswordError("");

      if (
        !resetPasswordData.newPassword ||
        !resetPasswordData.confirmPassword
      ) {
        setResetPasswordError("Please fill both password fields.");
        return;
      }

      if (resetPasswordData.newPassword.length < 6) {
        setResetPasswordError(
          "New password must be at least 6 characters."
        );
        return;
      }

      if (
        resetPasswordData.newPassword !==
        resetPasswordData.confirmPassword
      ) {
        setResetPasswordError(
          "New password and confirm password do not match."
        );
        return;
      }

      try {
        const response = await API.post(
          "/auth/reset-password",
          {
            token: resetToken,
            newPassword: resetPasswordData.newPassword,
          }
        );

        setResetPasswordMessage(
          response.data.message ||
          "Password reset successfully! You can now login."
        );

        setResetPasswordData({
          newPassword: "",
          confirmPassword: "",
        });

        // Remove the reset token from the URL and return to login.
        window.history.replaceState({}, "", "/");

        setTimeout(() => {
          setResetToken(null);
          setResetPasswordMessage("");
        }, 1500);
      } catch (error) {
        console.error("Reset password error:", error);

        setResetPasswordError(
          error.response?.data?.message ||
          "Failed to reset password. The link may be invalid or expired."
        );
      }
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000000",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            background: "#0a0a0a",
            border: "1px solid #222222",
            borderRadius: "18px",
            padding: "35px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
            <NutriAILogo />
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              textAlign: "center",
              fontSize: "28px",
            }}
          >
            Reset Password
          </h2>

          <p
            style={{
              color: "#888888",
              textAlign: "center",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0 0 25px",
            }}
          >
            Create a new password for your NutriAI account.
          </p>

          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  color: "#888888",
                  fontSize: "13px",
                  marginBottom: "7px",
                }}
              >
                New Password
              </label>

              <input
                type="password"
                value={resetPasswordData.newPassword}
                onChange={(e) =>
                  setResetPasswordData({
                    ...resetPasswordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#111111",
                  color: "#ffffff",
                  border: "1px solid #333333",
                  borderRadius: "10px",
                  padding: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#888888",
                  fontSize: "13px",
                  marginBottom: "7px",
                }}
              >
                Confirm New Password
              </label>

              <input
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) =>
                  setResetPasswordData({
                    ...resetPasswordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#111111",
                  color: "#ffffff",
                  border: "1px solid #333333",
                  borderRadius: "10px",
                  padding: "13px",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                background: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "10px",
                padding: "13px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              Reset Password
            </button>
          </form>

          {resetPasswordMessage && (
            <p
              style={{
                color: "#7ee787",
                textAlign: "center",
                fontSize: "14px",
                marginTop: "18px",
                lineHeight: "1.5",
              }}
            >
              {resetPasswordMessage}
            </p>
          )}

          {resetPasswordError && (
            <p
              style={{
                color: "#ff6b6b",
                textAlign: "center",
                fontSize: "14px",
                marginTop: "18px",
                lineHeight: "1.5",
              }}
            >
              {resetPasswordError}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================
     AUTHENTICATION GATE
  ========================================================= */

  if (!isLoggedIn) {
    return (
      <Auth
          onLogin={(user) => {
          const savedProfile = getSavedLocalProfile(user);

          // Prefer values returned by the backend. Use local storage only
          // for the newer nutrition fields when an older backend response
          // does not contain them yet.
          const backendGoals = normalizeGoals(user.goals || user.goal);
          const savedGoals = normalizeGoals(
            savedProfile?.goals || savedProfile?.goal
          );

          const mergedUser = {
            ...user,
            ...(savedProfile || {}),
            ...user,
            goals: backendGoals.length > 0 ? backendGoals : savedGoals,
            goal:
              user.goal ||
              savedProfile?.goal ||
              getPrimaryGoal(backendGoals || savedGoals),
            foodPreference:
              user.foodPreference ||
              savedProfile?.foodPreference ||
              "",
          };

          setLoggedInUser(mergedUser);

          setFormData({
            name: mergedUser.name || "",
            age: mergedUser.age || "",
            gender: mergedUser.gender || "",
            height: mergedUser.height || "",
            weight: mergedUser.weight || "",
            activity: mergedUser.activity || "",
            goal: normalizeGoals(mergedUser.goals || mergedUser.goal),
            foodPreference: mergedUser.foodPreference || "",
          });

          setIsLoggedIn(true);

          // If the nutrition profile was already completed, skip the
          // Get Started form and open the dashboard immediately.
          if (isNutritionProfileComplete(mergedUser)) {
            setShowModal(false);
            setShowDashboard(true);
            setStep(1);
          } else {
            setShowDashboard(false);
            setShowModal(true);
            setStep(1);
          }
        }}
      />
    );
  }

  /* =========================================================
     PERSONALIZED NUTRITION CALCULATIONS
  ========================================================= */

  const calculateBMR = () => {
    const age = Number(formData.age);
    const height = Number(formData.height);
    const weight = Number(formData.weight);

    if (!age || !height || !weight) {
      return 0;
    }

    let bmr;

    if (formData.gender === "Male") {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age +
        5;
    } else if (formData.gender === "Female") {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age -
        161;
    } else {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age -
        78;
    }

    return bmr;
  };

  const calculateCalories = () => {
    const bmr = calculateBMR();

    if (!bmr) {
      return 0;
    }

    let activityMultiplier = 1.2;

    switch (formData.activity) {
      case "Sedentary":
        activityMultiplier = 1.2;
        break;

      case "Lightly Active":
        activityMultiplier = 1.375;
        break;

      case "Moderately Active":
        activityMultiplier = 1.55;
        break;

      case "Very Active":
        activityMultiplier = 1.725;
        break;

      default:
        activityMultiplier = 1.2;
    }

    let calories = bmr * activityMultiplier;

    if (hasGoal("Lose weight", formData.goal)) {
      calories -= 300;
    }

    if (hasGoal("Gain weight", formData.goal)) {
      calories += 300;
    }

    if (hasGoal("Build muscle", formData.goal)) {
      calories += 250;
    }

    if (hasGoal("Improve fitness", formData.goal)) {
      calories += 100;
    }

    return Math.max(1200, Math.round(calories));
  };

  const calculateBMI = () => {
    const height = Number(formData.height);
    const weight = Number(formData.weight);

    if (!height || !weight) {
      return 0;
    }

    const heightInMeters = height / 100;

    const bmi =
      weight /
      (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = Number(calculateBMI());

    if (!bmi) {
      return "Not available";
    }

    if (bmi < 18.5) {
      return "Underweight";
    }

    if (bmi < 25) {
      return "Healthy range";
    }

    if (bmi < 30) {
      return "Overweight";
    }

    return "Obesity range";
  };

  const dailyCalories = calculateCalories();
  const bmi = calculateBMI();
  const bmiCategory = getBMICategory();

  /* =========================================================
     PERSONALIZED PROTEIN TARGET
  ========================================================= */

  const calculateProteinTarget = () => {
    const weight = Number(formData.weight);

    if (!weight) {
      return 0;
    }

    let multiplier = 0.8;

    if (hasGoal("Build muscle", formData.goal)) {
      multiplier = 1.6;
    } else if (
      hasGoal("Lose weight", formData.goal)
    ) {
      multiplier = 1.2;
    } else if (
      hasGoal("Gain weight", formData.goal)
    ) {
      multiplier = 1.2;
    } else if (
      hasGoal("Improve fitness", formData.goal)
    ) {
      multiplier = 1.3;
    } else if (
      formData.activity === "Very Active"
    ) {
      multiplier = 1.3;
    } else if (
      formData.activity === "Moderately Active"
    ) {
      multiplier = 1.1;
    }

    return Math.round(weight * multiplier);
  };

  const proteinTarget = calculateProteinTarget();

  /* =========================================================
     PERSONALIZED WATER TARGET
  ========================================================= */

  const calculateWaterTarget = () => {
    const weight = Number(formData.weight);

    if (!weight) {
      return 8;
    }

    let glasses = Math.round(
      (weight * 35) / 250
    );

    if (
      formData.activity === "Very Active"
    ) {
      glasses += 2;
    }

    if (
      formData.activity ===
      "Moderately Active"
    ) {
      glasses += 1;
    }

    return Math.min(12, Math.max(6, glasses));
  };

  const waterTarget = calculateWaterTarget();

  /* =========================================================
     MEAL REMINDER FUNCTIONS
  ========================================================= */

  const requestReminderPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser notifications are not supported in this browser.");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Please allow browser notifications to receive meal reminders.");
      return false;
    }

    return true;
  };

  const addMealReminder = async (e) => {
    e.preventDefault();

    const allowed = await requestReminderPermission();

    if (!allowed) {
      return;
    }

    setMealReminders((previous) => [
      ...previous,
      {
        id: Date.now(),
        type: newReminder.type,
        time: newReminder.time,
        enabled: true,
      },
    ]);

    setNewReminder({
      type: "Breakfast",
      time: "08:00",
    });

    setShowReminderForm(false);
  };

  const toggleMealReminder = async (id) => {
    const reminder = mealReminders.find((item) => item.id === id);

    if (reminder && !reminder.enabled) {
      const allowed = await requestReminderPermission();

      if (!allowed) {
        return;
      }
    }

    setMealReminders((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, enabled: !item.enabled }
          : item
      )
    );
  };

  const deleteMealReminder = (id) => {
    setMealReminders((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const formatReminderTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* =========================================================
     MEAL TRACKER FUNCTIONS
  ========================================================= */

  const handleMealChange = (e) => {
    setMealData({
      ...mealData,
      [e.target.name]: e.target.value,
    });
  };

  const addMeal = (e) => {
    e.preventDefault();

    if (!mealData.name || !mealData.calories) {
      return;
    }

    const newMeal = {
      id: Date.now(),
      type: mealData.type,
      name: mealData.name,
      calories: Number(mealData.calories),
      protein: Number(mealData.protein) || 0,
    };

    setMeals([
      ...meals,
      newMeal,
    ]);

    setMealData({
      type: "Breakfast",
      name: "",
      calories: "",
      protein: "",
    });

    setShowMealForm(false);
  };

  const deleteMeal = (id) => {
    setMeals(
      meals.filter((meal) => meal.id !== id)
    );
  };

  const totalMealCalories = meals.reduce(
    (total, meal) =>
      total + Number(meal.calories),
    0
  );

  const totalProtein = meals.reduce(
    (total, meal) =>
      total + Number(meal.protein),
    0
  );

  const caloriePercentage =
    dailyCalories > 0
      ? Math.min(
          100,
          Math.round(
            (totalMealCalories / dailyCalories) *
              100
          )
        )
      : 0;

  const proteinPercentage =
    proteinTarget > 0
      ? Math.min(
          100,
          Math.round(
            (totalProtein / proteinTarget) *
              100
          )
        )
      : 0;

  const waterPercentage =
    waterTarget > 0
      ? Math.min(
          100,
          Math.round(
            (waterGlasses / waterTarget) *
              100
          )
        )
      : 0;

  // Today's meal tracking summary
  const trackedMealTypes = new Set(
    meals.map((meal) => meal.type)
  );

  const mealsCompleted = Math.min(
    4,
    trackedMealTypes.size
  );

  // Overall nutrition score based on today's tracked meals,
  // protein, hydration, and meal completion.
  const mealCompletionScore =
    Math.round((mealsCompleted / 4) * 100);

  const nutritionScore = Math.round(
    (
      mealCompletionScore +
      caloriePercentage +
      proteinPercentage +
      waterPercentage
    ) / 4
  );

  /* =========================================================
     WATER FUNCTIONS
  ========================================================= */

  const addWater = () => {
    if (waterGlasses < waterTarget) {
      setWaterGlasses(
        waterGlasses + 1
      );
    }
  };

  const removeWater = () => {
    if (waterGlasses > 0) {
      setWaterGlasses(
        waterGlasses - 1
      );
    }
  };

  /* =========================================================
     PERSONALIZED MEAL DATABASE
  ========================================================= */

  const mealSuggestions = {
    "Lose weight": [
      {
        id: 1,
        emoji: "🥣",
        type: "Breakfast",
        name: "Greek Yogurt & Berry Bowl",
        calories: 280,
        protein: 18,
        description:
          "A light, protein-rich breakfast with berries and yogurt.",
        ingredients: [
          "1 cup Greek yogurt",
          "½ cup mixed berries",
          "1 tablespoon chia seeds",
          "1 teaspoon honey",
        ],
        instructions:
          "Add Greek yogurt to a bowl. Top with berries and chia seeds. Drizzle with a small amount of honey and serve chilled.",
      },
      {
        id: 2,
        emoji: "🥗",
        type: "Lunch",
        name: "Grilled Chicken Salad",
        calories: 390,
        protein: 38,
        description:
          "A filling high-protein salad with fresh vegetables.",
        ingredients: [
          "100g grilled chicken breast",
          "2 cups lettuce",
          "½ cucumber",
          "1 tomato",
          "1 teaspoon olive oil",
          "Lemon juice",
        ],
        instructions:
          "Grill the chicken and slice it. Combine vegetables in a bowl, add chicken, drizzle with olive oil and lemon juice, then serve.",
      },
      {
        id: 3,
        emoji: "🍲",
        type: "Dinner",
        name: "Vegetable Lentil Soup",
        calories: 320,
        protein: 17,
        description:
          "A fiber-rich and satisfying meal made with lentils and vegetables.",
        ingredients: [
          "½ cup cooked lentils",
          "1 carrot",
          "½ tomato",
          "½ onion",
          "Spinach",
          "Vegetable stock",
        ],
        instructions:
          "Sauté onion and carrot. Add tomato, lentils and vegetable stock. Simmer until vegetables are tender. Add spinach near the end.",
      },
      {
        id: 31,
        emoji: "🍎",
        type: "Snack",
        name: "Apple & Greek Yogurt",
        calories: 210,
        protein: 15,
        description:
          "A simple protein-rich snack with fresh fruit.",
        ingredients: [
          "1 apple",
          "¾ cup Greek yogurt",
          "Cinnamon",
        ],
        instructions:
          "Slice the apple and serve with Greek yogurt. Sprinkle with cinnamon.",
      },
    ],

    "Gain weight": [
      {
        id: 4,
        emoji: "🥜",
        type: "Breakfast",
        name: "Peanut Butter Banana Oats",
        calories: 520,
        protein: 18,
        description:
          "A calorie-dense breakfast with healthy fats and carbohydrates.",
        ingredients: [
          "½ cup oats",
          "1 banana",
          "2 tablespoons peanut butter",
          "1 cup milk",
          "1 teaspoon honey",
        ],
        instructions:
          "Cook oats with milk. Slice the banana and place it on top. Add peanut butter and honey before serving.",
      },
      {
        id: 5,
        emoji: "🍛",
        type: "Lunch",
        name: "Paneer Rice Bowl",
        calories: 620,
        protein: 25,
        description:
          "A balanced high-energy meal with paneer and rice.",
        ingredients: [
          "100g paneer",
          "1 cup cooked rice",
          "Mixed vegetables",
          "1 teaspoon olive oil",
          "Indian spices",
        ],
        instructions:
          "Cook paneer with vegetables and spices. Serve over cooked rice and drizzle with a small amount of olive oil.",
      },
      {
        id: 6,
        emoji: "🥑",
        type: "Dinner",
        name: "Avocado Egg Toast",
        calories: 480,
        protein: 20,
        description:
          "A nutrient-dense meal combining healthy fats and protein.",
        ingredients: [
          "2 slices whole-grain bread",
          "1 avocado",
          "2 eggs",
          "Black pepper",
          "Lemon juice",
        ],
        instructions:
          "Toast the bread. Mash avocado with lemon juice and spread it over the toast. Top with cooked eggs and black pepper.",
      },
      {
        id: 32,
        emoji: "🥛",
        type: "Snack",
        name: "Banana Peanut Smoothie",
        calories: 380,
        protein: 14,
        description:
          "A calorie-rich smoothie combining fruit, milk and healthy fats.",
        ingredients: [
          "1 banana",
          "1 cup milk",
          "1 tablespoon peanut butter",
          "1 teaspoon honey",
          "Ice",
        ],
        instructions:
          "Blend all ingredients until smooth and creamy. Serve immediately.",
      },
    ],

    "Build muscle": [
      {
        id: 7,
        emoji: "🍳",
        type: "Breakfast",
        name: "Protein Egg Breakfast",
        calories: 430,
        protein: 32,
        description:
          "A protein-focused breakfast to support muscle recovery.",
        ingredients: [
          "3 eggs",
          "2 slices whole-grain toast",
          "Spinach",
          "1 tomato",
          "Black pepper",
        ],
        instructions:
          "Scramble eggs with spinach and tomato. Season with pepper and serve with whole-grain toast.",
      },
      {
        id: 8,
        emoji: "🍗",
        type: "Lunch",
        name: "Chicken & Sweet Potato",
        calories: 520,
        protein: 42,
        description:
          "A high-protein meal with complex carbohydrates.",
        ingredients: [
          "120g chicken breast",
          "1 medium sweet potato",
          "Broccoli",
          "1 teaspoon olive oil",
          "Herbs",
        ],
        instructions:
          "Season and grill the chicken. Roast or steam the sweet potato and broccoli. Serve together with herbs and olive oil.",
      },
      {
        id: 9,
        emoji: "🥛",
        type: "Snack",
        name: "Banana Protein Smoothie",
        calories: 410,
        protein: 30,
        description:
          "A convenient protein-rich smoothie for post-workout nutrition.",
        ingredients: [
          "1 banana",
          "1 cup milk",
          "1 scoop protein powder",
          "1 tablespoon peanut butter",
          "Ice",
        ],
        instructions:
          "Add all ingredients to a blender. Blend until smooth and creamy. Serve immediately.",
      },
      {
        id: 33,
        emoji: "🍚",
        type: "Dinner",
        name: "Paneer & Rice Power Bowl",
        calories: 560,
        protein: 30,
        description:
          "A balanced dinner with protein, carbohydrates and vegetables.",
        ingredients: [
          "120g paneer",
          "¾ cup cooked rice",
          "Broccoli",
          "Capsicum",
          "Indian spices",
        ],
        instructions:
          "Cook paneer and vegetables with spices. Serve with cooked rice.",
      },
    ],

    "Improve fitness": [
      {
        id: 10,
        emoji: "🥑",
        type: "Breakfast",
        name: "Avocado Veggie Toast",
        calories: 350,
        protein: 12,
        description:
          "A balanced meal with healthy fats and fiber.",
        ingredients: [
          "2 slices whole-grain bread",
          "½ avocado",
          "Tomato",
          "Cucumber",
          "Lemon juice",
        ],
        instructions:
          "Toast the bread. Mash avocado and spread over toast. Add sliced tomato and cucumber, then finish with lemon juice.",
      },
      {
        id: 11,
        emoji: "🥗",
        type: "Lunch",
        name: "Quinoa Power Salad",
        calories: 420,
        protein: 18,
        description:
          "A balanced combination of quinoa, vegetables and protein.",
        ingredients: [
          "1 cup cooked quinoa",
          "Chickpeas",
          "Cucumber",
          "Tomato",
          "Spinach",
          "Lemon dressing",
        ],
        instructions:
          "Combine cooked quinoa with chickpeas and vegetables. Add lemon dressing and mix well.",
      },
      {
        id: 12,
        emoji: "🍓",
        type: "Snack",
        name: "Fruit & Yogurt Bowl",
        calories: 300,
        protein: 16,
        description:
          "A refreshing snack packed with fruit and protein.",
        ingredients: [
          "1 cup Greek yogurt",
          "Mixed berries",
          "Banana",
          "Chia seeds",
        ],
        instructions:
          "Place yogurt in a bowl. Add chopped fruit and sprinkle with chia seeds.",
      },
      {
        id: 34,
        emoji: "🍲",
        type: "Dinner",
        name: "Vegetable Dal & Rice",
        calories: 430,
        protein: 20,
        description:
          "A balanced Indian-inspired dinner with lentils and vegetables.",
        ingredients: [
          "½ cup cooked dal",
          "½ cup cooked rice",
          "Mixed vegetables",
          "Spinach",
          "Indian spices",
        ],
        instructions:
          "Cook vegetables with spices and combine with cooked dal. Serve with rice.",
      },
    ],

    "Eat healthier": [
      {
        id: 13,
        emoji: "🥣",
        type: "Breakfast",
        name: "Oats & Fresh Fruits",
        calories: 330,
        protein: 12,
        description:
          "A fiber-rich breakfast made with oats and fresh fruit.",
        ingredients: [
          "½ cup oats",
          "1 cup milk",
          "½ banana",
          "Mixed berries",
          "Chia seeds",
        ],
        instructions:
          "Cook oats with milk. Add sliced banana, berries and chia seeds before serving.",
      },
      {
        id: 14,
        emoji: "🥗",
        type: "Lunch",
        name: "Colorful Veggie Bowl",
        calories: 380,
        protein: 16,
        description:
          "A colorful combination of vegetables and plant-based protein.",
        ingredients: [
          "Chickpeas",
          "Carrot",
          "Cucumber",
          "Tomato",
          "Spinach",
          "Lemon dressing",
        ],
        instructions:
          "Chop vegetables and combine with chickpeas. Add lemon dressing and toss well.",
      },
      {
        id: 15,
        emoji: "🍲",
        type: "Dinner",
        name: "Vegetable Dal Bowl",
        calories: 420,
        protein: 20,
        description:
          "A wholesome Indian-inspired meal with lentils and vegetables.",
        ingredients: [
          "½ cup cooked dal",
          "Mixed vegetables",
          "½ cup cooked rice",
          "Coriander",
          "Indian spices",
        ],
        instructions:
          "Cook vegetables with spices. Add cooked dal and simmer. Serve with a moderate portion of rice.",
      },
      {
        id: 35,
        emoji: "🍌",
        type: "Snack",
        name: "Fruit & Nut Snack",
        calories: 240,
        protein: 7,
        description:
          "A simple whole-food snack with fruit and healthy fats.",
        ingredients: [
          "1 banana",
          "Small handful of almonds",
        ],
        instructions:
          "Slice the banana and serve with almonds.",
      },
    ],

    "Maintain weight": [
      {
        id: 16,
        emoji: "🍛",
        type: "Lunch",
        name: "Balanced Rice Bowl",
        calories: 450,
        protein: 22,
        description:
          "A balanced meal combining carbohydrates, protein and vegetables.",
        ingredients: [
          "½ cup cooked rice",
          "100g grilled paneer or chicken",
          "Mixed vegetables",
          "Lemon juice",
        ],
        instructions:
          "Prepare the protein and vegetables. Serve together with cooked rice and lemon juice.",
      },
      {
        id: 17,
        emoji: "🥗",
        type: "Dinner",
        name: "Mediterranean Salad",
        calories: 390,
        protein: 18,
        description:
          "A balanced salad with vegetables, chickpeas and healthy fats.",
        ingredients: [
          "Chickpeas",
          "Cucumber",
          "Tomato",
          "Lettuce",
          "Feta or paneer",
          "Olive oil",
        ],
        instructions:
          "Combine all vegetables and chickpeas. Add feta or paneer and drizzle with olive oil.",
      },
      {
        id: 18,
        emoji: "🍳",
        type: "Breakfast",
        name: "Veggie Egg Wrap",
        calories: 410,
        protein: 24,
        description:
          "A convenient balanced meal with eggs and vegetables.",
        ingredients: [
          "2 eggs",
          "1 whole-grain wrap",
          "Spinach",
          "Tomato",
          "Onion",
        ],
        instructions:
          "Cook eggs with vegetables. Place the mixture inside a whole-grain wrap and roll tightly.",
      },
      {
        id: 36,
        emoji: "🍎",
        type: "Snack",
        name: "Apple Yogurt Snack",
        calories: 220,
        protein: 14,
        description:
          "A balanced snack combining fruit and protein.",
        ingredients: [
          "1 apple",
          "¾ cup Greek yogurt",
          "Cinnamon",
        ],
        instructions:
          "Slice the apple and serve alongside Greek yogurt with cinnamon.",
      },
    ],

    "Improve hydration": [
      {
        id: 19,
        emoji: "🍉",
        type: "Snack",
        name: "Watermelon Mint Bowl",
        calories: 120,
        protein: 2,
        description:
          "A refreshing, water-rich snack for hot days.",
        ingredients: [
          "2 cups watermelon",
          "Fresh mint",
          "Lime juice",
        ],
        instructions:
          "Cut watermelon into cubes. Add fresh mint and a little lime juice. Serve chilled.",
      },
      {
        id: 20,
        emoji: "🥒",
        type: "Breakfast",
        name: "Cucumber Yogurt Bowl",
        calories: 180,
        protein: 10,
        description:
          "A refreshing yogurt-based snack with hydrating cucumber.",
        ingredients: [
          "1 cup yogurt",
          "½ cucumber",
          "Mint",
          "Cumin",
        ],
        instructions:
          "Dice cucumber and mix with yogurt. Add mint and a pinch of cumin before serving.",
      },
      {
        id: 21,
        emoji: "🍓",
        type: "Snack",
        name: "Berry Hydration Smoothie",
        calories: 220,
        protein: 8,
        description:
          "A refreshing smoothie containing fruit and fluids.",
        ingredients: [
          "Mixed berries",
          "1 cup yogurt",
          "½ cup water",
          "Ice",
        ],
        instructions:
          "Blend all ingredients until smooth. Add more water if needed and serve immediately.",
      },
      {
        id: 37,
        emoji: "🥥",
        type: "Lunch",
        name: "Hydrating Coconut Rice Bowl",
        calories: 360,
        protein: 9,
        description:
          "A light meal paired with water-rich vegetables.",
        ingredients: [
          "½ cup cooked rice",
          "Cucumber",
          "Tomato",
          "Coconut",
          "Mint",
        ],
        instructions:
          "Combine cooked rice with chopped vegetables, coconut and mint. Serve fresh.",
      },
    ],

    "Improve nutrition": [
      {
        id: 22,
        emoji: "🥗",
        type: "Lunch",
        name: "Nutrient Power Salad",
        calories: 410,
        protein: 20,
        description:
          "A nutrient-dense salad packed with vegetables and protein.",
        ingredients: [
          "Spinach",
          "Chickpeas",
          "Carrot",
          "Tomato",
          "Cucumber",
          "Paneer",
        ],
        instructions:
          "Combine chopped vegetables and chickpeas. Add paneer and toss with a light lemon dressing.",
      },
      {
        id: 23,
        emoji: "🥣",
        type: "Breakfast",
        name: "Nut & Fruit Oatmeal",
        calories: 430,
        protein: 14,
        description:
          "A nutrient-rich breakfast with whole grains, fruit and nuts.",
        ingredients: [
          "½ cup oats",
          "Milk",
          "Banana",
          "Almonds",
          "Chia seeds",
        ],
        instructions:
          "Cook oats with milk. Add banana, almonds and chia seeds before serving.",
      },
      {
        id: 24,
        emoji: "🍲",
        type: "Dinner",
        name: "Mixed Vegetable Dal",
        calories: 400,
        protein: 21,
        description:
          "A wholesome lentil dish packed with vegetables.",
        ingredients: [
          "½ cup lentils",
          "Carrot",
          "Spinach",
          "Tomato",
          "Onion",
          "Indian spices",
        ],
        instructions:
          "Cook lentils until soft. Add sautéed vegetables and spices. Simmer together until well combined.",
      },
      {
        id: 38,
        emoji: "🍊",
        type: "Snack",
        name: "Fruit & Seed Bowl",
        calories: 230,
        protein: 8,
        description:
          "A colorful snack providing fruit, seeds and essential nutrients.",
        ingredients: [
          "Orange",
          "Apple",
          "Pumpkin seeds",
          "Chia seeds",
        ],
        instructions:
          "Chop the fruit and sprinkle with seeds before serving.",
      },
    ],

    "Healthy lifestyle": [
      {
        id: 25,
        emoji: "🥣",
        type: "Breakfast",
        name: "Healthy Breakfast Bowl",
        calories: 360,
        protein: 15,
        description:
          "A simple balanced breakfast to support everyday wellness.",
        ingredients: [
          "Greek yogurt",
          "Oats",
          "Banana",
          "Berries",
          "Chia seeds",
        ],
        instructions:
          "Combine yogurt and oats. Add sliced banana, berries and chia seeds.",
      },
      {
        id: 26,
        emoji: "🥗",
        type: "Lunch",
        name: "Everyday Green Salad",
        calories: 350,
        protein: 18,
        description:
          "A fresh vegetable salad with a healthy protein source.",
        ingredients: [
          "Lettuce",
          "Cucumber",
          "Tomato",
          "Chickpeas",
          "Paneer",
          "Lemon dressing",
        ],
        instructions:
          "Chop vegetables and combine with chickpeas and paneer. Add lemon dressing and toss.",
      },
      {
        id: 27,
        emoji: "🍛",
        type: "Dinner",
        name: "Balanced Indian Bowl",
        calories: 460,
        protein: 22,
        description:
          "A balanced combination of rice, dal and vegetables.",
        ingredients: [
          "½ cup rice",
          "½ cup dal",
          "Mixed vegetables",
          "Curd",
          "Coriander",
        ],
        instructions:
          "Prepare rice, dal and vegetables separately. Serve together with a small portion of curd.",
      },
      {
        id: 39,
        emoji: "🍓",
        type: "Snack",
        name: "Fresh Fruit Yogurt",
        calories: 260,
        protein: 15,
        description:
          "A simple snack that combines fruit with protein-rich yogurt.",
        ingredients: [
          "Greek yogurt",
          "Banana",
          "Berries",
          "Chia seeds",
        ],
        instructions:
          "Add fruit to Greek yogurt and finish with chia seeds.",
      },
    ],

    "Overall wellness": [
      {
        id: 28,
        emoji: "🥑",
        type: "Breakfast",
        name: "Wellness Avocado Toast",
        calories: 360,
        protein: 13,
        description:
          "A nutrient-balanced meal with whole grains and healthy fats.",
        ingredients: [
          "2 slices whole-grain bread",
          "½ avocado",
          "Tomato",
          "Chia seeds",
          "Lemon juice",
        ],
        instructions:
          "Toast bread and spread mashed avocado on top. Add tomato, chia seeds and lemon juice.",
      },
      {
        id: 29,
        emoji: "🍲",
        type: "Lunch",
        name: "Wholesome Lentil Bowl",
        calories: 430,
        protein: 22,
        description:
          "A comforting bowl combining lentils, vegetables and grains.",
        ingredients: [
          "½ cup cooked lentils",
          "½ cup brown rice",
          "Mixed vegetables",
          "Spinach",
          "Herbs",
        ],
        instructions:
          "Cook vegetables and spinach. Combine with lentils and brown rice. Add herbs and serve warm.",
      },
      {
        id: 30,
        emoji: "🍓",
        type: "Snack",
        name: "Fruit Yogurt Parfait",
        calories: 300,
        protein: 17,
        description:
          "A refreshing snack combining yogurt, fruit and seeds.",
        ingredients: [
          "Greek yogurt",
          "Mixed berries",
          "Banana",
          "Chia seeds",
          "Small amount of honey",
        ],
        instructions:
          "Layer yogurt, fruit and chia seeds in a glass. Add a small amount of honey and serve chilled.",
      },
      {
        id: 40,
        emoji: "🍛",
        type: "Dinner",
        name: "Balanced Veggie Rice Bowl",
        calories: 440,
        protein: 20,
        description:
          "A wholesome dinner combining grains, vegetables and protein.",
        ingredients: [
          "½ cup cooked rice",
          "Chickpeas",
          "Mixed vegetables",
          "Spinach",
          "Lemon dressing",
        ],
        instructions:
          "Combine cooked rice with chickpeas and vegetables. Add spinach and lemon dressing.",
      },
    ],
  };

  /* =========================================================
     GET PERSONALIZED MEALS
  ========================================================= */

  const getPersonalizedMeals = () => {
    let suggestions =
      mealSuggestions[getPrimaryGoal(formData.goal)] ||
      mealSuggestions["Overall wellness"];

    /*
      Deeper personalization:
      - Build muscle → prioritize higher protein meals
      - Lose weight → prioritize lighter meals
      - Very active → prioritize higher calorie/protein meals
      - Underweight → prioritize higher calorie meals
      - Overweight → prioritize moderate calorie meals
    */

    if (
      hasGoal("Build muscle", formData.goal) ||
      formData.activity === "Very Active"
    ) {
      suggestions = [...suggestions].sort(
        (a, b) =>
          b.protein - a.protein
      );
    } else if (
      hasGoal("Lose weight", formData.goal) ||
      bmiCategory === "Overweight" ||
      bmiCategory === "Obesity range"
    ) {
      suggestions = [...suggestions].sort(
        (a, b) =>
          a.calories - b.calories
      );
    } else if (
      bmiCategory === "Underweight" ||
      hasGoal("Gain weight", formData.goal)
    ) {
      suggestions = [...suggestions].sort(
        (a, b) =>
          b.calories - a.calories
      );
    }

    return suggestions;
  };

  const personalizedMeals =
    getPersonalizedMeals();

  /* =========================================================
     ML RECOMMENDATION DISPLAY
     Always show exactly one recommendation for each meal type:
     Breakfast, Main Meal, Snack and Dinner.
  ========================================================= */

  const mealTypeOrder = [
    "Breakfast",
    "Main Meal",
    "Snack",
    "Dinner",
  ];

  // Give each goal its own starting position in the ML results.
  // This keeps recommendations varied even when two goals have
  // very similar top-ranked foods.
  const goalRecommendationOffsets = {
    "Eat healthier": 0,
    "Lose weight": 1,
    "Gain weight": 2,
    "Build muscle": 3,
    "Improve fitness": 4,
    "Maintain weight": 5,
    "Improve hydration": 6,
    "Improve nutrition": 7,
    "Healthy lifestyle": 8,
    "Overall wellness": 9,
  };

  const goalRecommendationOffset =
    goalRecommendationOffsets[getPrimaryGoal(formData.goal)] ?? 0;

  const recommendationSource =
    mlRecommendations.length > 0
      ? mlRecommendations
      : personalizedMeals;

  const getRecommendationsForType = (type) => {
    let matches = recommendationSource.filter(
      (meal) => meal.type === type
    );

    // The old local fallback database uses "Lunch".
    // Display it as "Main Meal" when ML results are unavailable.
    if (type === "Main Meal" && matches.length === 0) {
      matches = recommendationSource.filter(
        (meal) => meal.type === "Lunch"
      );
    }

    return matches;
  };

  const recommendationCounts = mealTypeOrder.map(
    (type) => getRecommendationsForType(type).length
  );

  const maxRecommendationCount = Math.max(
    1,
    ...recommendationCounts
  );

  // Pick a different food whenever possible. This prevents the same
  // dish from appearing for Lunch and Dinner even if the ML model
  // returns the same food in both result sets.
  const normalizeMealName = (name) =>
    String(name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const pickUniqueMeal = (matches, preferredIndex, usedNames) => {
    if (!matches.length) {
      return null;
    }

    const startIndex =
      ((preferredIndex % matches.length) + matches.length) %
      matches.length;

    for (let step = 0; step < matches.length; step++) {
      const candidate =
        matches[(startIndex + step) % matches.length];

      const name = normalizeMealName(candidate.name);

      if (!usedNames.has(name)) {
        usedNames.add(name);
        return candidate;
      }
    }

    // If every result is the same food, return the preferred result
    // rather than leaving the meal slot empty.
    const fallback = matches[startIndex];
    usedNames.add(normalizeMealName(fallback.name));
    return fallback;
  };

  const displayedMealNames = new Set();

  const displayedMeals = mealTypeOrder
    .map((type) => {
      const matches = getRecommendationsForType(type);

      if (matches.length === 0) {
        return null;
      }

      // Start one position after the Daily Plan choice and then move
      // forward until a different food is found.
      const meal = pickUniqueMeal(
        matches,
        goalRecommendationOffset + recommendationOffset + 1,
        displayedMealNames
      );

      if (!meal) {
        return null;
      }

      // Keep the UI label as "Main Meal" even when the fallback
      // database supplied a "Lunch" item.
      if (type === "Main Meal" && meal.type === "Lunch") {
        return {
          ...meal,
          type: "Main Meal",
        };
      }

      return meal;
    })
    .filter(Boolean);

  /* =========================================================
     REFRESH RECOMMENDATIONS
     Move to the next ML recommendation for all four meal types.
  ========================================================= */

  const refreshRecommendations = async () => {
    if (mlLoading) {
      return;
    }

    if (mlRecommendations.length > 0 && maxRecommendationCount > 1) {
      setRecommendationOffset(
        (previous) =>
          (previous + 1) % maxRecommendationCount
      );
      return;
    }

    if (isNutritionProfileComplete(loggedInUser)) {
      await loadMLRecommendations(formData, true);
    }
  };

  /* =========================================================
     PERSONALIZED DAILY MEAL PLAN
  ========================================================= */

  /* =========================================================
     NUTRITION ANALYTICS
  ========================================================= */

  const caloriesRemaining = Math.max(
    0,
    dailyCalories - totalMealCalories
  );

  const proteinRemaining = Math.max(
    0,
    proteinTarget - totalProtein
  );

  const waterRemaining = Math.max(
    0,
    waterTarget - waterGlasses
  );

  const overallProgress = Math.round(
    (caloriePercentage + proteinPercentage + waterPercentage) / 3
  );

  /*
     DAILY MEAL PLAN
     Prefer the ML recommendations whenever they are available.
     If ML recommendations are not available, use the existing
     personalized meal database as a fallback.
  */

  const dailyPlanUsedNames = new Set();

  const getMealByType = (type) => {
    // ML uses "Main Meal", while the UI calls it "Lunch".
    const mlType = type === "Lunch" ? "Main Meal" : type;

    // Prefer ML recommendations and use the refresh offset
    // so the Daily Meal Plan changes when Refresh is clicked.
    if (mlRecommendations.length > 0) {
      const mlMatches = mlRecommendations.filter(
        (meal) => meal.type === mlType
      );

      if (mlMatches.length > 0) {
        return pickUniqueMeal(
          mlMatches,
          goalRecommendationOffset + recommendationOffset,
          dailyPlanUsedNames
        );
      }
    }

    // Fallback to the existing personalized meal database.
    let matchingMeals = personalizedMeals.filter(
      (meal) => meal.type === type
    );

    // The old local database uses "Lunch".
    if (type === "Lunch" && matchingMeals.length === 0) {
      matchingMeals = personalizedMeals.filter(
        (meal) => meal.type === "Main Meal"
      );
    }

    if (matchingMeals.length > 0) {
      return pickUniqueMeal(
        matchingMeals,
        goalRecommendationOffset + recommendationOffset,
        dailyPlanUsedNames
      );
    }

    return personalizedMeals[0];
  };

  const dailyMealPlan = [
    {
      label: "Breakfast",
      icon: "🌅",
      meal: getMealByType("Breakfast"),
    },
    {
      label: "Lunch",
      icon: "☀️",
      meal: getMealByType("Lunch"),
    },
    {
      label: "Snack",
      icon: "🌇",
      meal: getMealByType("Snack"),
    },
    {
      label: "Dinner",
      icon: "🌙",
      meal: getMealByType("Dinner"),
    },
  ];

  const plannedCalories = dailyMealPlan.reduce(
    (total, item) =>
      total +
      (item.meal
        ? Number(item.meal.calories)
        : 0),
    0
  );

  const plannedProtein = dailyMealPlan.reduce(
    (total, item) =>
      total +
      (item.meal
        ? Number(item.meal.protein)
        : 0),
    0
  );

  /* =========================================================
     PERSONALIZED INSIGHT
  ========================================================= */

  const getPersonalizedInsight = () => {
    if (
      hasGoal("Build muscle", formData.goal)
    ) {
      return `Your plan emphasizes protein-rich meals because your goal is to support muscle development. Aim to spread your protein intake across your main meals.`;
    }

    if (
      hasGoal("Lose weight", formData.goal)
    ) {
      return `Your recommendations focus on filling, protein- and fiber-rich foods while keeping meals relatively calorie-conscious.`;
    }

    if (
      hasGoal("Gain weight", formData.goal)
    ) {
      return `Your plan prioritizes nutrient-dense foods with additional calories, healthy fats and protein to support gradual weight gain.`;
    }

    if (
      hasGoal("Improve hydration", formData.goal)
    ) {
      return `Hydrating foods have been prioritized in your recommendations. Keep sipping water throughout the day rather than waiting until you feel thirsty.`;
    }

    if (
      hasGoal("Improve fitness", formData.goal)
    ) {
      return `Your recommendations combine balanced carbohydrates, protein and vegetables to support everyday activity and recovery.`;
    }

    if (
      hasGoal("Improve nutrition", formData.goal)
    ) {
      return `Your plan focuses on variety by combining whole grains, vegetables, fruits, legumes and protein-rich foods.`;
    }

    if (
      hasGoal("Healthy lifestyle", formData.goal)
    ) {
      return `Your recommendations focus on balanced meals and sustainable everyday habits rather than extreme dietary changes.`;
    }

    if (
      hasGoal("Maintain weight", formData.goal)
    ) {
      return `Your meal plan focuses on balanced portions of carbohydrates, protein, vegetables and healthy fats to support weight maintenance.`;
    }

    if (
      bmiCategory === "Underweight"
    ) {
      return `Your profile suggests focusing on nutrient-dense meals that provide enough energy and protein throughout the day.`;
    }

    if (
      bmiCategory === "Overweight" ||
      bmiCategory === "Obesity range"
    ) {
      return `Your recommendations emphasize balanced portions, vegetables, protein and fiber to support healthier everyday eating patterns.`;
    }

    return `Your recommendations combine balanced meals, hydration and sustainable habits based on the information you provided.`;
  };

  const personalizedInsight =
    getPersonalizedInsight();

  /* =========================================================
     PROFILE & SETTINGS
  ========================================================= */

  if (showProfile) {
    const settingsCard = {
      background: "#0a0f0c",
      border: "1px solid rgba(130,255,165,0.12)",
      borderRadius: "18px",
      padding: "26px",
      marginBottom: "20px",
    };

    const settingRow = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "18px",
      padding: "16px",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "13px",
      marginTop: "12px",
    };

    const settingButton = {
      background: "rgba(114,237,145,0.10)",
      color: "#72ed91",
      border: "1px solid rgba(114,237,145,0.18)",
      borderRadius: "9px",
      padding: "9px 14px",
      cursor: "pointer",
      fontWeight: "600",
      whiteSpace: "nowrap",
    };

    const inputStyle = {
      width: "100%",
      boxSizing: "border-box",
      background: "#111812",
      color: "#ffffff",
      border: "1px solid #2a3a2e",
      borderRadius: "10px",
      padding: "12px 13px",
      outline: "none",
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            profileSettings.theme === "light"
              ? "#f3f7f4"
              : "linear-gradient(135deg,#06110b,#091b11,#07140d)",
          color: profileSettings.theme === "light" ? "#17221b" : "#ffffff",
          padding: "0",
          fontFamily: "inherit",
        }}
      >
        <nav
          style={{
            height: "76px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8%",
            borderBottom:
              profileSettings.theme === "light"
                ? "1px solid #d9e3dc"
                : "1px solid #222222",
            background:
              profileSettings.theme === "light"
                ? "rgba(255,255,255,0.90)"
                : "rgba(0,0,0,0.55)",
            backdropFilter: "blur(16px)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <NutriAILogo />

          <button
            onClick={closeProfile}
            style={{
              background: "transparent",
              color: profileSettings.theme === "light" ? "#17221b" : "#ffffff",
              border:
                profileSettings.theme === "light"
                  ? "1px solid #cbd8cf"
                  : "1px solid #333333",
              borderRadius: "10px",
              padding: "10px 18px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Dashboard
          </button>
        </nav>

        <main
          style={{
            maxWidth: "980px",
            margin: "0 auto",
            padding: "55px 24px 80px",
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <p
              style={{
                margin: "0 0 8px",
                color: "#72ed91",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Account
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                lineHeight: 1.1,
              }}
            >
              Profile & Settings
            </h1>
            <p
              style={{
                marginTop: "12px",
                color: profileSettings.theme === "light" ? "#68756d" : "#999999",
                fontSize: "15px",
              }}
            >
              Manage your profile, preferences, reminders and account security.
            </p>
          </div>

          {/* NUTRITION PROFILE */}
          <section id="nutrition-profile-section" style={settingsCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "22px" }}>🥗 Nutrition Profile</h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: profileSettings.theme === "light" ? "#68756d" : "#777777",
                    fontSize: "14px",
                  }}
                >
                  Your saved nutrition preferences
                </p>
              </div>

              {!editingProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfile(true);
                    setTimeout(() => {
                      document
                        .getElementById("nutrition-profile-section")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 0);
                  }}
                  style={settingButton}
                >
                  Edit Nutrition Profile
                </button>
              ) : null}
            </div>

            {!editingProfile ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap: "14px",
                }}
              >
                {[
                  ["⚖️ Weight", formData.weight ? `${formData.weight} kg` : "Not provided"],
                  ["🥗 Food Preference", formData.foodPreference || "Not provided"],
                  ["🎯 Nutrition Goals", normalizeGoals(formData.goal).length > 0 ? normalizeGoals(formData.goal).join(", ") : "Not provided"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: profileSettings.theme === "light" ? "#f7faf8" : "#111812",
                      border: profileSettings.theme === "light" ? "1px solid #d9e3dc" : "1px solid #1f2b23",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        color: profileSettings.theme === "light" ? "#68756d" : "#7f8b84",
                        fontSize: "12px",
                        marginBottom: "7px",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        color: profileSettings.theme === "light" ? "#17221b" : "#f4f8f4",
                        fontSize: "16px",
                        fontWeight: "700",
                        lineHeight: 1.45,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      color: profileSettings.theme === "light" ? "#68756d" : "#888888",
                      fontSize: "13px",
                      marginBottom: "7px",
                    }}
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    min="1"
                    value={formData.weight ?? ""}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      color: profileSettings.theme === "light" ? "#68756d" : "#888888",
                      fontSize: "13px",
                      marginBottom: "7px",
                    }}
                  >
                    Food Preference
                  </label>
                  <select
                    name="foodPreference"
                    value={formData.foodPreference || ""}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="">Select food preference</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      color: profileSettings.theme === "light" ? "#68756d" : "#888888",
                      fontSize: "13px",
                      marginBottom: "9px",
                    }}
                  >
                    Nutrition Goals
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                      gap: "9px",
                    }}
                  >
                    {[
                      ["Eat healthier", "🥗"],
                      ["Lose weight", "⚖️"],
                      ["Gain weight", "📈"],
                      ["Build muscle", "💪"],
                      ["Improve fitness", "🔥"],
                      ["Maintain weight", "🧘"],
                      ["Improve hydration", "💧"],
                      ["Improve nutrition", "🥦"],
                      ["Healthy lifestyle", "❤️"],
                      ["Overall wellness", "✨"],
                    ].map(([goal, icon]) => {
                      const selected = hasGoal(goal, formData.goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => handleGoalToggle(goal)}
                          style={{
                            padding: "11px 12px",
                            borderRadius: "10px",
                            border: selected ? "1px solid #72ed91" : (profileSettings.theme === "light" ? "1px solid #d9e3dc" : "1px solid #2a382f"),
                            background: selected ? "rgba(114,237,145,0.10)" : (profileSettings.theme === "light" ? "#ffffff" : "#111812"),
                            color: selected ? "#72ed91" : (profileSettings.theme === "light" ? "#17221b" : "#dbe5df"),
                            cursor: "pointer",
                            fontWeight: selected ? "700" : "500",
                            textAlign: "left",
                          }}
                        >
                          {icon} {goal}
                          {selected ? " ✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "2px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProfile(false);
                      setFormData({
                        name: loggedInUser?.name || "",
                        age: loggedInUser?.age || "",
                        gender: loggedInUser?.gender || "",
                        height: loggedInUser?.height || "",
                        weight: loggedInUser?.weight || "",
                        activity: loggedInUser?.activity || "",
                        goal: normalizeGoals(loggedInUser?.goals || loggedInUser?.goal),
                        foodPreference: loggedInUser?.foodPreference || "",
                      });
                    }}
                    style={{
                      background: "transparent",
                      color: profileSettings.theme === "light" ? "#17221b" : "#ffffff",
                      border: profileSettings.theme === "light" ? "1px solid #cbd8cf" : "1px solid #333333",
                      borderRadius: "10px",
                      padding: "11px 18px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleProfileSave}
                    style={{
                      background: "#72ed91",
                      color: "#07140d",
                      border: "none",
                      borderRadius: "10px",
                      padding: "11px 18px",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    Save Nutrition Profile
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* PERSONAL INFORMATION */}
          <section style={settingsCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "22px" }}>👤 Personal Information</h2>
                <p style={{ margin: "6px 0 0", color: profileSettings.theme === "light" ? "#68756d" : "#777777", fontSize: "14px" }}>
                  Your NutriAI profile details
                </p>
              </div>
              {!editingPersonalInfo ? (
                <button type="button" onClick={() => setEditingPersonalInfo(true)} style={settingButton}>
                  Edit Personal Information
                </button>
              ) : null}
            </div>

            {!editingPersonalInfo ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "15px" }}>
                {[
                  ["Full Name", formData.name],
                  ["Age", formData.age],
                  ["Gender", formData.gender],
                  ["Height (cm)", formData.height],
                  ["Activity Level", formData.activity],
                ].map(([label, value]) => (
                  <div key={label}>
                    <label style={{ display: "block", color: profileSettings.theme === "light" ? "#68756d" : "#888888", fontSize: "13px", marginBottom: "7px" }}>{label}</label>
                    <div style={{ background: profileSettings.theme === "light" ? "#ffffff" : "#111812", border: profileSettings.theme === "light" ? "1px solid #d9e3dc" : "1px solid #1f2b23", borderRadius: "10px", padding: "12px 13px" }}>
                      {value || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "15px" }}>
                  {[
                    ["Full Name", "name", "text"],
                    ["Age", "age", "number"],
                    ["Gender", "gender", "text"],
                    ["Height (cm)", "height", "number"],
                    ["Activity Level", "activity", "text"],
                  ].map(([label, key, type]) => (
                    <div key={key}>
                      <label style={{ display: "block", color: profileSettings.theme === "light" ? "#68756d" : "#888888", fontSize: "13px", marginBottom: "7px" }}>{label}</label>
                      <input type={type} name={key} value={formData[key] ?? ""} onChange={handleChange} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                  <button type="button" onClick={() => {
                    setEditingPersonalInfo(false);
                    setFormData((previous) => ({ ...previous, name: loggedInUser?.name || "", age: loggedInUser?.age || "", gender: loggedInUser?.gender || "", height: loggedInUser?.height || "", activity: loggedInUser?.activity || "" }));
                  }} style={settingButton}>Cancel</button>
                  <button type="button" onClick={handlePersonalInfoSave} style={{ ...settingButton, background: "#72ed91", color: "#07140d" }}>Save Personal Information</button>
                </div>
              </>
            )}
          </section>

          {/* PERSONALIZATION */}
          <section style={settingsCard}>
            <h2 style={{ margin: 0, fontSize: "22px" }}>🥗 Nutrition Preferences</h2>
            <p style={{ margin: "6px 0 18px", color: profileSettings.theme === "light" ? "#68756d" : "#777777", fontSize: "14px" }}>
              These preferences are used to personalize your NutriAI experience.
            </p>

            <div style={settingRow}>
              <div style={{ flex: 1 }}>
                <strong>Food preference</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>
                  Current: {formData.foodPreference || "Not set"}
                </div>
                {editingFoodPreference && (
                  <select name="foodPreference" value={formData.foodPreference || ""} onChange={handleChange} style={{ ...inputStyle, marginTop: "10px" }}>
                    <option value="">Select food preference</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                )}
              </div>
              {!editingFoodPreference ? (
                <button type="button" onClick={() => setEditingFoodPreference(true)} style={settingButton}>Edit</button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => { setEditingFoodPreference(false); setFormData((previous) => ({ ...previous, foodPreference: loggedInUser?.foodPreference || "" })); }} style={settingButton}>Cancel</button>
                  <button type="button" onClick={handleFoodPreferenceSave} style={{ ...settingButton, background: "#72ed91", color: "#07140d" }}>Save</button>
                </div>
              )}
            </div>

            <div style={settingRow}>
              <div style={{ flex: 1 }}>
                <strong>Allergies / foods to avoid</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>Add foods you want NutriAI to avoid.</div>
                <input value={profileSettings.allergies} onChange={(e) => updateProfileSetting("allergies", e.target.value)} placeholder="e.g. peanuts, dairy" style={{ ...inputStyle, marginTop: "10px" }} />
              </div>
            </div>

            <div style={settingRow}>
              <div style={{ flex: 1 }}>
                <strong>Meals per day</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>Used when planning your daily meals.</div>
              </div>
              <select value={profileSettings.mealsPerDay} onChange={(e) => updateProfileSetting("mealsPerDay", e.target.value)} style={{ ...inputStyle, width: "120px" }}>
                <option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option>
              </select>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section style={settingsCard}>
            <h2 style={{ margin: 0, fontSize: "22px" }}>🔔 Notifications</h2>
            <p
              style={{
                margin: "6px 0 18px",
                color: profileSettings.theme === "light" ? "#68756d" : "#777777",
                fontSize: "14px",
              }}
            >
              Control your meal reminder notifications.
            </p>

            <div style={settingRow}>
              <div>
                <strong>Meal reminder notifications</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>
                  {profileSettings.notifications ? "Enabled" : "Disabled"}
                </div>
              </div>
              <button
                onClick={
                  profileSettings.notifications
                    ? () => updateProfileSetting("notifications", false)
                    : requestNotificationPermission
                }
                style={{
                  ...settingButton,
                  background: profileSettings.notifications
                    ? "#72ed91"
                    : "rgba(114,237,145,0.08)",
                  color: profileSettings.notifications ? "#07140d" : "#72ed91",
                }}
              >
                {profileSettings.notifications ? "ON" : "OFF"}
              </button>
            </div>

            <div style={{ marginTop: "18px" }}>
              {mealReminders.map((reminder) => (
                <div key={reminder.id} style={settingRow}>
                  <div>
                    <strong>
                      {reminder.type === "Breakfast" ? "🌅" :
                       reminder.type === "Lunch" ? "☀️" :
                       reminder.type === "Snack" ? "🌇" : "🌙"}{" "}
                      {reminder.type}
                    </strong>
                    <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>
                      Reminder at {reminder.time}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleMealReminder(reminder.id)}
                    style={{
                      ...settingButton,
                      background: reminder.enabled
                        ? "#72ed91"
                        : "rgba(114,237,145,0.08)",
                      color: reminder.enabled ? "#07140d" : "#72ed91",
                    }}
                  >
                    {reminder.enabled ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SECURITY */}
          <section style={settingsCard}>
            <h2 style={{ margin: 0, fontSize: "22px" }}>🔐 Account & Security</h2>
            <p
              style={{
                margin: "6px 0 18px",
                color: profileSettings.theme === "light" ? "#68756d" : "#777777",
                fontSize: "14px",
              }}
            >
              Manage your login and account security.
            </p>

            <div style={settingRow}>
              <div>
                <strong>Email address</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>
                  {loggedInUser?.email || "Not available"}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingEmail(!editingEmail);
                  setNewEmail("");
                }}
                style={settingButton}
              >
                Change Email
              </button>
            </div>

            {editingEmail && (
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New email address"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={handleEmailSave} style={settingButton}>
                  Continue
                </button>
              </div>
            )}

            <div style={settingRow}>
              <div>
                <strong>Password</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>
                  Change your account password.
                </div>
              </div>

              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                style={settingButton}
              >
                {showChangePassword ? "Close" : "Change Password"}
              </button>
            </div>

            {showChangePassword && (
              <div style={{ marginTop: "14px", display: "grid", gap: "12px" }}>
                {[
                  ["Current Password", "currentPassword"],
                  ["New Password", "newPassword"],
                  ["Confirm New Password", "confirmPassword"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label
                      style={{
                        display: "block",
                        color: "#888888",
                        fontSize: "13px",
                        marginBottom: "7px",
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type="password"
                      name={key}
                      value={passwordData[key]}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={async () => {
                    if (
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    ) {
                      alert("Please fill all password fields.");
                      return;
                    }

                    if (passwordData.newPassword.length < 6) {
                      alert("New password must be at least 6 characters.");
                      return;
                    }

                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                      alert("New password and confirm password do not match.");
                      return;
                    }

                    try {
                      const response = await API.put(
                        "/auth/change-password",
                        {
                          currentPassword: passwordData.currentPassword,
                          newPassword: passwordData.newPassword,
                        }
                      );

                      alert(response.data.message || "Password changed successfully!");

                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });

                      setShowChangePassword(false);
                    } catch (error) {
                      console.error("Change password error:", error);
                      alert(
                        error.response?.data?.message ||
                        "Failed to change password. Please try again."
                      );
                    }
                  }}
                  style={{
                    background: "#72ed91",
                    color: "#07140d",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 18px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Update Password
                </button>
              </div>
            )}
          </section>

          {/* FEEDBACK & EXPERIENCE */}
          <section style={settingsCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "22px" }}>💬 Feedback & Experience</h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: profileSettings.theme === "light" ? "#68756d" : "#777777",
                    fontSize: "14px",
                  }}
                >
                  Tell us how NutriAI worked for you and help us improve.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedback((previous) => !previous)}
                style={{ ...settingButton, background: showFeedback ? "rgba(114,237,145,0.08)" : "#72ed91", color: showFeedback ? "#72ed91" : "#07140d" }}
              >
                {showFeedback ? "Close" : "Give Feedback"}
              </button>
            </div>

            {showFeedback && (
              <form onSubmit={handleFeedbackSubmit} style={{ marginTop: "22px", display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: profileSettings.theme === "light" ? "#68756d" : "#888888", fontSize: "13px", marginBottom: "10px" }}>
                    How would you rate your NutriAI experience? <span style={{ color: "#72ed91" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData((previous) => ({ ...previous, rating: star }))}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "2px",
                          cursor: "pointer",
                          fontSize: "30px",
                          opacity: feedbackData.rating >= star ? 1 : 0.28,
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: profileSettings.theme === "light" ? "#68756d" : "#888888", fontSize: "13px", marginBottom: "10px" }}>
                    Did NutriAI help you? <span style={{ color: "#72ed91" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {["Yes, definitely", "Somewhat", "Not really"].map((option) => {
                      const selected = feedbackData.helpfulness === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFeedbackData((previous) => ({ ...previous, helpfulness: option }))}
                          style={{
                            ...settingButton,
                            background: selected ? "#72ed91" : (profileSettings.theme === "light" ? "#ffffff" : "#111812"),
                            color: selected ? "#07140d" : (profileSettings.theme === "light" ? "#17221b" : "#dbe5df"),
                            border: selected ? "1px solid #72ed91" : (profileSettings.theme === "light" ? "1px solid #d9e3dc" : "1px solid #2a382f"),
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: profileSettings.theme === "light" ? "#68756d" : "#888888", fontSize: "13px", marginBottom: "10px" }}>
                    Which features did you find useful?
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {[
                      "Food recommendations",
                      "AI Chatbot",
                      "Nutrition information",
                      "Nutrition profile",
                      "Goal-based recommendations",
                      "Meal suggestions",
                    ].map((feature) => {
                      const selected = feedbackData.usefulFeatures.includes(feature);
                      return (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => handleFeedbackFeatureToggle(feature)}
                          style={{
                            ...settingButton,
                            background: selected ? "#72ed91" : (profileSettings.theme === "light" ? "#ffffff" : "#111812"),
                            color: selected ? "#07140d" : (profileSettings.theme === "light" ? "#17221b" : "#dbe5df"),
                            border: selected ? "1px solid #72ed91" : (profileSettings.theme === "light" ? "1px solid #d9e3dc" : "1px solid #2a382f"),
                          }}
                        >
                          {feature}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: profileSettings.theme === "light" ? "#68756d" : "#888888", fontSize: "13px", marginBottom: "7px" }}>
                    What could we improve?
                  </label>
                  <textarea
                    value={feedbackData.improvement}
                    onChange={(e) => setFeedbackData((previous) => ({ ...previous, improvement: e.target.value }))}
                    placeholder="Tell us what you would like us to improve..."
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical", minHeight: "95px", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: profileSettings.theme === "light" ? "#68756d" : "#888888", fontSize: "13px", marginBottom: "10px" }}>
                    Would you use NutriAI again? <span style={{ color: "#72ed91" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {["Yes", "Maybe", "No"].map((option) => {
                      const selected = feedbackData.useAgain === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFeedbackData((previous) => ({ ...previous, useAgain: option }))}
                          style={{
                            ...settingButton,
                            background: selected ? "#72ed91" : (profileSettings.theme === "light" ? "#ffffff" : "#111812"),
                            color: selected ? "#07140d" : (profileSettings.theme === "light" ? "#17221b" : "#dbe5df"),
                            border: selected ? "1px solid #72ed91" : (profileSettings.theme === "light" ? "1px solid #d9e3dc" : "1px solid #2a382f"),
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowFeedback(false)}
                    style={settingButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    style={{
                      background: "#72ed91",
                      color: "#07140d",
                      border: "none",
                      borderRadius: "10px",
                      padding: "11px 18px",
                      cursor: feedbackSubmitting ? "not-allowed" : "pointer",
                      fontWeight: "700",
                      opacity: feedbackSubmitting ? 0.7 : 1,
                    }}
                  >
                    {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* PRIVACY & DATA */}
          <section style={settingsCard}>
            <h2 style={{ margin: 0, fontSize: "22px" }}>🛡️ Privacy & Data</h2>
            <p
              style={{
                margin: "6px 0 18px",
                color: profileSettings.theme === "light" ? "#68756d" : "#777777",
                fontSize: "14px",
              }}
            >
              Manage data stored locally in this browser.
            </p>

            <div style={settingRow}>
              <div>
                <strong>Clear meal history</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>
                  Removes meals you've added to the dashboard.
                </div>
              </div>
              <button onClick={clearLocalNutritionData} style={settingButton}>
                Clear Data
              </button>
            </div>

            <div style={settingRow}>
              <div>
                <strong>Clear saved recommendations</strong>
                <div style={{ color: "#7f8b84", fontSize: "13px", marginTop: "4px" }}>
                  Removes the current ML recommendations from the session.
                </div>
              </div>
              <button onClick={clearSavedRecommendations} style={settingButton}>
                Clear
              </button>
            </div>
          </section>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "transparent",
              color: "#ff9b9b",
              border: "1px solid rgba(255,130,130,0.25)",
              borderRadius: "12px",
              padding: "14px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            🚪 Log Out
          </button>
{showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#0b120e",
              border: "1px solid #26382c",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: "rgba(255, 193, 7, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              👋
            </div>

            <h2 style={{ margin: 0, fontSize: "23px", color: "#ffffff" }}>
              Logout from NutriAI?
            </h2>

            <p
              style={{
                margin: "10px 0 25px",
                color: "#98a59d",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to logout? Your saved profile will remain saved.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "11px",
                  border: "1px solid #334238",
                  background: "#121b15",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "11px",
                  border: "none",
                  background: "#72ed91",
                  color: "#07140d",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

        </main>
      </div>
    );
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  if (showDashboard) {
    return (
      <div className="app">

        {/* ================= ORGANIC BACKGROUND ================= */}

        <div className="organic-background">
          <div className="organic-wave wave-1"></div>
          <div className="organic-wave wave-2"></div>
          <div className="organic-wave wave-3"></div>
        </div>

        {/* ================= NAVBAR ================= */}

        <nav
          className="navbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "30px",
            padding: "14px 7%",
            minHeight: "76px",
            boxSizing: "border-box",
            background: "rgba(5, 20, 14, 0.88)",
            borderBottom: "1px solid rgba(111, 247, 161, 0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            position: "relative",
            zIndex: 10,
          }}
        >

          <NutriAILogo
            className="dashboard-logo"
            style={{
              width: "auto",
              flexShrink: 0,
              justifyContent: "flex-start",
              color: "#f3f7f4",
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              lineHeight: 1,
            }}
          />

          <div
            className="nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              marginLeft: "auto",
            }}
          >

            <button
              className="nav-button"
              onClick={goHome}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                minWidth: "108px",
                height: "50px",
                padding: "0 18px",
                borderRadius: "14px",
                border: "1px solid rgba(111, 247, 161, 0.22)",
                background: "rgba(111, 247, 161, 0.055)",
                color: "#c9efd4",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontSize: "16px", opacity: 0.9 }}>⌂</span>
              Home
            </button>

            <button
              className="nav-button"
              onClick={() => setShowChatbot(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                minWidth: "112px",
                height: "50px",
                padding: "0 18px",
                borderRadius: "14px",
                border: "1px solid rgba(111, 247, 161, 0.22)",
                background: "rgba(111, 247, 161, 0.09)",
                color: "#d4f4dc",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontSize: "16px" }}>🤖</span>
              AI Chat
            </button>

            <button
              className="nav-button"
              onClick={openProfile}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                minWidth: "108px",
                height: "50px",
                padding: "0 18px",
                borderRadius: "14px",
                border: "1px solid rgba(111, 247, 161, 0.22)",
                background: "rgba(111, 247, 161, 0.055)",
                color: "#c9efd4",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontSize: "16px" }}>◉</span>
              Profile
            </button>

          </div>

        </nav>

        {/* ================= DASHBOARD ================= */}

        <main
          className="dashboard-page"
          style={{
            position: "relative",
            zIndex: 3,
            padding: "70px 9%",
            minHeight: "calc(100vh - 76px)",
          }}
        >

          {/* ================= WELCOME ================= */}

          <div
            className="dashboard-welcome-block"
            style={{
              position: "relative",
              marginBottom: "42px",
              padding: "38px 44px",
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, rgba(22, 55, 43, 0.72), rgba(10, 32, 25, 0.55))",
              border: "1px solid rgba(111, 247, 161, 0.12)",
              boxShadow: "0 18px 45px rgba(0, 0, 0, 0.18)",
              overflow: "hidden",
            }}
          >

            {/* Decorative glow */}
            <div
              style={{
                position: "absolute",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "rgba(111, 247, 161, 0.07)",
                filter: "blur(50px)",
                right: "-70px",
                top: "-100px",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >

              {/* Dashboard label */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 13px",
                  marginBottom: "18px",
                  borderRadius: "999px",
                  background: "rgba(111, 247, 161, 0.08)",
                  border: "1px solid rgba(111, 247, 161, 0.14)",
                  color: "#72ed91",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "1.4px",
                }}
              >
                <span>✦</span>
                YOUR PERSONAL DASHBOARD
              </div>

              {/* Welcome heading */}
              <h1
                style={{
                  margin: 0,
                  maxWidth: "850px",
                  fontSize: "44px",
                  lineHeight: "1.15",
                  fontWeight: "700",
                  letterSpacing: "-1px",
                  color: "#f3f7f4",
                }}
              >
                Welcome,{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #6ff7a1, #73e8d1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {formData.name}
                </span>
                .
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  margin: "14px 0 0",
                  color: "#9eaea8",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  maxWidth: "520px",
                }}
              >
                Let's make today a healthier day.
              </p>

            </div>
          </div>

          {/* ================= PROFILE SUMMARY ================= */}

          <section
            className="dashboard-profile-summary"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "18px",
              marginBottom: "35px",
            }}
          >

            <div
              className="feature-card"
              style={{
                minHeight: "auto",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                👤
              </div>

              <h3>
                Age
              </h3>

              <p
                style={{
                  fontSize: "22px",
                  color: "#8df39b",
                  marginTop: "8px",
                }}
              >
                {formData.age}
              </p>

              <p>
                years
              </p>
            </div>

            <div
              className="feature-card"
              style={{
                minHeight: "auto",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                📐
              </div>

              <h3>
                Height
              </h3>

              <p
                style={{
                  fontSize: "22px",
                  color: "#8df39b",
                  marginTop: "8px",
                }}
              >
                {formData.height}
              </p>

              <p>
                cm
              </p>
            </div>

            <div
              className="feature-card"
              style={{
                minHeight: "auto",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                ⚖️
              </div>

              <h3>
                Weight
              </h3>

              <p
                style={{
                  fontSize: "22px",
                  color: "#8df39b",
                  marginTop: "8px",
                }}
              >
                {formData.weight}
              </p>

              <p>
                kg
              </p>
            </div>

            <div
              className="feature-card"
              style={{
                minHeight: "auto",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                🏃
              </div>

              <h3>
                Activity
              </h3>

              <p
                style={{
                  color: "#8df39b",
                  marginTop: "8px",
                }}
              >
                {formData.activity}
              </p>
            </div>

          </section>

          {/* ================= MAIN DASHBOARD ================= */}

          <section
            className="dashboard-metrics-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "20px",
              marginBottom: "35px",
            }}
          >

            {/* GOAL */}

            <div
              className="feature-card"
              style={{
                minHeight: "240px",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                🎯
              </div>

              <h3>
                Your Goal
              </h3>

              <p
                style={{
                  color: "#8df39b",
                  fontSize: "20px",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {normalizeGoals(formData.goal).join(", ")}
              </p>

              <p>
                NutriAI will personalize your
                recommendations around this goal.
              </p>
            </div>

            {/* CALORIES */}

            <div
              className="feature-card"
              style={{
                minHeight: "240px",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                ⚡
              </div>

              <h3>
                Daily Calories
              </h3>

              <p
                style={{
                  color: "#8df39b",
                  fontSize: "28px",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {dailyCalories.toLocaleString()}
              </p>

              <p>
                estimated kcal per day
              </p>
            </div>

            {/* BMI */}

            <div
              className="feature-card"
              style={{
                minHeight: "240px",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                ⚖️
              </div>

              <h3>
                BMI
              </h3>

              <p
                style={{
                  color: "#8df39b",
                  fontSize: "28px",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {bmi}
              </p>

              <p>
                {bmiCategory}
              </p>
            </div>

            {/* WATER */}

            <div
              className="feature-card"
              style={{
                minHeight: "240px",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                💧
              </div>

              <h3>
                Hydration
              </h3>

              <p
                style={{
                  fontSize: "25px",
                  color: "#8df39b",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {waterGlasses} / {waterTarget}
              </p>

              <p>
                glasses today
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >

                <button
                  className="primary-button"
                  onClick={removeWater}
                >
                  −
                </button>

                <button
                  className="primary-button"
                  onClick={addWater}
                >
                  + Water
                </button>

              </div>

            </div>

            {/* TODAY'S MEALS */}

            <div
              className="feature-card"
              style={{
                minHeight: "240px",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                🍴
              </div>

              <h3>
                Today's Meals
              </h3>

              <p
                style={{
                  color: "#8df39b",
                  fontSize: "28px",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {mealsCompleted} / 4
              </p>

              <p>
                meals tracked today
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "9px",
                  marginTop: "16px",
                }}
              >
                {[
                  { type: "Breakfast", icon: "🌅" },
                  { type: "Lunch", icon: "🍛" },
                  { type: "Snack", icon: "🍎" },
                  { type: "Dinner", icon: "🌙" },
                ].map(({ type, icon }) => {
                  const tracked = trackedMealTypes.has(type);

                  return (
                    <div
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 10px",
                        borderRadius: "12px",
                        background: tracked
                          ? "rgba(141,243,155,0.10)"
                          : "rgba(255,255,255,0.035)",
                        border: tracked
                          ? "1px solid rgba(141,243,155,0.28)"
                          : "1px solid rgba(255,255,255,0.07)",
                        fontSize: "12px",
                        color: tracked ? "#8df39b" : "rgba(255,255,255,0.65)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: "15px" }}>
                        {icon}
                      </span>
                      <span style={{ flex: 1 }}>
                        {type}
                      </span>
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: tracked
                            ? "#8df39b"
                            : "rgba(255,255,255,0.08)",
                          color: tracked ? "#062014" : "rgba(255,255,255,0.45)",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {tracked ? "✓" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NUTRITION SCORE */}

            <div
              className="feature-card"
              style={{
                minHeight: "240px",
                textAlign: "center",
              }}
            >
              <div className="feature-icon">
                🌿
              </div>

              <h3>
                Nutrition Score
              </h3>

              <p
                style={{
                  color: "#8df39b",
                  fontSize: "28px",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {nutritionScore} / 100
              </p>

              <p>
                {nutritionScore >= 80
                  ? "Great progress today!"
                  : nutritionScore >= 60
                  ? "Good progress — keep going!"
                  : "Keep building healthy habits."}
              </p>

              <div
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  marginTop: "14px",
                }}
              >
                <div
                  style={{
                    width: `${nutritionScore}%`,
                    height: "100%",
                    background: "#8df39b",
                    borderRadius: "999px",
                  }}
                />
              </div>
            </div>

          </section>

          {/* =================================================
              PERSONALIZED AI INSIGHT
          ================================================= */}

          <section
            className="feature-card dashboard-insight-card"
            style={{
              marginBottom: "35px",
              minHeight: "auto",
              border:
                "1px solid rgba(124,241,143,0.18)",
              background:
                "linear-gradient(135deg, rgba(124,241,143,0.08), rgba(255,255,255,0.03))",
            }}
          >

            <div
              style={{
                display: "flex",
                gap: "18px",
                alignItems: "flex-start",
              }}
            >

              <div
                style={{
                  width: "48px",
                  height: "48px",
                  minWidth: "48px",
                  borderRadius: "15px",
                  background:
                    "rgba(124,241,143,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "23px",
                }}
              >
                ✦
              </div>

              <div>

                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  NUTRIAI INSIGHT
                </span>

                <h2
                  style={{
                    marginTop: "8px",
                  }}
                >
                  A little guidance for you
                </h2>

                <p
                  style={{
                    marginTop: "10px",
                    lineHeight: "1.7",
                    color: "#c1cbc5",
                  }}
                >
                  {personalizedInsight}
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              TODAY'S NUTRITION
          ================================================= */}

          <section
            className="feature-card dashboard-nutrition-card"
            style={{
              marginBottom: "35px",
              minHeight: "auto",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >

              <div>
                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  TODAY
                </span>

                <h2 style={{ marginTop: "8px" }}>
                  Nutrition overview
                </h2>
              </div>

              <div
                style={{
                  color: "#8df39b",
                  fontWeight: "600",
                }}
              >
                {totalMealCalories} / {dailyCalories} kcal
              </div>

            </div>

            {/* CALORIE PROGRESS */}
            <div style={{ marginTop: "25px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Calories</span>
                <span>{caloriePercentage}%</span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "9px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${caloriePercentage}%`,
                    height: "100%",
                    background: "#7cf18f",
                    borderRadius: "20px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {/* PROTEIN PROGRESS */}
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Protein</span>
                <span>
                  {totalProtein} / {proteinTarget} g
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "9px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${proteinPercentage}%`,
                    height: "100%",
                    background: "#a7e88c",
                    borderRadius: "20px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

          </section>


          {/* =================================================
              NUTRITION ANALYTICS
          ================================================= */}

          <section
            className="feature-card dashboard-analytics-card"
            style={{
              minHeight: "auto",
              marginBottom: "35px",
            }}
          >

            <div>
              <span
                style={{
                  color: "#72ed91",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                }}
              >
                ANALYTICS
              </span>

              <h2 style={{ marginTop: "8px" }}>
                Your Nutrition Analytics
              </h2>

              <p style={{ marginTop: "8px" }}>
                A quick look at your nutrition progress for today.
              </p>
            </div>

            {/* QUICK ANALYTICS SUMMARY */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginTop: "25px",
              }}
            >

              <div style={{
                padding: "20px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "25px" }}>⚡</div>
                <span style={{
                  display: "block",
                  marginTop: "10px",
                  color: "#929e97",
                  fontSize: "12px",
                }}>
                  CALORIES
                </span>
                <strong style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#8df39b",
                  fontSize: "22px",
                }}>
                  {totalMealCalories} kcal
                </strong>
                <p style={{ marginTop: "6px" }}>
                  {caloriesRemaining} kcal remaining
                </p>
              </div>

              <div style={{
                padding: "20px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "25px" }}>💪</div>
                <span style={{
                  display: "block",
                  marginTop: "10px",
                  color: "#929e97",
                  fontSize: "12px",
                }}>
                  PROTEIN
                </span>
                <strong style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#8df39b",
                  fontSize: "22px",
                }}>
                  {totalProtein} g
                </strong>
                <p style={{ marginTop: "6px" }}>
                  {proteinRemaining} g remaining
                </p>
              </div>

              <div style={{
                padding: "20px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "25px" }}>💧</div>
                <span style={{
                  display: "block",
                  marginTop: "10px",
                  color: "#929e97",
                  fontSize: "12px",
                }}>
                  WATER
                </span>
                <strong style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#8df39b",
                  fontSize: "22px",
                }}>
                  {waterGlasses} / {waterTarget}
                </strong>
                <p style={{ marginTop: "6px" }}>
                  {waterRemaining} glasses remaining
                </p>
              </div>

              <div style={{
                padding: "20px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "25px" }}>📊</div>
                <span style={{
                  display: "block",
                  marginTop: "10px",
                  color: "#929e97",
                  fontSize: "12px",
                }}>
                  DAILY PROGRESS
                </span>
                <strong style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#8df39b",
                  fontSize: "22px",
                }}>
                  {Math.round(
                    Math.min(
                      100,
                      ((caloriePercentage + proteinPercentage) / 2)
                    )
                  )}%
                </strong>
                <p style={{ marginTop: "6px" }}>
                  overall nutrition progress
                </p>
              </div>

            </div>

          </section>


          {/* =================================================
              MEAL REMINDERS
          ================================================= */}

          <section
            className="feature-card dashboard-reminders-card"
            style={{
              minHeight: "auto",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  MEAL REMINDERS
                </span>

                <h2 style={{ marginTop: "8px" }}>
                  Never miss a meal
                </h2>

                <p style={{ marginTop: "8px" }}>
                  Set reminders for your breakfast, lunch, snacks and dinner.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={async () => {
                  const allowed = await requestReminderPermission();

                  if (allowed) {
                    setShowReminderForm(!showReminderForm);
                  }
                }}
              >
                + Add Reminder
              </button>
            </div>

            {showReminderForm && (
              <form
                onSubmit={addMealReminder}
                style={{
                  marginTop: "25px",
                  padding: "25px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="form-grid">
                  <select
                    value={newReminder.type}
                    onChange={(e) =>
                      setNewReminder({
                        ...newReminder,
                        type: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snack">Snack</option>
                    <option value="Dinner">Dinner</option>
                  </select>

                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) =>
                      setNewReminder({
                        ...newReminder,
                        time: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  style={{ marginTop: "20px" }}
                >
                  Save Reminder →
                </button>
              </form>
            )}

            <div
              style={{
                marginTop: "25px",
                display: "grid",
                gap: "12px",
              }}
            >
              {mealReminders.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                  }}
                >
                  <div style={{ fontSize: "35px", marginBottom: "8px" }}>
                    ⏰
                  </div>
                  <h3>No reminders set</h3>
                  <p style={{ marginTop: "8px" }}>
                    Add a reminder to receive a browser notification.
                  </p>
                </div>
              ) : (
                mealReminders
                  .slice()
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "15px",
                        flexWrap: "wrap",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <div style={{ fontSize: "28px" }}>
                          {reminder.type === "Breakfast"
                            ? "🌅"
                            : reminder.type === "Lunch"
                            ? "☀️"
                            : reminder.type === "Snack"
                            ? "🍎"
                            : "🌙"}
                        </div>

                        <div>
                          <div style={{ fontWeight: "700" }}>
                            {reminder.type}
                          </div>
                          <div
                            style={{
                              color: "#72ed91",
                              fontSize: "14px",
                              marginTop: "4px",
                            }}
                          >
                            {formatReminderTime(reminder.time)}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          type="button"
                          aria-label={`${reminder.enabled ? "Turn off" : "Turn on"} ${reminder.type} reminder`}
                          onClick={() => toggleMealReminder(reminder.id)}
                          style={{
                            position: "relative",
                            width: "52px",
                            height: "28px",
                            borderRadius: "999px",
                            border: "none",
                            padding: "0",
                            cursor: "pointer",
                            background: reminder.enabled
                              ? "#72ed91"
                              : "#3a3a3a",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "4px",
                              left: reminder.enabled ? "28px" : "4px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "#ffffff",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.35)",
                              transition: "left 0.2s ease",
                            }}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteMealReminder(reminder.id)}
                          title="Delete reminder"
                          aria-label={`Delete ${reminder.type} reminder`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "7px",
                            height: "42px",
                            padding: "0 14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 90, 90, 0.22)",
                            background: "rgba(255, 90, 90, 0.08)",
                            color: "#ff6b6b",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255, 90, 90, 0.18)";
                            e.currentTarget.style.borderColor =
                              "rgba(255, 90, 90, 0.4)";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255, 90, 90, 0.08)";
                            e.currentTarget.style.borderColor =
                              "rgba(255, 90, 90, 0.22)";
                            e.currentTarget.style.transform =
                              "translateY(0)";
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>


          {/* =================================================
              PERSONALIZED DAILY MEAL PLAN
          ================================================= */}

          <section
            className="feature-card dashboard-daily-plan-card"
            style={{
              minHeight: "auto",
              marginBottom: "35px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >

              <div>

                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  YOUR DAILY PLAN
                </span>

                <h2
                  style={{
                    marginTop: "8px",
                  }}
                >
                  A personalized day of eating
                </h2>

                <p
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Built around your{" "}
                  <strong
                    style={{
                      color: "#8df39b",
                    }}
                  >
                    {normalizeGoals(formData.goal).join(", ")}
                  </strong>{" "}
                  goal and lifestyle.
                </p>

              </div>

              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: "12px",
                  background:
                    "rgba(124,241,143,0.08)",
                  color: "#8df39b",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {plannedCalories} kcal planned
              </div>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "16px",
                marginTop: "25px",
              }}
            >

              {dailyMealPlan.map(
                (item, index) => (

                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      item.meal &&
                      handleMealClick(item.meal)
                    }
                    style={{
                      textAlign: "left",
                      padding: "20px",
                      borderRadius: "18px",
                      background:
                        "rgba(255,255,255,0.04)",
                      border:
                        "1px solid rgba(255,255,255,0.06)",
                      cursor:
                        item.meal
                          ? "pointer"
                          : "default",
                      color: "#f0f5f1",
                      minWidth: 0,
                      minHeight: "280px",
                      display: "flex",
                      flexDirection: "column",
                      boxSizing: "border-box",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                      }}
                    >

                      <span
                        style={{
                          color: "#72ed91",
                          fontSize: "12px",
                          fontWeight: "700",
                          letterSpacing: "1px",
                        }}
                      >
                        {item.label.toUpperCase()}
                      </span>

                      <span
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(114,237,145,0.10)",
                          border: "1px solid rgba(114,237,145,0.16)",
                          fontSize: "22px",
                          boxSizing: "border-box",
                        }}
                      >
                        {item.icon}
                      </span>

                    </div>

                    {item.meal ? (

                      <>

                        <div
                          style={{
                            width: "58px",
                            height: "58px",
                            borderRadius: "16px",
                            marginTop: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.045)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            fontSize: "30px",
                            boxSizing: "border-box",
                          }}
                        >
                          {item.label === "Breakfast"
                            ? "🥣"
                            : item.label === "Lunch"
                            ? "🍛"
                            : item.label === "Snack"
                            ? "🥜"
                            : "🍲"}
                        </div>

                        <h3
                          style={{
                            marginTop: "10px",
                          }}
                        >
                          {item.meal.name}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "12px",
                            color: "#8df39b",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >

                          <span>
                            🔥 {item.meal.calories}
                          </span>

                          <span>
                            💪 {item.meal.protein}g
                          </span>

                        </div>

                        <p
                          style={{
                            marginTop: "auto",
                            paddingTop: "14px",
                            color: "#72ed91",
                            fontSize: "12px",
                          }}
                        >
                          View details →
                        </p>

                      </>

                    ) : (

                      <p
                        style={{
                          marginTop: "20px",
                          color: "#929e97",
                        }}
                      >
                        No meal available.
                      </p>

                    )}

                  </button>

                )
              )}

            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop:
                  "1px solid rgba(255,255,255,0.07)",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >

              <div
                style={{
                  color: "#929e97",
                  fontSize: "14px",
                }}
              >
                Planned protein:{" "}
                <strong
                  style={{
                    color: "#8df39b",
                  }}
                >
                  {plannedProtein} g
                </strong>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={refreshRecommendations}
              >
                ↻ Refresh plan
              </button>

            </div>

          </section>

          {/* =================================================
              MEAL TRACKER
          ================================================= */}

          <section
            className="feature-card dashboard-meal-tracker-card"
            style={{
              minHeight: "auto",
              marginBottom: "35px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >

              <div>

                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  MEAL TRACKER
                </span>

                <h2
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Today's meals
                </h2>

                <p
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Track what you eat and monitor
                  your daily nutrition.
                </p>

              </div>

              <button
                className="primary-button"
                onClick={() =>
                  setShowMealForm(
                    !showMealForm
                  )
                }
              >
                + Add Meal
              </button>

            </div>

            {/* ADD MEAL FORM */}

            {showMealForm && (

              <form
                onSubmit={addMeal}
                style={{
                  marginTop: "25px",
                  padding: "25px",
                  borderRadius: "18px",
                  background:
                    "rgba(255,255,255,0.04)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >

                <div className="form-grid">

                  <select
                    name="type"
                    value={mealData.type}
                    onChange={handleMealChange}
                    required
                  >
                    <option value="Breakfast">
                      Breakfast
                    </option>

                    <option value="Lunch">
                      Lunch
                    </option>

                    <option value="Dinner">
                      Dinner
                    </option>

                    <option value="Snack">
                      Snack
                    </option>
                  </select>

                  <input
                    type="text"
                    name="name"
                    placeholder="Meal name"
                    value={mealData.name}
                    onChange={handleMealChange}
                    required
                  />

                  <input
                    type="number"
                    name="calories"
                    placeholder="Calories (kcal)"
                    value={mealData.calories}
                    onChange={handleMealChange}
                    min="0"
                    required
                  />

                  <input
                    type="number"
                    name="protein"
                    placeholder="Protein (g)"
                    value={mealData.protein}
                    onChange={handleMealChange}
                    min="0"
                  />

                </div>

                <button
                  type="submit"
                  className="primary-button"
                  style={{
                    marginTop: "20px",
                  }}
                >
                  Save Meal →
                </button>

              </form>
            )}

            {/* MEAL LIST */}

            <div
              style={{
                marginTop: "25px",
              }}
            >

              {meals.length === 0 ? (

                <div
                  style={{
                    textAlign: "center",
                    padding: "35px 20px",
                    borderRadius: "16px",
                    background:
                      "rgba(255,255,255,0.03)",
                    border:
                      "1px dashed rgba(255,255,255,0.12)",
                  }}
                >

                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                    }}
                  >
                    🍽️
                  </div>

                  <h3>
                    No meals added yet
                  </h3>

                  <p
                    style={{
                      marginTop: "8px",
                    }}
                  >
                    Start tracking your meals
                    to see your nutrition progress.
                  </p>

                </div>

              ) : (

                meals.map((meal) => (

                  <div
                    key={meal.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "18px 0",
                      borderBottom:
                        "1px solid rgba(255,255,255,0.08)",
                    }}
                  >

                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        background:
                          "rgba(124,241,143,0.1)",
                        fontSize: "23px",
                      }}
                    >
                      {meal.type ===
                      "Breakfast"
                        ? "🌅"
                        : meal.type ===
                          "Lunch"
                        ? "☀️"
                        : meal.type ===
                          "Dinner"
                        ? "🌙"
                        : "🍎"}
                    </div>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >

                      <strong
                        style={{
                          display: "block",
                        }}
                      >
                        {meal.name}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#929e97",
                          fontSize: "13px",
                        }}
                      >
                        {meal.type} •{" "}
                        {meal.protein}g protein
                      </span>

                    </div>

                    <strong
                      style={{
                        color: "#8df39b",
                      }}
                    >
                      {meal.calories} kcal
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        deleteMeal(meal.id)
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        color: "#929e97",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>

                  </div>

                ))

              )}

            </div>

          </section>

          {/* =================================================
              PERSONALIZED MEAL SUGGESTIONS
          ================================================= */}

          <section
            className="feature-card"
            style={{
              minHeight: "auto",
              marginBottom: "35px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >

              <div>

                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  YOUR MEAL PLAN
                </span>

                <h2
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Meal suggestions
                </h2>

                <p
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Personalized to your goals and food preference.
                </p>

                <p
                  style={{
                    marginTop: "8px",
                    color: "#929e97",
                    fontSize: "14px",
                  }}
                >
                  Tap a meal to view details.
                </p>

                {mlLoading && (
                  <p style={{ marginTop: "10px", color: "#72ed91", fontSize: "13px" }}>
                    🤖 Generating personalized recommendations with the ML model...
                  </p>
                )}

                {mlError && (
                  <p style={{ marginTop: "10px", color: "#ff8a8a", fontSize: "13px" }}>
                    {mlError}
                  </p>
                )}

                {mlRecommendations.length > 0 && (
                  <p style={{ marginTop: "10px", color: "#72ed91", fontSize: "13px", fontWeight: "600" }}>
                    ✨ NutriAI ML • {formData.foodPreference}
                  </p>
                )}

              </div>

              <button
                type="button"
                className="primary-button"
                onClick={refreshRecommendations}
              >
                ↻ Refresh
              </button>

            </div>

            <div
              className="meal-recommendations-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "18px",
                marginTop: "25px",
              }}
            >

              {displayedMeals.map(
                (meal) => (

                  <button
                    key={meal.id}
                    type="button"
                    className="meal-recommendation-card"
                    onClick={() =>
                      handleMealClick(meal)
                    }
                    style={{
                      textAlign: "left",
                      padding: "20px",
                      borderRadius: "18px",
                      background:
                        "rgba(255,255,255,0.04)",
                      border:
                        "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      color: "#f0f5f1",
                      minWidth: 0,
                      minHeight: "320px",
                      display: "flex",
                      flexDirection: "column",
                      boxSizing: "border-box",
                      transition:
                        "transform 0.2s ease, background 0.2s ease",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#72ed91",
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing: "1px",
                        }}
                      >
                        {meal.type.toUpperCase()}
                      </span>

                      <span
                        style={{
                          width: "52px",
                          height: "52px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "15px",
                          background: "rgba(114,237,145,0.10)",
                          border: "1px solid rgba(114,237,145,0.18)",
                          fontSize: "28px",
                        }}
                        aria-hidden="true"
                      >
                        {meal.type === "Breakfast"
                          ? "🌅"
                          : meal.type === "Main Meal"
                          ? "☀️"
                          : meal.type === "Snack"
                          ? "🌇"
                          : "🌙"}
                      </span>
                    </div>

                    {meal.isML && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "12px",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          background: "rgba(114,237,145,0.12)",
                          color: "#72ed91",
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "0.8px",
                        }}
                      >
                        ML RECOMMENDED
                      </span>
                    )}

                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        marginTop: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "17px",
                        background: "rgba(255,255,255,0.045)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        fontSize: "38px",
                      }}
                      aria-hidden="true"
                    >
                      {meal.type === "Breakfast"
                        ? "🥣"
                        : meal.type === "Main Meal"
                        ? "🍛"
                        : meal.type === "Snack"
                        ? "🥜"
                        : "🍲"}
                    </div>

                    <h3
                      style={{
                        marginTop: "8px",
                      }}
                    >
                      {meal.name}
                    </h3>

                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                      }}
                    >
                      {meal.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        marginTop: "15px",
                        color: "#8df39b",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      <span>
                        🔥 {meal.calories} kcal
                      </span>

                      <span>
                        💪 {meal.protein}g
                      </span>
                    </div>

                    <p
                      style={{
                        marginTop: "auto",
                        paddingTop: "16px",
                        color: "#72ed91",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      View meal details →
                    </p>

                  </button>

                )
              )}

            </div>

          </section>

          {/* =================================================
              DAILY NUTRITION TIP
          ================================================= */}

          <section
            className="feature-card"
            style={{
              minHeight: "auto",
              marginBottom: "35px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >

              <div
                style={{
                  width: "50px",
                  height: "50px",
                  minWidth: "50px",
                  borderRadius: "15px",
                  background:
                    "rgba(124,241,143,0.09)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                💡
              </div>

              <div>

                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  TODAY'S NUTRITION TIP
                </span>

                <p
                  style={{
                    marginTop: "8px",
                    lineHeight: "1.6",
                    color: "#c1cbc5",
                  }}
                >
                  {dailyTip}
                </p>

              </div>

            </div>

          </section>

        </main>

        {/* =====================================================
            MEAL DETAIL MODAL
        ===================================================== */}

        {/* ================= AI NUTRITION CHATBOT ================= */}
        {showChatbot && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(7px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setShowChatbot(false)}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "650px",
                height: "min(750px, 90vh)",
                background: "#080b09",
                border: "1px solid rgba(124,241,143,0.18)",
                borderRadius: "24px",
                boxShadow: "0 25px 80px rgba(0,0,0,0.55)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* CHAT HEADER */}
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "linear-gradient(135deg, rgba(124,241,143,0.10), rgba(255,255,255,0.02))",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "14px",
                      background: "rgba(124,241,143,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "23px",
                    }}
                  >
                    🤖
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#72ed91",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "1.5px",
                      }}
                    >
                      NUTRIAI AI ASSISTANT
                    </div>
                    <h2 style={{ margin: "4px 0 0", fontSize: "21px" }}>
                      Nutrition Chat
                    </h2>
                    <p style={{ margin: "4px 0 0", color: "#89938d", fontSize: "12px" }}>
                      Personalized for your {normalizeGoals(formData.goal).join(", ") || "wellness"} goal
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={clearChat}
                    disabled={chatLoading}
                    title="Clear conversation"
                    style={{
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "11px",
                      border: "1px solid #2b332e",
                      background: "#111512",
                      color: "#b9c2bc",
                      cursor: chatLoading ? "not-allowed" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChatbot(false)}
                    aria-label="Close chatbot"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "12px",
                      border: "1px solid #2b332e",
                      background: "#111512",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              {chatMessages.length <= 1 && (
                <div
                  style={{
                    padding: "16px 18px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "linear-gradient(180deg, rgba(124,241,143,0.025), transparent)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "13px",
                    }}
                  >
                    <div>
                      <div style={{ color: "#eef5f0", fontSize: "14px", fontWeight: "700" }}>
                        Quick help
                      </div>
                      <div style={{ color: "#69736d", fontSize: "11px", marginTop: "3px" }}>
                        Pick a topic or type your own question
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "5px 8px",
                        borderRadius: "8px",
                        background: "rgba(124,241,143,0.07)",
                        color: "#7cf18f",
                        fontSize: "9px",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                      }}
                    >
                      AI HELP
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {quickQuestions.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => sendChatMessage(null, item.prompt)}
                        disabled={chatLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          minWidth: 0,
                          textAlign: "left",
                          border: "1px solid rgba(124,241,143,0.11)",
                          background: "rgba(255,255,255,0.025)",
                          color: "#c2cec6",
                          borderRadius: "12px",
                          padding: "10px 11px",
                          cursor: chatLoading ? "not-allowed" : "pointer",
                          fontSize: "11px",
                          transition: "all 0.2s ease",
                          opacity: chatLoading ? 0.55 : 1,
                        }}
                        onMouseEnter={(event) => {
                          if (!chatLoading) {
                            event.currentTarget.style.background = "rgba(124,241,143,0.07)";
                            event.currentTarget.style.borderColor = "rgba(124,241,143,0.24)";
                          }
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = "rgba(255,255,255,0.025)";
                          event.currentTarget.style.borderColor = "rgba(124,241,143,0.11)";
                        }}
                      >
                        <span
                          style={{
                            width: "27px",
                            height: "27px",
                            minWidth: "27px",
                            borderRadius: "9px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(124,241,143,0.07)",
                            fontSize: "13px",
                          }}
                        >
                          {item.icon}
                        </span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMoreActions((previous) => !previous)}
                    style={{
                      width: "100%",
                      marginTop: "9px",
                      padding: "8px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "transparent",
                      color: "#7f8983",
                      cursor: "pointer",
                      fontSize: "11px",
                    }}
                  >
                    {showMoreActions ? "Show fewer options  ↑" : "More nutrition options  ↓"}
                  </button>

                  {showMoreActions && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "7px",
                        marginTop: "8px",
                      }}
                    >
                      {moreQuestions.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => sendChatMessage(null, item.prompt)}
                          disabled={chatLoading}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            minWidth: 0,
                            textAlign: "left",
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.018)",
                            color: "#9da8a1",
                            borderRadius: "10px",
                            padding: "8px 9px",
                            cursor: chatLoading ? "not-allowed" : "pointer",
                            fontSize: "10px",
                            opacity: chatLoading ? 0.55 : 1,
                          }}
                        >
                          <span>{item.icon}</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MESSAGES */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    {message.role === "assistant" && (
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          minWidth: "28px",
                          borderRadius: "10px",
                          background: "rgba(124,241,143,0.10)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                        }}
                      >
                        ✦
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "82%",
                        padding: "13px 15px",
                        borderRadius: message.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                        background: message.role === "user" ? "#7cf18f" : "rgba(255,255,255,0.055)",
                        color: message.role === "user" ? "#071008" : "#e8eee9",
                        border: message.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                        lineHeight: "1.65",
                        fontSize: "14px",
                        whiteSpace: message.role === "user" ? "pre-wrap" : "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {message.role === "assistant"
                        ? renderChatResponse(message.text)
                        : message.text}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "10px",
                        background: "rgba(124,241,143,0.10)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✦
                    </div>
                    <div
                      style={{
                        padding: "11px 14px",
                        borderRadius: "16px 16px 16px 5px",
                        background: "rgba(255,255,255,0.055)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "#8df39b",
                        fontSize: "13px",
                      }}
                    >
                      NutriAI is thinking... ✦
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* INPUT */}
              <form
                onSubmit={sendChatMessage}
                style={{
                  padding: "14px 15px 15px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "#090c0a",
                }}
              >
                <div style={{ display: "flex", gap: "9px", alignItems: "center" }}>
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask about food, protein, calories..."
                    disabled={chatLoading}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "#111512",
                      color: "#ffffff",
                      border: "1px solid #29312c",
                      borderRadius: "14px",
                      padding: "13px 15px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      border: "none",
                      background: chatLoading || !chatInput.trim() ? "#303631" : "#7cf18f",
                      color: chatLoading || !chatInput.trim() ? "#858c87" : "#071008",
                      cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    ↑
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginTop: "8px",
                  }}
                >
                  <span style={{ color: "#646d67", fontSize: "11px" }}>
                    Press Enter to send
                  </span>
                  <span style={{ color: "#646d67", fontSize: "11px" }}>
                    AI nutrition guidance
                  </span>
                </div>
                <p
                  style={{
                    margin: "7px 3px 0",
                    color: "#555e58",
                    fontSize: "10px",
                    lineHeight: "1.5",
                  }}
                >
                  NutriAI provides general nutrition guidance and is not a substitute for professional medical advice.
                </p>
              </form>
            </div>
          </div>
        )}

        {selectedMeal && (

          <div
            className="modal-overlay"
            onClick={() => setSelectedMeal(null)}
            style={{
              padding: "24px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(760px, 100%)",
                maxWidth: "760px",
                maxHeight: "90vh",
                overflowY: "auto",
                overflowX: "hidden",
                padding: "34px",
                boxSizing: "border-box",
                textAlign: "left",
              }}
            >

              <button
                className="close-button"
                onClick={() => setSelectedMeal(null)}
                aria-label="Close meal details"
              >
                ×
              </button>

              {/* MEAL HEADER */}
              <div
                style={{
                  textAlign: "center",
                  padding: "4px 35px 0",
                }}
              >
                <div
                  style={{
                    fontSize: "54px",
                    lineHeight: "1",
                    marginBottom: "12px",
                  }}
                >
                  {selectedMeal.emoji}
                </div>

                <span
                  style={{
                    color: "#72ed91",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                  }}
                >
                  PERSONALIZED MEAL
                </span>

                <h2
                  style={{
                    margin: "10px 0 0",
                    fontSize: "clamp(28px, 5vw, 42px)",
                    lineHeight: "1.15",
                  }}
                >
                  {selectedMeal.name}
                </h2>

                <p
                  style={{
                    margin: "12px auto 0",
                    maxWidth: "600px",
                    color: "#9ba8a0",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedMeal.description}
                </p>
              </div>

              {/* NUTRITION */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                  marginTop: "28px",
                }}
              >
                {[
                  ["CALORIES", `${selectedMeal.calories} kcal`],
                  ["PROTEIN", `${selectedMeal.protein} g`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: "18px 20px",
                      borderRadius: "16px",
                      background: "rgba(124,241,143,0.08)",
                      border: "1px solid rgba(124,241,143,0.08)",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#929e97",
                        letterSpacing: "1px",
                      }}
                    >
                      {label}
                    </span>
                    <strong
                      style={{
                        display: "block",
                        marginTop: "6px",
                        color: "#8df39b",
                        fontSize: "24px",
                      }}
                    >
                      {value}
                    </strong>
                  </div>
                ))}
              </div>

              {/* INGREDIENTS */}
              <div
                style={{
                  marginTop: "30px",
                  padding: "24px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                  }}
                >
                  🥗 Ingredients
                </h3>

                {recipeLoading ? (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "rgba(114,237,145,0.06)",
                      color: "#72ed91",
                    }}
                  >
                    🤖 Preparing your recipe...
                  </div>
                ) : (
                  <ul
                    style={{
                      margin: "18px 0 0",
                      paddingLeft: "22px",
                      color: "#c1cbc5",
                    }}
                  >
                    {(selectedMeal.ingredients || []).map((ingredient, index) => (
                      <li
                        key={index}
                        style={{
                          marginBottom: "11px",
                          paddingLeft: "4px",
                          lineHeight: "1.55",
                        }}
                      >
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* PREPARATION */}
              <div
                style={{
                  marginTop: "18px",
                  padding: "24px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                  }}
                >
                  👩‍🍳 Preparation
                </h3>

                {recipeLoading ? (
                  <div
                    style={{
                      marginTop: "18px",
                      color: "#aeb9b2",
                      lineHeight: "1.65",
                    }}
                  >
                    🤖 NutriAI is generating the preparation steps for this recipe...
                  </div>
                ) : (
                  <ol
                    style={{
                      margin: "18px 0 0",
                      paddingLeft: "26px",
                      color: "#c1cbc5",
                    }}
                  >
                    {(selectedMeal.preparationSteps?.length
                      ? selectedMeal.preparationSteps
                      : [selectedMeal.instructions]
                    ).map((step, index) => (
                      <li
                        key={index}
                        style={{
                          marginBottom: "14px",
                          paddingLeft: "6px",
                          lineHeight: "1.65",
                        }}
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <button
                className="primary-button"
                style={{
                  width: "100%",
                  marginTop: "24px",
                }}
                onClick={() => setSelectedMeal(null)}
              >
                Close →
              </button>

            </div>

          </div>

        )}

      </div>
    );
  }

  /* =========================================================
     MAIN WEBSITE
  ========================================================= */

  return (
    <div className="app">

      {/* ================= ORGANIC BACKGROUND ================= */}

      <div className="organic-background">
        <div className="organic-wave wave-1"></div>
        <div className="organic-wave wave-2"></div>
        <div className="organic-wave wave-3"></div>
      </div>

      {/* ================= NAVBAR ================= */}

      <nav
        className="navbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
          padding: "16px 7%",
          minHeight: "76px",
          boxSizing: "border-box",
          background: "rgba(5, 20, 14, 0.82)",
          borderBottom: "1px solid rgba(111, 247, 161, 0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >

        {/* Home-page logo */}
        <NutriAILogo
          className="home-logo"
          style={{
            width: "auto",
            flexShrink: 0,
            justifyContent: "flex-start",
            color: "#f3f7f4",
            fontSize: "32px",
            fontWeight: 800,
            letterSpacing: "-1.2px",
            lineHeight: 1,
          }}
        />

        {/* Home-page navigation */}
        <div
          className="nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            marginLeft: "auto",
          }}
        >

          <a
            href="#home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "78px",
              height: "42px",
              padding: "0 16px",
              borderRadius: "12px",
              color: "#d2e9d8",
              background: "rgba(111, 247, 161, 0.07)",
              border: "1px solid rgba(111, 247, 161, 0.16)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
              boxSizing: "border-box",
              transition: "all 0.2s ease",
            }}
          >
            Home
          </a>

          <a
            href="#features"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "86px",
              height: "42px",
              padding: "0 16px",
              borderRadius: "12px",
              color: "#aebfb6",
              background: "transparent",
              border: "1px solid transparent",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              boxSizing: "border-box",
              transition: "all 0.2s ease",
            }}
          >
            Features
          </a>

          <a
            href="#about"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "78px",
              height: "42px",
              padding: "0 16px",
              borderRadius: "12px",
              color: "#aebfb6",
              background: "transparent",
              border: "1px solid transparent",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              boxSizing: "border-box",
              transition: "all 0.2s ease",
            }}
          >
            About
          </a>

          <button
            className="nav-button"
            onClick={openModal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "118px",
              height: "44px",
              padding: "0 20px",
              marginLeft: "4px",
              borderRadius: "13px",
              border: "1px solid rgba(111, 247, 161, 0.28)",
              background:
                "linear-gradient(100deg, rgba(111, 247, 161, 0.18), rgba(98, 223, 207, 0.13))",
              color: "#bff4cb",
              fontSize: "14px",
              fontWeight: 750,
              cursor: "pointer",
              boxSizing: "border-box",
              transition: "all 0.2s ease",
            }}
          >
            Get Started
          </button>

        </div>

      </nav>

      {/* ================= HERO ================= */}

      <main
        className="hero-section"
        id="home"
      >

        <section
          className="hero-content"
          style={{
            width: "100%",
            maxWidth: "680px",
            margin: "0 auto",
            padding: "0 18px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >

          <div
            className="badge"
            style={{
              margin: "0 auto 28px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            <span className="badge-dot"></span>

            YOUR DAILY WELLNESS

          </div>

          <h1
            style={{
              margin: "0",
              width: "100%",
              textAlign: "center",
              lineHeight: "0.98",
            }}
          >

            Eat smart.

            <br />

            <span>
              Live well.
            </span>

          </h1>

          <p
            style={{
              width: "100%",
              maxWidth: "650px",
              margin: "26px auto 0",
              textAlign: "center",
              lineHeight: "1.65",
            }}
          >
            Your personalized AI nutrition companion,
            helping you make smarter food choices and
            build healthier habits every day.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              width: "100%",
              marginTop: "28px",
            }}
          >

            <button
              className="primary-button"
              onClick={openModal}
              style={{
                minWidth: "145px",
              }}
            >
              Get started →
            </button>

            <a
              href="#features"
              style={{
                minWidth: "145px",
                padding: "14px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(124,241,143,0.16)",
                background: "rgba(255,255,255,0.025)",
                color: "#dce6df",
                textDecoration: "none",
                fontWeight: 700,
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              Explore NutriAI
            </a>

          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              width: "100%",
              marginTop: "28px",
              color: "#8e9e95",
              fontSize: "13px",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            <span>✦ AI-powered</span>
            <span>•</span>
            <span>🥗 Personalized meals</span>
            <span>•</span>
            <span>💧 Daily wellness</span>
          </div>

        </section>

        <section className="hero-card">

          <div className="hero-card-top">

            <div>

              <span className="card-label">
                PERSONALIZED BY AI
              </span>

              <h3>
                Nutrition
                <br />
                made personal.
              </h3>

            </div>

            <div className="card-check">
              ✦
            </div>

          </div>

          <div className="food-visual">

            <div className="food-plate">
              🥗
            </div>

          </div>

          <div className="card-message">

            <span>
              SMARTER CHOICES • HEALTHIER YOU
            </span>

          </div>

          <div className="mini-stats">

            <div>
              <strong>
                AI
              </strong>

              <span>
                Powered
              </span>
            </div>

            <div>
              <strong>
                24/7
              </strong>

              <span>
                Guidance
              </span>
            </div>

            <div>
              <strong>
                ✦
              </strong>

              <span>
                Personal
              </span>
            </div>

          </div>

        </section>

      </main>

      {/* ================= FEATURES ================= */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading">

          <span>
            WHY NUTRIAI
          </span>

          <h2>
            Everything you need
            <br />
            to eat <span>better.</span>
          </h2>

          <p>
            Simple, personalized nutrition guidance
            designed around your everyday lifestyle.
          </p>

        </div>

        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon">
              ✦
            </div>

            <h3>
              Personalized Nutrition
            </h3>

            <p>
              Recommendations created around
              your lifestyle, body and personal goals.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ◌
            </div>

            <h3>
              Smart Food Insights
            </h3>

            <p>
              Understand your food choices and
              discover simple ways to improve your diet.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ♡
            </div>

            <h3>
              Healthy Habits
            </h3>

            <p>
              Build sustainable habits with guidance
              that fits naturally into your daily routine.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ✧
            </div>

            <h3>
              AI Guidance
            </h3>

            <p>
              Get intelligent nutrition suggestions
              based on your personal information and goals.
            </p>

          </div>

        </div>

      </section>

      {/* ================= ABOUT ================= */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-content">

          <span>
            ABOUT NUTRIAI
          </span>

          <h2>
            Better choices.
            <br />

            <span>
              Every day.
            </span>

          </h2>

          <p>
            NutriAI combines nutrition knowledge
            with artificial intelligence to create
            a personalized approach to everyday wellness.
          </p>

          <div className="about-points">

            <div className="about-point">

              <span>
                ✦
              </span>

              <div>

                <strong>
                  Personalized
                </strong>

                <p>
                  Recommendations based on you,
                  not a one-size-fits-all plan.
                </p>

              </div>

            </div>

            <div className="about-point">

              <span>
                ✦
              </span>

              <div>

                <strong>
                  Simple
                </strong>

                <p>
                  Easy-to-understand nutrition
                  guidance for everyday life.
                </p>

              </div>

            </div>

            <div className="about-point">

              <span>
                ✦
              </span>

              <div>

                <strong>
                  AI-Powered
                </strong>

                <p>
                  Intelligent insights designed
                  to support healthier decisions.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          GET STARTED MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={closeModal}
            >
              ×
            </button>

            {/* ================= STEP 1 ================= */}

            {step === 1 && (

              <>

                <span>
                  GET STARTED • STEP 1 OF 2
                </span>

                <h2>
                  Let's personalize
                  <br />
                  your experience.
                </h2>

                <p>
                  Tell us a little about yourself so
                  NutriAI can create more personalized
                  nutrition recommendations.
                </p>

                <form
                  onSubmit={handleStepOne}
                >

                  <div className="form-grid">

                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="number"
                      name="age"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                      min="13"
                      required
                    />

                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Gender
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Other">
                        Other
                      </option>

                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>

                    </select>

                    <input
                      type="number"
                      name="height"
                      placeholder="Height (cm)"
                      value={formData.height}
                      onChange={handleChange}
                      min="100"
                      required
                    />

                    <input
                      type="number"
                      name="weight"
                      placeholder="Weight (kg)"
                      value={formData.weight}
                      onChange={handleChange}
                      min="20"
                      required
                    />

                    <select
                      name="foodPreference"
                      value={formData.foodPreference}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Food preference
                      </option>
                      <option value="Vegetarian">
                        Vegetarian
                      </option>
                      <option value="Non-Vegetarian">
                        Non-Vegetarian
                      </option>
                      <option value="Vegan">
                        Vegan
                      </option>
                    </select>

                    <select
                      name="activity"
                      value={formData.activity}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Activity level
                      </option>

                      <option value="Sedentary">
                        Sedentary
                      </option>

                      <option value="Lightly Active">
                        Lightly Active
                      </option>

                      <option value="Moderately Active">
                        Moderately Active
                      </option>

                      <option value="Very Active">
                        Very Active
                      </option>

                    </select>

                  </div>

                  <button
                    type="submit"
                    className="primary-button full-width"
                  >
                    Continue
                    <span>
                      →
                    </span>
                  </button>

                </form>

              </>

            )}

            {/* ================= STEP 2 ================= */}

            {step === 2 && (

              <>

                <span>
                  GET STARTED • STEP 2 OF 2
                </span>

                <h2>
                  What are your
                  <br />
                  nutrition goals?
                </h2>

                <p>
                  Select all the goals you want NutriAI
                  to help you achieve.
                </p>

                <div className="form-grid">
                  {[
                    ["Eat healthier", "🥗"],
                    ["Lose weight", "⚖️"],
                    ["Gain weight", "📈"],
                    ["Build muscle", "💪"],
                    ["Improve fitness", "🔥"],
                    ["Maintain weight", "🧘"],
                    ["Improve hydration", "💧"],
                    ["Improve nutrition", "🥦"],
                    ["Healthy lifestyle", "❤️"],
                    ["Overall wellness", "✨"],
                  ].map(([goal, icon]) => {
                    const selected = hasGoal(goal, formData.goal);

                    return (
                      <button
                        key={goal}
                        type="button"
                        className="primary-button"
                        onClick={() => handleGoalToggle(goal)}
                        style={{
                          border: selected ? "1px solid #7cf18f" : undefined,
                          background: selected ? "rgba(124, 241, 143, 0.12)" : undefined,
                          boxShadow: selected
                            ? "0 0 0 1px rgba(124, 241, 143, 0.12), 0 8px 24px rgba(124, 241, 143, 0.08)"
                            : undefined,
                        }}
                      >
                        {icon} {goal}
                        {selected && (
                          <span style={{ marginLeft: "8px", color: "#7cf18f", fontWeight: 800 }}>
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p style={{ marginTop: "16px", textAlign: "center", color: "#8e9e95", fontSize: "13px" }}>
                  {normalizeGoals(formData.goal).length > 0
                    ? `${normalizeGoals(formData.goal).length} goal${normalizeGoals(formData.goal).length === 1 ? "" : "s"} selected`
                    : "Select at least one goal to continue"}
                </p>

                <button
                  type="button"
                  className="primary-button full-width"
                  style={{ marginTop: "8px" }}
                  onClick={handleGoalContinue}
                >
                  Continue with {normalizeGoals(formData.goal).length} goal{normalizeGoals(formData.goal).length === 1 ? "" : "s"}
                  <span>→</span>
                </button>

                <button
                  type="button"
                  className="nav-button"
                  style={{ width: "100%", marginTop: "15px" }}
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


export default NutriAIDashboard;