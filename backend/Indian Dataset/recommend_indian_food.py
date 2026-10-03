import csv
import json
import os
import sys
import numpy as np


# ============================================================
# NUTRIAI - INDIAN FOOD ML RECOMMENDER
# NumPy-only version
#
# This version does NOT use pandas, scikit-learn, or joblib.
# It performs K-Means clustering directly with NumPy.
# ============================================================


# ============================================================
# 1. GET USER INPUT
# ============================================================

if len(sys.argv) < 9:
    print("Missing user information.")
    print(
        "Usage: python recommend_indian_food.py "
        "calories protein carbs fat fiber sugar "
        "food_preference meal_type [goal] [allergies] [--json]"
    )
    sys.exit(1)

try:
    daily_calories = float(sys.argv[1])
    daily_protein = float(sys.argv[2])
    daily_carbohydrates = float(sys.argv[3])
    daily_fat = float(sys.argv[4])
    daily_fiber = float(sys.argv[5])
    daily_sugar = float(sys.argv[6])

    food_preference = sys.argv[7].strip()
    meal_type = sys.argv[8].strip()

    # Goal
    goal = (
        sys.argv[9].strip()
        if len(sys.argv) > 9 and sys.argv[9] != "--json"
        else "Healthy lifestyle"
    )

    # Allergies
    allergies = (
        sys.argv[10].strip()
        if len(sys.argv) > 10 and sys.argv[10] != "--json"
        else ""
    )

except Exception as error:
    print("Invalid input:", error)
    sys.exit(1)


json_output = "--json" in sys.argv


# ============================================================
# 2. NORMALIZE FOOD PREFERENCE
# ============================================================

food_preference_map = {
    "vegetarian": "Vegetarian",
    "veg": "Vegetarian",
    "non-vegetarian": "Non-Vegetarian",
    "non vegetarian": "Non-Vegetarian",
    "nonveg": "Non-Vegetarian",
    "non-veg": "Non-Vegetarian",
    "vegan": "Vegan",
}

food_preference = food_preference_map.get(
    food_preference.lower(),
    food_preference
)


# Normalize goal names.
goal_map = {
    "lose weight": "Lose weight",
    "gain weight": "Gain weight",
    "build muscle": "Build muscle",
    "improve fitness": "Improve fitness",
    "improve nutrition": "Improve nutrition",
    "improve hydration": "Improve hydration",
    "eat healthier": "Eat healthier",
    "healthy lifestyle": "Healthy lifestyle",
    "overall wellness": "Overall wellness",
    "maintain weight": "Maintain weight",
}

goal = goal_map.get(goal.lower(), goal)


# ============================================================
# 3. NORMALIZE MEAL TYPE
# ============================================================

meal_type_map = {
    "breakfast": "Breakfast",
    "main": "Main Meal",
    "main meal": "Main Meal",
    "lunch": "Main Meal",
    "dinner": "Main Meal",
    "snack": "Snack",
    "beverage": "Beverage",
    "drink": "Beverage",
    "drinks": "Beverage",
    "dessert": "Dessert",
}

meal_type = meal_type_map.get(
    meal_type.lower(),
    meal_type
)


# ============================================================
# 4. NORMALIZE ALLERGIES
# ============================================================

# Example:
# "peanuts, dairy" -> ["peanuts", "dairy"]

allergy_list = [
    item.strip().lower()
    for item in allergies.split(",")
    if item.strip()
]


# Common allergy-related terms.
# These allow the user to enter a general allergen while
# matching common food names/ingredients in the dataset.

