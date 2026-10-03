import axios from "axios";

const API = axios.create({
  baseURL: "https://nutriai-87lk.onrender.com/api"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================================================
// ML FOOD RECOMMENDATIONS
// ============================================================

export const getFoodRecommendations = async ({
  nutrition,
  foodPreference,
  mealType,
  goal,
  allergies
}) => {
  const response = await API.post("/ai/recommend", {
    nutrition,
    foodPreference,
    mealType,
    goal,
    allergies
  });

  return response.data;
};

export default API;