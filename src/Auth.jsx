import { useState } from "react";

import API from "./api";

import "./Auth.css";



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
    <span className="nutri-text">Nutri</span>
<span className="ai-text">AI</span>
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


function Auth({ onLogin }) {

 const [isLogin, setIsLogin] = useState(true);

 const [showForgotPassword, setShowForgotPassword] = useState(false);

 const [forgotEmail, setForgotEmail] = useState("");



 const [formData, setFormData] = useState({

  name: "",

  email: "",

  password: "",

  age: "",

  gender: "",

  height: "",

  weight: "",

  activity: "",

  goal: "",

  goals: [],

 });



 const [message, setMessage] = useState("");

 const [error, setError] = useState("");



 const handleChange = (e) => {

  setFormData({

   ...formData,

   [e.target.name]: e.target.value,

  });

 };



 const handleGoalToggle = (goal) => {

  setFormData((previous) => {

   const currentGoals = Array.isArray(previous.goals)

    ? previous.goals

    : [];



   const updatedGoals = currentGoals.includes(goal)

    ? currentGoals.filter((item) => item !== goal)

    : [...currentGoals, goal];



   return {

    ...previous,

    goals: updatedGoals,

    goal: updatedGoals[0] || "",

   };

  });

 };



 const handleSubmit = async (e) => {

  e.preventDefault();



  setMessage("");

  setError();



  if (!isLogin && (!formData.goals || formData.goals.length === 0)) {

   setError("Please select at least one nutrition goal.");

   return;

  }



  try {

   if (isLogin) {

    const response = await API.post("/auth/login", {

     email: formData.email,

     password: formData.password,

    });



    localStorage.setItem("token", response.data.token);



    setMessage("Login successful!");



    if (onLogin) {

     onLogin(response.data.user);

    }

   } else {

    await API.post("/auth/register", formData);



    setMessage("Registration successful! You can now login.");

    setIsLogin(true);

   }

  } catch (err) {

   setError(

    err.response?.data?.message ||

     "Something went wrong. Please try again."

   );

  }

 };



 const handleForgotPassword = async (e) => {

  e.preventDefault();



  setMessage("");

  setError("");



  if (!forgotEmail) {

   setError("Please enter your email address.");

   return;

  }



  try {

   const response = await API.post("/auth/forgot-password", {

    email: forgotEmail,

   });



   setMessage(

    response.data.message ||

     "If an account with that email exists, a password reset link has been sent."

   );



   setForgotEmail("");

  } catch (err) {

   setError(

    err.response?.data?.message ||

     "Failed to send password reset email. Please try again."

   );

  }

 };



 // ==========================

 // FORGOT PASSWORD SCREEN

 // ==========================



 if (showForgotPassword) {

  return (

   <div className="auth-page">

    <div className="auth-card">



     <NutriAILogo />



     <h2>Forgot Password?</h2>



     <p className="auth-subtitle">

      Enter your registered email and we'll send you a password reset

      link.

     </p>



     <form onSubmit={handleForgotPassword}>



      <input

       type="email"

       name="forgotEmail"

       placeholder="Email Address"

       value={forgotEmail}

       onChange={(e) => setForgotEmail(e.target.value)}

       required

      />



      <button type="submit" className="auth-button">

       Send Reset Link

      </button>



     </form>



     {message && (

      <p className="success-message">{message}</p>

     )}



     {error && (

      <p className="error-message">{error}</p>

     )}



     <div className="auth-switch">

      Remember your password?



      <button

       type="button"

       onClick={() => {

        setShowForgotPassword(false);

        setMessage("");

        setError("");

       }}

      >

       Back to Login

      </button>



     </div>



    </div>

   </div>

  );

 }



 return (

  <div className="auth-page">

   <div className="auth-card">



    <NutriAILogo />



    <h2>

     {isLogin ? "Welcome Back!" : "Create Your Account"}

    </h2>



    <p className="auth-subtitle">

     {isLogin

      ? "Login to continue your nutrition journey."

      : "Create an account for personalized nutrition guidance."}

    </p>



    <form onSubmit={handleSubmit}>



     {!isLogin && (

      <>



       <input

        type="text"

        name="name"

        placeholder="Full Name"

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

        required

       />



       <select

        name="gender"

        value={formData.gender}

        onChange={handleChange}

        required

       >

        <option value="">Select Gender</option>

        <option value="Male">Male</option>

        <option value="Female">Female</option>

        <option value="Other">Other</option>

       </select>



       <input

        type="number"

        name="height"

        placeholder="Height (cm)"

        value={formData.height}

        onChange={handleChange}

        required

       />



       <input

        type="number"

        name="weight"

        placeholder="Weight (kg)"

        value={formData.weight}

        onChange={handleChange}

        required

       />



       <select

        name="activity"

        value={formData.activity}

        onChange={handleChange}

        required

       >

        <option value="">Select Activity Level</option>

        <option value="Sedentary">Sedentary</option>

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



       {/* ==========================

           NUTRITION GOALS

       ========================== */}



       <div style={{ marginTop: "10px" }}>



        <p

         style={{

          marginBottom: "10px",

          color: "#ffffff",

          fontSize: "14px",

         }}

        >

         Nutrition Goals{" "}

         <span style={{ color: "#72ed91" }}>

          (Select all that apply)

         </span>

        </p>



        <div

         style={{

          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: "8px",

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



          const selected =

           formData.goals.includes(goal);



          return (

           <button

            key={goal}

            type="button"

            onClick={() => handleGoalToggle(goal)}

            style={{

             padding: "12px 10px",

             borderRadius: "10px",

             border: selected

              ? "1px solid #72ed91"

              : "1px solid rgba(255,255,255,0.15)",

             background: selected

              ? "rgba(114,237,145,0.12)"

              : "rgba(255,255,255,0.04)",

             color: "#ffffff",

             cursor: "pointer",

             fontSize: "13px",

             textAlign: "left",

             transition: "0.2s",

            }}

           >

            {icon} {goal}

           </button>

          );



         })}



        </div>



       </div>



      </>

     )}



     <input

      type="email"

      name="email"

      placeholder="Email Address"

      value={formData.email}

      onChange={handleChange}

      required

     />



     <input

      type="password"

      name="password"

      placeholder="Password"

      value={formData.password}

      onChange={handleChange}

      required

     />



     <button type="submit" className="auth-button">

      {isLogin ? "Login" : "Create Account"}

     </button>



    </form>



    {isLogin && (

     <div

      style={{

       textAlign: "right",

       marginTop: "10px",

       marginBottom: "5px",

      }}

     >



      <button

       type="button"

       onClick={() => {

        setShowForgotPassword(true);

        setMessage("");

        setError("");

       }}

       style={{

        background: "none",

        border: "none",

        color: "#ffffff",

        cursor: "pointer",

        padding: "4px 0",

        fontSize: "14px",

        textDecoration: "underline",

       }}

      >

       Forgot Password?

      </button>



     </div>

    )}



    {message && (

     <p className="success-message">{message}</p>

    )}



    {error && (

     <p className="error-message">{error}</p>

    )}



    <div className="auth-switch">



     {isLogin

      ? "Don't have an account?"

      : "Already have an account?"}



     <button

      type="button"

      onClick={() => {

       setIsLogin(!isLogin);

       setMessage("");

       setError("");

      }}

     >

      {isLogin ? "Register" : "Login"}

     </button>



    </div>



   </div>

  </div>

 );

}



export default Auth;