allergy_keywords = {
    "peanut": [
        "peanut",
        "peanuts",
        "groundnut",
        "groundnuts",
        "moongphali",
    ],
    "dairy": [
        "milk",
        "dairy",
        "paneer",
        "cheese",
        "butter",
        "ghee",
        "cream",
        "curd",
        "yogurt",
        "yoghurt",
        "lassi",
        "khoa",
        "khoya",
        "malai",
    ],
    "milk": [
        "milk",
        "paneer",
        "cheese",
        "butter",
        "ghee",
        "cream",
        "curd",
        "yogurt",
        "yoghurt",
        "lassi",
        "khoa",
        "khoya",
        "malai",
    ],
    "egg": [
        "egg",
        "eggs",
        "omelette",
        "omelet",
        "anda",
        "ande",
    ],
    "eggs": [
        "egg",
        "eggs",
        "omelette",
        "omelet",
        "anda",
        "ande",
    ],
    "soy": [
        "soy",
        "soya",
        "soybean",
        "tofu",
        "soy sauce",
    ],
    "wheat": [
        "wheat",
        "atta",
        "maida",
        "flour",
        "bread",
        "roti",
        "chapati",
        "naan",
        "paratha",
    ],
    "gluten": [
        "wheat",
        "atta",
        "maida",
        "flour",
        "bread",
        "roti",
        "chapati",
        "naan",
        "paratha",
    ],
    "tree nuts": [
        "almond",
        "almonds",
        "cashew",
        "cashews",
        "walnut",
        "walnuts",
        "pistachio",
        "pistachios",
        "hazelnut",
        "hazelnuts",
    ],
    "nuts": [
        "almond",
        "almonds",
        "cashew",
        "cashews",
        "walnut",
        "walnuts",
        "pistachio",
        "pistachios",
        "hazelnut",
        "hazelnuts",
        "peanut",
        "peanuts",
        "groundnut",
        "groundnuts",
    ],
    "fish": [
        "fish",
        "machli",
        "salmon",
        "tuna",
        "sardine",
        "rohu",
        "pomfret",
    ],
    "shellfish": [
        "prawn",
        "prawns",
        "shrimp",
        "crab",
        "lobster",
        "shellfish",
    ],
}


def get_allergy_terms(allergy_names):
    terms = set()

    for allergy in allergy_names:
        allergy = allergy.strip().lower()

        if allergy in allergy_keywords:
            terms.update(allergy_keywords[allergy])
        else:
            terms.add(allergy)

    return terms


blocked_allergy_terms = get_allergy_terms(allergy_list)


def contains_allergen(food):
    """
    Checks food name and available ingredient-related fields
    for the user's selected allergens.
    """

    searchable_fields = [
        "Food",
        "Ingredients",
        "Ingredient",
        "Description",
        "HindiName",
    ]

    text_parts = []

    for field in searchable_fields:
        value = str(food.get(field, "") or "")
        if value:
            text_parts.append(value.lower())

    searchable_text = " ".join(text_parts)

    for term in blocked_allergy_terms:
        if term and term in searchable_text:
            return True

    return False


# ============================================================
# 5. FILE PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

dataset_file = os.path.join(
    BASE_DIR,
    "nutriai_indian_food_dataset.csv"
)


# ============================================================
# 6. LOAD CSV WITHOUT PANDAS
# ============================================================

if not os.path.exists(dataset_file):
    print("Indian food dataset not found!")
    print(dataset_file)
    sys.exit(1)

with open(
    dataset_file,
    "r",
    encoding="utf-8-sig",
    newline=""
) as file:

    reader = csv.DictReader(file)
    foods = list(reader)

print("Indian food records:", len(foods))


# ============================================================
# 7. CLEAN NUMERIC VALUES
# ============================================================

features = [
    "Calories",
    "Protein",
    "Carbohydrates",
    "Fat",
    "Fiber",
    "Sugar",
]

for food in foods:

    for column in features:

        try:
            value = str(food.get(column, "")).strip()
            food[column] = float(value)

        except (ValueError, TypeError):
            food[column] = 0.0

    food["Food"] = str(food.get("Food", ""))
    food["FoodType"] = str(food.get("FoodType", ""))
    food["MealType"] = str(food.get("MealType", ""))
    food["ServingUnit"] = str(food.get("ServingUnit", ""))

    food["Vegan"] = (
        str(food.get("Vegan", ""))
        .strip()
        .lower()
        == "true"
    )


# ============================================================
# 8. FILTER FOOD PREFERENCE
# ============================================================

if food_preference == "Vegetarian":

    filtered_foods = [
        food for food in foods
        if food["FoodType"] == "Vegetarian"
    ]

elif food_preference == "Non-Vegetarian":

    filtered_foods = [
        food for food in foods
        if food["FoodType"] == "Non-Vegetarian"
    ]

elif food_preference == "Vegan":

    filtered_foods = [
        food for food in foods
        if food["Vegan"]
    ]

else:

    print("Unknown food preference.")
    print("Using all foods.")

    filtered_foods = list(foods)

print(
    "Foods after preference filter:",
    len(filtered_foods)
)


# ============================================================
# 9. FILTER ALLERGIES
# ============================================================

if blocked_allergy_terms:

    allergy_filtered_foods = [
        food for food in filtered_foods
        if not contains_allergen(food)
    ]

    print(
        "Foods removed due to allergies:",
        len(filtered_foods) - len(allergy_filtered_foods)
    )

    filtered_foods = allergy_filtered_foods

else:

    print("No allergies specified.")


print(
    "Foods after allergy filter:",
    len(filtered_foods)
)


