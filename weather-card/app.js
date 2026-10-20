/**
 * weather-card — Vanilla JS weather widget
 * Powered by OpenWeatherMap API (https://openweathermap.org/api)
 *
 * 1. Get a free API key at https://openweathermap.org/api
 * 2. Replace the placeholder below with your key.
 */

const API_KEY = "YOUR_API_KEY_HERE"; // <-- replace this
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ── DOM References ──────────────────────────────────────────────────────────
const cityInput   = document.getElementById("cityInput");
const searchBtn   = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");
const errorMsg    = document.getElementById("error-msg");

const cityNameEl  = document.getElementById("cityName");
const dateEl      = document.getElementById("dateDisplay");
const iconEl      = document.getElementById("weatherIcon");
const tempEl      = document.getElementById("temperature");
const descEl      = document.getElementById("description");
const humidityEl  = document.getElementById("humidity");
const windEl      = document.getElementById("wind");
const visibilityEl= document.getElementById("visibility");
const feelsLikeEl = document.getElementById("feelsLike");
const toggleUnit  = document.getElementById("toggleUnit");

// ── State ───────────────────────────────────────────────────────────────────
let currentTempCelsius = null;
let useCelsius = true;

// ── Helpers ─────────────────────────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}

function hideError() {
  errorMsg.classList.add("hidden");
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function kelvinToCelsius(k) {
  return Math.round(k - 273.15);
}

function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

function displayTemperature() {
  if (currentTempCelsius === null) return;
  if (useCelsius) {
    tempEl.textContent = `${currentTempCelsius}°C`;
    feelsLikeEl.textContent = `${feelsLikeEl.dataset.celsius}°C`;
  } else {
    tempEl.textContent = `${celsiusToFahrenheit(currentTempCelsius)}°F`;
    feelsLikeEl.textContent = `${celsiusToFahrenheit(Number(feelsLikeEl.dataset.celsius))}°F`;
  }
}

// ── Fetch Weather ────────────────────────────────────────────────────────────
async function fetchWeather(city) {
  hideError();
  searchBtn.textContent = "…";
  searchBtn.disabled = true;

  try {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      throw new Error("Please add your OpenWeatherMap API key in app.js.");
    }

    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    const res = await fetch(url);

    if (res.status === 404) throw new Error(`City "${city}" not found. Check the spelling and try again.`);
    if (res.status === 401) throw new Error("Invalid API key. Check your key in app.js.");
    if (!res.ok) throw new Error(`Unexpected error (${res.status}). Please try again.`);

    const data = await res.json();
    renderWeather(data);
  } catch (err) {
    showError(err.message);
  } finally {
    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
  }
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderWeather(data) {
  const tempC      = kelvinToCelsius(data.main.temp);
  const feelsC     = kelvinToCelsius(data.main.feels_like);
  const iconCode   = data.weather[0].icon;
  const windKmh    = Math.round(data.wind.speed * 3.6);
  const visKm      = data.visibility ? (data.visibility / 1000).toFixed(1) : "N/A";

  currentTempCelsius = tempC;
  useCelsius = true;

  cityNameEl.textContent   = `${data.name}, ${data.sys.country}`;
  dateEl.textContent       = formatDate(new Date());
  iconEl.src               = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  iconEl.alt               = data.weather[0].description;
  descEl.textContent       = data.weather[0].description;
  humidityEl.textContent   = `${data.main.humidity}%`;
  windEl.textContent       = `${windKmh} km/h`;
  visibilityEl.textContent = `${visKm} km`;

  feelsLikeEl.textContent      = `${feelsC}°C`;
  feelsLikeEl.dataset.celsius  = feelsC;

  tempEl.textContent = `${tempC}°C`;

  weatherCard.classList.remove("hidden");
}

// ── Events ───────────────────────────────────────────────────────────────────
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) { showError("Please enter a city name."); return; }
  fetchWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

toggleUnit.addEventListener("click", () => {
  useCelsius = !useCelsius;
  displayTemperature();
});
