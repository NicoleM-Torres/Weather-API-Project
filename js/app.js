document.addEventListener("DOMContentLoaded", () => {
  // SET DEFAULT CITY : GAUTIER, MISSISSIPPI
  const defaultCity = "Gautier, Mississippi";
  const latitude = 30.4057; // LATITUDE
  const longitude = -88.5853; // LONGITUDE

  // FETCH INFORMATION USING THE COORDINATES FOR THE DEFAULT CITY
  getGridPointInfo(latitude, longitude, defaultCity);
});

// FUNCTION TO FETCH INFORMATION BASED ON LATITUDE AND LONGITUDE
function getGridPointInfo(lat, lon, location) {
  // FETCH INFORMATION FROM THE NWS
  fetch(`https://api.weather.gov/points/${lat},${lon}`)
    .then((response) => response.json())
    .then((data) => {
      const { gridId, gridX, gridY } = data.properties;

      // FETCH THE FORECAST DATA USING GRID POINT INFORMATION
      return fetch(
        `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`
      );
    })
    .then((response) => response.json())
    .then((data) => {
      displayWeatherInfo(data.properties.periods, location);
    })
    .catch(() => {
      showErrorMessage(
        "ERROR: Failed to fetch weather data. Please try again."
      );
    });
}
// FUNCTION TO DISPLAY WEATHER INFORMATION
function displayWeatherInfo(forecastData, location) {
  const today = forecastData[0]; // GET TODAY'S FORECAST
  const nextDays = forecastData.slice(1, 7); // GET NEXT 6 DAYS' FORECAST

  // Update main display
  document.getElementById("cityName").textContent = location;
  document.getElementById("weatherCondition").textContent = today.shortForecast;
  document.getElementById(
    "currentTemperature"
  ).textContent = `${today.temperature}°${today.temperatureUnit}`;

  // Display pressure and dew point(humidity)
  document.getElementById("pressure").textContent =
    today.pressure || "Not available";
  document.getElementById("humidity").textContent = today.dewPoint
    ? `${today.dewPoint}°F`
    : "Not available";

  //generate and store high and low temps based off high/low daily temps
  const todayTemps = forecastData.slice(0, 2); // Get morning and afternoon temps
  const highTemperature = Math.max(
    ...todayTemps.map((period) => period.temperature)
  );
  const lowTemperature = Math.min(
    ...todayTemps.map((period) => period.temperature)
  );

  // Update high and low temp
  document.getElementById(
    "highTemperature"
  ).textContent = `${highTemperature}°F`;
  document.getElementById("lowTemperature").textContent = `${lowTemperature}°F`;

  // Display the 7-day forecast
  displaySevenDayForecast(nextDays);
}

// FUNCTION TO DISPLAY THE 7-DAY FORECAST
function displaySevenDayForecast(daysData) {
  const sevenDayForecast = document.getElementById("sevenDayForecast");
  sevenDayForecast.innerHTML = ""; // CLEAR FORECAST

  daysData.forEach((day) => {
    const highTemperature = Math.max(
      ...daysData.map((period) => period.temperature)
    );
    const lowTemperature = Math.min(
      ...daysData.map((period) => period.temperature)
    );

    const dayCard = `
      <div class="col forecastCard">
        <h5>${new Date(day.startTime).toLocaleDateString("en-US", {
          weekday: "long",
        })}</h5>
        <p>High: ${highTemperature}°F</p>
        <p>Low: ${lowTemperature}°F</p>
        <p>${day.shortForecast}</p>
        <img src="${day.icon}" alt="${day.shortForecast}">
      </div>`;
    sevenDayForecast.innerHTML += dayCard; // ADD THE DAY CARD TO THE FORECAST
  });
}

// FUNCTION TO SHOW ERROR MESSAGES
function showErrorMessage(message) {
  alert(message);
}