# ============================================================
# 10. FILTER MEAL TYPE
# ============================================================

meal_filtered_foods = [
    food for food in filtered_foods
    if food["MealType"] == meal_type
]

print(
    "Foods after meal filter:",
    len(meal_filtered_foods)
)


# ============================================================
# 11. FALLBACK IF TOO FEW FOODS
# ============================================================

if len(meal_filtered_foods) < 10:

    print("Not enough foods for selected meal.")

    # IMPORTANT:
    # Do NOT fall back to foods before the allergy filter.
    # Otherwise an allergen could return to recommendations.

    if len(filtered_foods) >= 10:
        print("Using all allergy-safe foods instead.")
        meal_filtered_foods = list(filtered_foods)

if not meal_filtered_foods:
    print("No suitable allergy-safe foods found.")
    sys.exit(1)


# ============================================================
# 12. BUILD NUMPY FEATURE MATRIX
# ============================================================

X = np.array(
    [
        [food[column] for column in features]
        for food in meal_filtered_foods
    ],
    dtype=float
)


# ============================================================
# 13. STANDARDIZE FEATURES
# ============================================================

mean = np.mean(X, axis=0)
std = np.std(X, axis=0)

std[std == 0] = 1.0

X_scaled = (X - mean) / std


# ============================================================
# 14. CUSTOM K-MEANS
# ============================================================

def kmeans(data, k=6, max_iterations=100):

    n_samples = len(data)

    if n_samples == 0:
        return np.array([], dtype=int), np.empty((0, data.shape[1]))

    k = min(k, n_samples)

    indices = np.linspace(
        0,
        n_samples - 1,
        k,
        dtype=int
    )

    centers = data[indices].copy()

    labels = np.zeros(n_samples, dtype=int)

    for _ in range(max_iterations):

        distances = np.sum(
            (data[:, None, :] - centers[None, :, :]) ** 2,
            axis=2
        )

        new_labels = np.argmin(
            distances,
            axis=1
        )

        new_centers = centers.copy()

        for cluster in range(k):

            members = data[
                new_labels == cluster
            ]

            if len(members) > 0:

                new_centers[cluster] = np.mean(
                    members,
                    axis=0
                )

        if np.array_equal(new_labels, labels):

            centers = new_centers
            labels = new_labels

            break

        if np.allclose(
            centers,
            new_centers,
            rtol=1e-5,
            atol=1e-6
        ):

            centers = new_centers
            labels = new_labels

            break

        centers = new_centers
        labels = new_labels

    return labels, centers


food_clusters, cluster_centers = kmeans(
    X_scaled,
    k=6
)

for food, cluster in zip(
    meal_filtered_foods,
    food_clusters
):

    food["ML_Cluster"] = int(cluster)


# ============================================================
# 15. USER NUTRITION TARGET
# ============================================================

meal_calories = daily_calories * 0.25
meal_protein = daily_protein * 0.25
meal_carbohydrates = daily_carbohydrates * 0.25
meal_fat = daily_fat * 0.25
meal_fiber = daily_fiber * 0.25
meal_sugar = daily_sugar * 0.25

target = np.array([
    meal_calories,
    meal_protein,
    meal_carbohydrates,
    meal_fat,
    meal_fiber,
    meal_sugar,
], dtype=float)


# ============================================================
# 16. PREDICT USER CLUSTER
# ============================================================

user_scaled = (
    (target - mean) / std
).reshape(1, -1)

user_distances = np.sum(
    (cluster_centers - user_scaled) ** 2,
    axis=1
)

user_cluster = int(
    np.argmin(user_distances)
)

print(
    "User nutritional cluster:",
    user_cluster
)


# ============================================================
# 17. CLUSTER MATCH
# ============================================================

for food in meal_filtered_foods:

    food["ClusterMatch"] = (
        1
        if food["ML_Cluster"] == user_cluster
        else 0
    )


# ============================================================
# 18. NUTRITION DIFFERENCE
# ============================================================

goal_weights = {

    "Lose weight": np.array([
        0.35, 0.30, 0.10, 0.08, 0.14, 0.03
    ]),

    "Gain weight": np.array([
        0.35, 0.28, 0.14, 0.15, 0.05, 0.03
    ]),

    "Build muscle": np.array([
        0.25, 0.40, 0.15, 0.08, 0.08, 0.04
    ]),

    "Improve fitness": np.array([
        0.25, 0.30, 0.15, 0.10, 0.15, 0.05
    ]),

    "Improve nutrition": np.array([
        0.20, 0.25, 0.15, 0.10, 0.25, 0.05
    ]),

    "Improve hydration": np.array([
        0.20, 0.20, 0.15, 0.10, 0.20, 0.15
    ]),

    "Eat healthier": np.array([
        0.25, 0.25, 0.15, 0.10, 0.20, 0.05
    ]),

    "Overall wellness": np.array([
        0.25, 0.30, 0.15, 0.10, 0.15, 0.05
    ]),

    "Maintain weight": np.array([
        0.25, 0.25, 0.15, 0.10, 0.20, 0.05
    ]),

    "Healthy lifestyle": np.array([
        0.25, 0.30, 0.15, 0.10, 0.15, 0.05
    ]),
}


