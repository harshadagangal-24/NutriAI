function Dashboard({ userData, onBack }) {
  return (
    <div className="dashboard">

      {/* ================= DASHBOARD NAVBAR ================= */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          <span>✦</span>
          NutriAI
        </div>

        <div className="dashboard-nav-right">

          <span className="dashboard-user">
            {userData.name || "User"}
          </span>

          <button
            className="dashboard-back-button"
            onClick={onBack}
          >
            ← Home
          </button>

        </div>

      </nav>


      {/* ================= DASHBOARD CONTENT ================= */}

      <main className="dashboard-content">

        {/* WELCOME */}

        <section className="dashboard-welcome">

          <div>

            <span className="dashboard-label">
              YOUR PERSONAL DASHBOARD
            </span>

            <h1>
              Good to see you,{" "}
              <span>{userData.name || "there"}.</span>
            </h1>

            <p>
              Here's your personalized nutrition overview
              to help you make healthier choices every day.
            </p>

          </div>

          <div className="dashboard-date">
            <span>✦</span>
            Your wellness journey starts here
          </div>

        </section>


        {/* ================= SUMMARY CARDS ================= */}

        <section className="dashboard-summary">

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🔥
            </div>

            <span>DAILY CALORIES</span>

            <h2>1,850</h2>

            <p>kcal recommended</p>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              💧
            </div>

            <span>WATER INTAKE</span>

            <h2>5 / 8</h2>

            <p>glasses today</p>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🥗
            </div>

            <span>PROTEIN</span>

            <h2>72g</h2>

            <p>daily target: 100g</p>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              ✦
            </div>

            <span>ACTIVITY</span>

            <h2 className="activity-value">
              {userData.activity || "Not set"}
            </h2>

            <p>your current activity level</p>

          </div>

        </section>


        {/* ================= LOWER DASHBOARD ================= */}

        <section className="dashboard-grid">


          {/* TODAY'S NUTRITION */}

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>
                <span className="dashboard-label">
                  TODAY
                </span>

                <h2>
                  Nutrition overview
                </h2>
              </div>

              <span className="panel-icon">
                ◌
              </span>

            </div>


            <div className="nutrition-progress">

              <div className="progress-info">
                <span>Calories</span>
                <strong>1,240 / 1,850 kcal</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill calories"
                  style={{ width: "67%" }}
                ></div>
              </div>

            </div>


            <div className="nutrition-progress">

              <div className="progress-info">
                <span>Protein</span>
                <strong>72 / 100 g</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill protein"
                  style={{ width: "72%" }}
                ></div>
              </div>

            </div>


            <div className="nutrition-progress">

              <div className="progress-info">
                <span>Water</span>
                <strong>5 / 8 glasses</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill water"
                  style={{ width: "62%" }}
                ></div>
              </div>

            </div>

          </div>


          {/* ================= AI RECOMMENDATION ================= */}

          <div className="ai-panel">

            <div className="ai-icon">
              ✦
            </div>

            <span className="dashboard-label">
              AI INSIGHT
            </span>

            <h2>
              A little guidance
              <br />
              for today.
            </h2>

            <p>
              Try adding more protein and leafy
              vegetables to your meals today.
              Small changes can make a big difference
              over time.
            </p>

            <button className="ai-button">
              View recommendations
              <span>→</span>
            </button>

          </div>

        </section>


        {/* ================= MEALS ================= */}

        <section className="meals-section">

          <div className="meals-heading">

            <div>

              <span className="dashboard-label">
                MEAL TRACKER
              </span>

              <h2>
                Today's meals
              </h2>

            </div>

            <button className="add-meal-button">
              + Add meal
            </button>

          </div>


          <div className="meal-list">

            <div className="meal-item">

              <div className="meal-icon">
                🌅
              </div>

              <div className="meal-info">

                <strong>
                  Breakfast
                </strong>

                <span>
                  Not added yet
                </span>

              </div>

              <span className="meal-calories">
                —
              </span>

            </div>


            <div className="meal-item">

              <div className="meal-icon">
                ☀️
              </div>

              <div className="meal-info">

                <strong>
                  Lunch
                </strong>

                <span>
                  Not added yet
                </span>

              </div>

              <span className="meal-calories">
                —
              </span>

            </div>


            <div className="meal-item">

              <div className="meal-icon">
                🌙
              </div>

              <div className="meal-info">

                <strong>
                  Dinner
                </strong>

                <span>
                  Not added yet
                </span>

              </div>

              <span className="meal-calories">
                —
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;