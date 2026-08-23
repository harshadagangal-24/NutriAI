import { useState } from "react";
import "./App.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [showDashboard, setShowDashboard] = useState(false);

  /* ================= USER DATA ================= */

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity: "",
    goal: "",
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

  /* ================= WATER DATA ================= */

  const [waterGlasses, setWaterGlasses] = useState(0);

  /* ================= MEAL DETAIL ================= */

  const [selectedMeal, setSelectedMeal] = useState(null);

  /* ================= RECOMMENDATION REFRESH ================= */

  const [recommendationOffset, setRecommendationOffset] = useState(0);

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

  const handleGoalSelect = (goal) => {
    const updatedData = {
      ...formData,
      goal: goal,
    };

    setFormData(updatedData);

    setShowModal(false);
    setShowDashboard(true);
    setStep(1);

    setRecommendationOffset(0);

    console.log("User Profile:", updatedData);
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
  };

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

    if (formData.goal === "Lose weight") {
      calories -= 300;
    }

    if (formData.goal === "Gain weight") {
      calories += 300;
    }

    if (formData.goal === "Build muscle") {
      calories += 250;
    }

    if (formData.goal === "Improve fitness") {
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

    if (formData.goal === "Build muscle") {
      multiplier = 1.6;
    } else if (
      formData.goal === "Lose weight"
    ) {
      multiplier = 1.2;
    } else if (
      formData.goal === "Gain weight"
    ) {
      multiplier = 1.2;
    } else if (
      formData.goal === "Improve fitness"
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
      mealSuggestions[formData.goal] ||
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
      formData.goal === "Build muscle" ||
      formData.activity === "Very Active"
    ) {
      suggestions = [...suggestions].sort(
        (a, b) =>
          b.protein - a.protein
      );
    } else if (
      formData.goal === "Lose weight" ||
      bmiCategory === "Overweight" ||
      bmiCategory === "Obesity range"
    ) {
      suggestions = [...suggestions].sort(
        (a, b) =>
          a.calories - b.calories
      );
    } else if (
      bmiCategory === "Underweight" ||
      formData.goal === "Gain weight"
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
     REFRESH RECOMMENDATIONS
  ========================================================= */

  const refreshRecommendations = () => {
    setRecommendationOffset(
      (previous) =>
        (previous + 1) %
        Math.max(1, personalizedMeals.length)
    );
  };

  const displayedMeals =
    personalizedMeals.length > 0
      ? [
          ...personalizedMeals.slice(
            recommendationOffset
          ),
          ...personalizedMeals.slice(
            0,
            recommendationOffset
          ),
        ].slice(0, 4)
      : [];

  /* =========================================================
     PERSONALIZED DAILY MEAL PLAN
  ========================================================= */

  const getMealByType = (type) => {
    const matchingMeals =
      personalizedMeals.filter(
        (meal) => meal.type === type
      );

    if (matchingMeals.length > 0) {
      return matchingMeals[0];
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
      icon: "🍎",
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
      formData.goal === "Build muscle"
    ) {
      return `Your plan emphasizes protein-rich meals because your goal is to support muscle development. Aim to spread your protein intake across your main meals.`;
    }

    if (
      formData.goal === "Lose weight"
    ) {
      return `Your recommendations focus on filling, protein- and fiber-rich foods while keeping meals relatively calorie-conscious.`;
    }

    if (
      formData.goal === "Gain weight"
    ) {
      return `Your plan prioritizes nutrient-dense foods with additional calories, healthy fats and protein to support gradual weight gain.`;
    }

    if (
      formData.goal === "Improve hydration"
    ) {
      return `Hydrating foods have been prioritized in your recommendations. Keep sipping water throughout the day rather than waiting until you feel thirsty.`;
    }

    if (
      formData.goal === "Improve fitness"
    ) {
      return `Your recommendations combine balanced carbohydrates, protein and vegetables to support everyday activity and recovery.`;
    }

    if (
      formData.goal === "Improve nutrition"
    ) {
      return `Your plan focuses on variety by combining whole grains, vegetables, fruits, legumes and protein-rich foods.`;
    }

    if (
      formData.goal === "Healthy lifestyle"
    ) {
      return `Your recommendations focus on balanced meals and sustainable everyday habits rather than extreme dietary changes.`;
    }

    if (
      formData.goal === "Maintain weight"
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
     DAILY NUTRITION TIP
  ========================================================= */

  const nutritionTips = [
    "Try to include a source of protein in each main meal.",
    "Add colorful fruits and vegetables to increase variety in your diet.",
    "Drink water regularly throughout the day instead of waiting until you feel thirsty.",
    "Whole grains and high-fiber foods can help keep meals more satisfying.",
    "Small, consistent healthy choices can be more sustainable than extreme changes.",
  ];

  const tipIndex =
    (Number(formData.age) +
      Number(formData.weight) +
      Number(formData.height)) %
    nutritionTips.length;

  const dailyTip =
    nutritionTips[tipIndex];

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

        <nav className="navbar">

          <div className="logo">
            <span>✦</span>
            NutriAI
          </div>

          <div className="nav-links">

            <button
              className="nav-button"
              onClick={goHome}
            >
              ← Home
            </button>

          </div>

        </nav>

        {/* ================= DASHBOARD ================= */}

        <main
          style={{
            position: "relative",
            zIndex: 3,
            padding: "70px 9%",
            minHeight: "calc(100vh - 76px)",
          }}
        >

          {/* ================= WELCOME ================= */}

          <div
            style={{
              marginBottom: "40px",
            }}
          >

            <span
              style={{
                color: "#72ed91",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
              }}
            >
              YOUR PERSONAL DASHBOARD
            </span>

            <h1
              style={{
                fontFamily:
                  '"Playfair Display", serif',
                fontSize: "48px",
                marginTop: "12px",
                color: "#f0f5f1",
              }}
            >
              Welcome,{" "}

              <span
                style={{
                  color: "#7cf18f",
                }}
              >
                {formData.name}
              </span>
              .
            </h1>

            <p
              style={{
                color: "#929e97",
                marginTop: "12px",
                fontSize: "16px",
              }}
            >
              Let's make today a healthier day.
            </p>

          </div>

          {/* ================= PROFILE SUMMARY ================= */}

          <section
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
              }}
            >
              <div className="feature-icon">
                🎂
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
              }}
            >
              <div className="feature-icon">
                📏
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
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginBottom: "35px",
            }}
          >

            {/* GOAL */}

            <div
              className="feature-card"
              style={{
                minHeight: "240px",
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
                {formData.goal}
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
              }}
            >
              <div className="feature-icon">
                🔥
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

          </section>

          {/* =================================================
              PERSONALIZED AI INSIGHT
          ================================================= */}

          <section
            className="feature-card"
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
            className="feature-card"
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

                <h2
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Nutrition overview
                </h2>

              </div>

              <div
                style={{
                  color: "#8df39b",
                  fontWeight: "600",
                }}
              >
                {totalMealCalories} /{" "}
                {dailyCalories} kcal
              </div>

            </div>

            {/* CALORIE PROGRESS */}

            <div
              style={{
                marginTop: "25px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>
                  Calories
                </span>

                <span>
                  {caloriePercentage}%
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "9px",
                  background:
                    "rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >

                <div
                  style={{
                    width:
                      `${caloriePercentage}%`,
                    height: "100%",
                    background:
                      "#7cf18f",
                    borderRadius: "20px",
                    transition:
                      "width 0.4s ease",
                  }}
                />

              </div>

            </div>

            {/* PROTEIN */}

            <div
              style={{
                marginTop: "20px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "8px",
                }}
              >

                <span>
                  Protein
                </span>

                <span>
                  {totalProtein} /{" "}
                  {proteinTarget} g
                </span>

              </div>

              <div
                style={{
                  width: "100%",
                  height: "9px",
                  background:
                    "rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >

                <div
                  style={{
                    width:
                      `${proteinPercentage}%`,
                    height: "100%",
                    background:
                      "#a7e88c",
                    borderRadius: "20px",
                    transition:
                      "width 0.4s ease",
                  }}
                />

              </div>

            </div>

            {/* QUICK SUMMARY */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                marginTop: "25px",
              }}
            >

              <div
                style={{
                  padding: "15px",
                  borderRadius: "15px",
                  background:
                    "rgba(255,255,255,0.03)",
                }}
              >

                <span
                  style={{
                    color: "#929e97",
                    fontSize: "12px",
                  }}
                >
                  CALORIE TARGET
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "#8df39b",
                    fontSize: "18px",
                  }}
                >
                  {dailyCalories} kcal
                </strong>

              </div>

              <div
                style={{
                  padding: "15px",
                  borderRadius: "15px",
                  background:
                    "rgba(255,255,255,0.03)",
                }}
              >

                <span
                  style={{
                    color: "#929e97",
                    fontSize: "12px",
                  }}
                >
                  PROTEIN TARGET
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "#8df39b",
                    fontSize: "18px",
                  }}
                >
                  {proteinTarget} g
                </strong>

              </div>

              <div
                style={{
                  padding: "15px",
                  borderRadius: "15px",
                  background:
                    "rgba(255,255,255,0.03)",
                }}
              >

                <span
                  style={{
                    color: "#929e97",
                    fontSize: "12px",
                  }}
                >
                  WATER TARGET
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "#8df39b",
                    fontSize: "18px",
                  }}
                >
                  {waterTarget} glasses
                </strong>

              </div>

            </div>

          </section>

          {/* =================================================
              PERSONALIZED DAILY MEAL PLAN
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
                    {formData.goal}
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
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
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
                      setSelectedMeal(item.meal)
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
                          fontSize: "22px",
                        }}
                      >
                        {item.icon}
                      </span>

                    </div>

                    {item.meal ? (

                      <>

                        <div
                          style={{
                            fontSize: "30px",
                            marginTop: "15px",
                          }}
                        >
                          {item.meal.emoji}
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
                            marginTop: "12px",
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
                  PERSONALIZED FOR YOU
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
                  Based on your goal, activity level
                  and profile.
                </p>

                <p
                  style={{
                    marginTop: "8px",
                    color: "#929e97",
                    fontSize: "14px",
                  }}
                >
                  Tap any meal to view ingredients,
                  nutrition information and preparation
                  instructions.
                </p>

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
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
                marginTop: "25px",
              }}
            >

              {displayedMeals.map(
                (meal) => (

                  <button
                    key={meal.id}
                    type="button"
                    onClick={() =>
                      setSelectedMeal(meal)
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
                      transition:
                        "transform 0.2s ease, background 0.2s ease",
                    }}
                  >

                    <div
                      style={{
                        fontSize: "36px",
                      }}
                    >
                      {meal.emoji}
                    </div>

                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "10px",
                        color: "#72ed91",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "1px",
                      }}
                    >
                      {meal.type.toUpperCase()}
                    </span>

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
                        marginTop: "15px",
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

        {selectedMeal && (

          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedMeal(null)
            }
          >

            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
              style={{
                maxWidth: "650px",
                maxHeight: "85vh",
                overflowY: "auto",
              }}
            >

              <button
                className="close-button"
                onClick={() =>
                  setSelectedMeal(null)
                }
              >
                ×
              </button>

              <div
                style={{
                  fontSize: "50px",
                  marginBottom: "10px",
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
                  marginTop: "10px",
                }}
              >
                {selectedMeal.name}
              </h2>

              <p
                style={{
                  marginTop: "10px",
                }}
              >
                {selectedMeal.description}
              </p>

              {/* NUTRITION */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                  marginTop: "25px",
                }}
              >

                <div
                  style={{
                    padding: "15px",
                    borderRadius: "15px",
                    background:
                      "rgba(124,241,143,0.08)",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#929e97",
                    }}
                  >
                    CALORIES
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#8df39b",
                      fontSize: "22px",
                    }}
                  >
                    {selectedMeal.calories}
                    {" "}kcal
                  </strong>

                </div>

                <div
                  style={{
                    padding: "15px",
                    borderRadius: "15px",
                    background:
                      "rgba(124,241,143,0.08)",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#929e97",
                    }}
                  >
                    PROTEIN
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#8df39b",
                      fontSize: "22px",
                    }}
                  >
                    {selectedMeal.protein}
                    {" "}g
                  </strong>

                </div>

              </div>

              {/* INGREDIENTS */}

              <div
                style={{
                  marginTop: "30px",
                }}
              >

                <h3>
                  🥗 Ingredients
                </h3>

                <ul
                  style={{
                    marginTop: "12px",
                    paddingLeft: "20px",
                  }}
                >

                  {selectedMeal.ingredients.map(
                    (ingredient, index) => (

                      <li
                        key={index}
                        style={{
                          marginBottom: "8px",
                          color: "#c1cbc5",
                        }}
                      >
                        {ingredient}
                      </li>

                    )
                  )}

                </ul>

              </div>

              {/* INSTRUCTIONS */}

              <div
                style={{
                  marginTop: "30px",
                }}
              >

                <h3>
                  👩‍🍳 Preparation
                </h3>

                <p
                  style={{
                    marginTop: "12px",
                    lineHeight: "1.7",
                    color: "#c1cbc5",
                  }}
                >
                  {selectedMeal.instructions}
                </p>

              </div>

              <button
                className="primary-button"
                style={{
                  width: "100%",
                  marginTop: "30px",
                }}
                onClick={() =>
                  setSelectedMeal(null)
                }
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

      <nav className="navbar">

        <div className="logo">
          <span>✦</span>
          NutriAI
        </div>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#features">
            Features
          </a>

          <a href="#about">
            About
          </a>

          <button
            className="nav-button"
            onClick={openModal}
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

        <section className="hero-content">

          <div className="badge">

            <span className="badge-dot"></span>

            YOUR DAILY WELLNESS

          </div>

          <h1>

            Eat smart.

            <br />

            <span>
              Live well.
            </span>

          </h1>

          <p>
            Your personalized AI nutrition companion,
            helping you make smarter food choices and
            build healthier habits every day.
          </p>

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
                  Choose what you would like NutriAI
                  to help you achieve.
                </p>

                <div className="form-grid">

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Eat healthier"
                      )
                    }
                  >
                    🥗 Eat healthier
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Lose weight"
                      )
                    }
                  >
                    ⚖️ Lose weight
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Gain weight"
                      )
                    }
                  >
                    📈 Gain weight
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Build muscle"
                      )
                    }
                  >
                    💪 Build muscle
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Improve fitness"
                      )
                    }
                  >
                    🔥 Improve fitness
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Maintain weight"
                      )
                    }
                  >
                    🧘 Maintain weight
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Improve hydration"
                      )
                    }
                  >
                    💧 Improve hydration
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Improve nutrition"
                      )
                    }
                  >
                    🥦 Improve nutrition
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Healthy lifestyle"
                      )
                    }
                  >
                    ❤️ Healthy lifestyle
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleGoalSelect(
                        "Overall wellness"
                      )
                    }
                  >
                    ✨ Overall wellness
                  </button>

                </div>

                <button
                  type="button"
                  className="nav-button"
                  style={{
                    width: "100%",
                    marginTop: "15px",
                  }}
                  onClick={() =>
                    setStep(1)
                  }
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

export default App;