weights = goal_weights.get(
    goal,
    goal_weights["Healthy lifestyle"]
)


for food in meal_filtered_foods:

    values = np.array([
        food["Calories"],
        food["Protein"],
        food["Carbohydrates"],
        food["Fat"],
        food["Fiber"],
        food["Sugar"],
    ])

    difference = (
        np.abs(values - target)
        / (target + 1e-6)
    )

    food["NutritionDifference"] = float(
        np.sum(difference * weights)
    )


# ============================================================
# 19. RECOMMENDATION SCORE
# ============================================================

for food in meal_filtered_foods:

    score = food["NutritionDifference"]

    # ML cluster bonus
    if food["ClusterMatch"] == 1:
        score -= 0.08

    # Goal-specific priorities.

    if goal == "Lose weight":

        if food["Protein"] >= meal_protein:
            score -= 0.08

        if food["Fiber"] >= meal_fiber:
            score -= 0.08

        if food["Calories"] > meal_calories * 1.25:
            score += 0.15

        if food["Fat"] > 25:
            score += 0.10

        if food["Sugar"] > 20:
            score += 0.12

    elif goal == "Gain weight":

        if food["Calories"] >= meal_calories:
            score -= 0.10

        if food["Protein"] >= meal_protein:
            score -= 0.08

        if food["Fat"] >= meal_fat:
            score -= 0.06

        if food["Calories"] < meal_calories * 0.60:
            score += 0.12

        if food["Protein"] < meal_protein * 0.60:
            score += 0.08

    elif goal == "Build muscle":

        if food["Protein"] >= meal_protein:
            score -= 0.14

        if food["Protein"] >= meal_protein * 1.25:
            score -= 0.08

        if food["Calories"] >= meal_calories * 0.85:
            score -= 0.05

        if food["Protein"] < meal_protein * 0.60:
            score += 0.15

        if food["Sugar"] > 30:
            score += 0.08

    elif goal == "Improve fitness":

        if food["Protein"] >= meal_protein:
            score -= 0.08

        if food["Fiber"] >= meal_fiber:
            score -= 0.05

        if food["Sugar"] > 30:
            score += 0.15

        if food["Fat"] > 35:
            score += 0.12

    elif goal == "Improve nutrition":

        if food["Fiber"] >= meal_fiber:
            score -= 0.10

        if food["Protein"] >= meal_protein:
            score -= 0.06

        if food["Sugar"] > 30:
            score += 0.12

    elif goal == "Improve hydration":

        if food["Sugar"] <= 15:
            score -= 0.08

        if food["Fiber"] >= meal_fiber:
            score -= 0.05

        if food["Sugar"] > 30:
            score += 0.12

    elif goal == "Eat healthier":

        if food["Fiber"] >= meal_fiber:
            score -= 0.08

        if food["Protein"] >= meal_protein:
            score -= 0.06

        if food["Sugar"] > 25:
            score += 0.10

        if food["Fat"] > 30:
            score += 0.08

    elif goal == "Overall wellness":

        if food["Protein"] >= meal_protein:
            score -= 0.06

        if food["Fiber"] >= meal_fiber:
            score -= 0.06

        if food["Sugar"] > 25:
            score += 0.10

    elif goal == "Maintain weight":

        if food["Protein"] >= meal_protein:
            score -= 0.06

        if food["Fiber"] >= meal_fiber:
            score -= 0.06

        if food["Calories"] > meal_calories * 1.5:
            score += 0.12

    else:

        if food["Protein"] >= meal_protein:
            score -= 0.08

        if food["Fiber"] >= meal_fiber:
            score -= 0.05

        if food["Sugar"] > 20:
            score += 0.15

        if food["Sugar"] > 30:
            score += 0.20

        if food["Fat"] > 25:
            score += 0.12

        if food["Fat"] > 35:
            score += 0.20

        if food["Calories"] > meal_calories * 1.5:
            score += 0.15

    food["RecommendationScore"] = float(score)


# ============================================================
# 20. INDIAN FOOD PRIORITY
# ============================================================

