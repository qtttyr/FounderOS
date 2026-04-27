const getApiKey = () => localStorage.getItem("openweather_key") || "";
const getCity = () => localStorage.getItem("weather_city") || "Astana";

export async function fetchWeather() {
  const key = getApiKey();
  const city = getCity();
  if (!key) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      main: { temp: number };
      name: string;
    };
    return {
      temp: Math.round(data.main.temp),
      city: data.name,
    };
  } catch (e) {
    console.error("Weather fetch failed:", e);
    return null;
  }
}
