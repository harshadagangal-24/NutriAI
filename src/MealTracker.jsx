import { useState } from "react";

function MealTracker({ meals, setMeals }) {
  const [showForm, setShowForm] = useState(false);

  const [mealData, setMealData] = useState({
    type: "",
    food: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const handleChange = (e) => {
    setMealData({
      ...mealData,
      [e.target.name]: e.target.value,
    });
  };

  const addMeal = (e) => {
    e.preventDefault();

    const newMeal = {
      ...mealData,
      id: Date.now(),
    };

    setMeals([...meals, newMeal]);

    setMealData({
      type: "",
      food: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });

    setShowForm(false);
  };

  const deleteMeal = (id) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  const totalCalories = meals.reduce(
    (total, meal) => total + Number(meal.calories || 0),
    0
  );

  const totalProtein = meals.reduce(
    (total, meal) => total + Number(meal.protein || 0),
    0
  );

  const totalCarbs = meals.reduce(
    (total, meal) => total + Number(meal.carbs || 0),
    0
  );

  const totalFats = meals.reduce(
    (total, meal) => total + Number(meal.fats || 0),
    0
  );

  return (
    <section className="meal-tracker-section">

      {/* ================= HEADING ================= */}

      <div className="meal-tracker-heading">

        <div>
          <span className="dashboard-label">
            MEAL TRACKER
          </span>

          <h2>
            Today's meals
          </h2>

          <p>
            Keep track of what you eat throughout the day.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "× Close" : "+ Add meal"}
        </button>

      </div>


      {/* ================= ADD MEAL FORM ================= */}

      {showForm && (

        <div className="add-meal-panel">

          <div className="add-meal-header">

            <div>
              <span className="dashboard-label">
                NEW MEAL
              </span>

              <h3>
                Add what you ate
              </h3>
            </div>

            <span className="meal-form-icon">
              🍽️
            </span>

          </div>


          <form onSubmit={addMeal}>

            <div className="meal-form-grid">

              {/* MEAL TYPE */}

              <select
                name="type"
                value={mealData.type}
                onChange={handleChange}
                required
              >
                <option value="">
                  Meal type
                </option>

                <option value="Breakfast">
                  🌅 Breakfast
                </option>

                <option value="Lunch">
                  ☀️ Lunch
                </option>

                <option value="Dinner">
                  🌙 Dinner
                </option>

                <option value="Snack">
                  🍎 Snack
                </option>
              </select>


              {/* FOOD */}

              <input
                type="text"
                name="food"
                placeholder="Food name"
                value={mealData.food}
                onChange={handleChange}
                required
              />


              {/* CALORIES */}

              <input
                type="number"
                name="calories"
                placeholder="Calories (kcal)"
                value={mealData.calories}
                onChange={handleChange}
                min="0"
                required
              />


              {/* PROTEIN */}

              <input
                type="number"
                name="protein"
                placeholder="Protein (g)"
                value={mealData.protein}
                onChange={handleChange}
                min="0"
                required
              />


              {/* CARBS */}

              <input
                type="number"
                name="carbs"
                placeholder="Carbs (g)"
                value={mealData.carbs}
                onChange={handleChange}
                min="0"
                required
              />


              {/* FATS */}

              <input
                type="number"
                name="fats"
                placeholder="Fats (g)"
                value={mealData.fats}
                onChange={handleChange}
                min="0"
                required
              />

            </div>


            <button
              type="submit"
              className="primary-button"
            >
              Add meal →
            </button>

          </form>

        </div>

      )}


      {/* ================= NUTRITION SUMMARY ================= */}

      <div className="meal-summary">

        <div className="meal-summary-card">

          <span>
            🔥
          </span>

          <div>
            <small>
              CALORIES
            </small>

            <strong>
              {totalCalories}
              <em> kcal</em>
            </strong>
          </div>

        </div>


        <div className="meal-summary-card">

          <span>
            🥩
          </span>

          <div>
            <small>
              PROTEIN
            </small>

            <strong>
              {totalProtein}
              <em> g</em>
            </strong>
          </div>

        </div>


        <div className="meal-summary-card">

          <span>
            🍚
          </span>

          <div>
            <small>
              CARBS
            </small>

            <strong>
              {totalCarbs}
              <em> g</em>
            </strong>
          </div>

        </div>


        <div className="meal-summary-card">

          <span>
            🥑
          </span>

          <div>
            <small>
              FATS
            </small>

            <strong>
              {totalFats}
              <em> g</em>
            </strong>
          </div>

        </div>

      </div>


      {/* ================= MEAL LIST ================= */}

      <div className="meal-list">

        {meals.length === 0 ? (

          <div className="empty-meals">

            <div className="empty-meal-icon">
              🍽️
            </div>

            <h3>
              No meals added yet
            </h3>

            <p>
              Start tracking your meals to see
              your daily nutrition progress.
            </p>

          </div>

        ) : (

          meals.map((meal) => (

            <div
              className="meal-item"
              key={meal.id}
            >

              <div className="meal-icon">

                {meal.type === "Breakfast" && "🌅"}

                {meal.type === "Lunch" && "☀️"}

                {meal.type === "Dinner" && "🌙"}

                {meal.type === "Snack" && "🍎"}

              </div>


              <div className="meal-info">

                <strong>
                  {meal.food}
                </strong>

                <span>
                  {meal.type} • {meal.protein}g protein
                </span>

              </div>


              <div className="meal-calories">

                <strong>
                  {meal.calories}
                </strong>

                <span>
                  kcal
                </span>

              </div>


              <button
                className="delete-meal-button"
                onClick={() => deleteMeal(meal.id)}
              >
                ×
              </button>

            </div>

          ))

        )}

      </div>

    </section>
  );
}

export default MealTracker;