indian_keywords = [
    "dal", "dosa", "idli", "poha", "upma",
    "roti", "chapati", "paratha", "thepla",
    "cheela", "chilla", "khichdi", "biryani",
    "pulao", "sabzi", "paneer", "chole",
    "chana", "rajma", "sambar", "rasam",
    "kadhi", "thali", "pakora", "pakoda",
    "samosa", "dhokla", "khaman", "vada",
    "uttapam", "puri", "bhaji", "korma",
    "tikka", "naan", "rice", "lassi",
    "chai", "halwa", "kheer", "ladoo",
    "laddu", "kulfi"
]

strong_indian_keywords = [
    "dal", "dosa", "idli", "poha", "upma",
    "roti", "chapati", "paratha", "thepla",
    "cheela", "chilla", "khichdi", "biryani",
    "pulao", "sabzi", "paneer", "chole",
    "chana", "rajma", "sambar", "rasam",
    "kadhi", "dhokla", "khaman", "uttapam",
    "puri", "bhaji", "korma", "tikka",
    "naan", "halwa", "kheer", "ladoo",
    "laddu", "kulfi"
]

non_indian_keywords = [
    "chinese", "mexican", "italian", "pizza",
    "pasta", "burger", "sandwich", "noodle",
    "noodles", "taco", "nachos", "western"
]

for food in meal_filtered_foods:

    food_name = food["Food"].lower()

    if any(
        keyword in food_name
        for keyword in indian_keywords
    ):
        food["RecommendationScore"] -= 0.10

    if any(
        keyword in food_name
        for keyword in strong_indian_keywords
    ):
        food["RecommendationScore"] -= 0.08

    if any(
        keyword in food_name
        for keyword in non_indian_keywords
    ):
        food["RecommendationScore"] += 0.10


# ============================================================
# 21. FINAL ALLERGY SAFETY CHECK
# ============================================================

# This is an additional safety check before sorting/output.
# Even if an allergen somehow passed an earlier filter,
# it will NOT be included in the final recommendations.

meal_filtered_foods = [
    food
    for food in meal_filtered_foods
    if not contains_allergen(food)
]

if not meal_filtered_foods:
    print("No allergy-safe foods available.")
    sys.exit(1)


# ============================================================
# 22. SORT + REMOVE DUPLICATES
# ============================================================

recommendations = sorted(
    meal_filtered_foods,
    key=lambda food: food["RecommendationScore"]
)

seen = set()
top_foods = []

for food in recommendations:

    name = food["Food"].strip().lower()

    if name in seen:
        continue

    seen.add(name)
    top_foods.append(food)

    if len(top_foods) == 100:
        break


# ============================================================
# 23. DISPLAY RESULT
# ============================================================

print("\n========================================")
print("NUTRIAI PERSONALIZED ML RECOMMENDER")
print("========================================")

print("\nFood Preference:", food_preference)
print("Meal Type:", meal_type)
print("Allergies:", allergies if allergies else "None")

print("\nTop 100 Recommendations:")

for rank, food in enumerate(
    top_foods,
    start=1
):

    print(
        f"{rank}. {food['Food']} | "
        f"{food['Calories']:.1f} kcal | "
        f"{food['Protein']:.1f} g protein | "
        f"Cluster {food['ML_Cluster']}"
    )

print("\n========================================")
print("PERSONALIZED ML RECOMMENDATION COMPLETE")
print("========================================")


# ============================================================
# 24. JSON OUTPUT FOR NODE.JS
# ============================================================

if json_output:

    result = {
        "foodPreference": food_preference,
        "goal": goal,
        "mealType": meal_type,
        "allergies": allergy_list,
        "userCluster": user_cluster,
        "recommendations": []
    }

    for rank, food in enumerate(
        top_foods,
        start=1
    ):

        result["recommendations"].append({

            "rank": rank,

            "food": str(food["Food"]),

            "calories": round(
                float(food["Calories"]), 1
            ),

            "protein": round(
                float(food["Protein"]), 1
            ),

            "carbohydrates": round(
                float(food["Carbohydrates"]), 1
            ),

            "fat": round(
                float(food["Fat"]), 1
            ),

            "fiber": round(
                float(food["Fiber"]), 1
            ),

            "sugar": round(
                float(food["Sugar"]), 1
            ),

            "serving": str(food["ServingUnit"]),

            "mlCluster": int(food["ML_Cluster"]),

            "recommendationScore": round(
                float(food["RecommendationScore"]), 3
            )
        })

    print(
        json.dumps(
            result,
            ensure_ascii=False
        )
    )