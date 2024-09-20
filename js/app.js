document.addEventListener("DOMContentLoaded", () => {
  // SET THE DEFAULT CITY TO GAUTIER, MISSISSIPPI
  const defaultCity = "Gautier, Mississippi";
  const latitude = 30.4057; // LATITUDE FOR GAUTIER, MS
  const longitude = -88.5853; // LONGITUDE FOR GAUTIER, MS

  // FETCH GRID POINT INFORMATION USING THE COORDINATES FOR THE DEFAULT CITY
  getGridPointInfo(latitude, longitude, defaultCity);
});

// FUNCTION TO FETCH GRID POINT INFORMATION BASED ON LATITUDE AND LONGITUDE
function getGridPointInfo(lat, lon, location) {
  // FETCH GRID POINT INFORMATION FROM THE NATIONAL WEATHER SERVICE API
  fetch(`https://api.weather.gov/points/${lat},${lon}`)
    .then((response) => response.json()) // CONVERT RESPONSE TO JSON
    .then((data) => {
      const { gridId, gridX, gridY } = data.properties; // EXTRACT GRID POINT INFORMATION

      // FETCH THE FORECAST DATA USING GRID POINT INFORMATION
      return fetch(
        `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`
      );
    })
    .then((response) => response.json()) // CONVERT FORECAST RESPONSE TO JSON
    .then((data) => {
      // DISPLAY WEATHER INFORMATION ON THE PAGE
      displayWeatherInfo(data.properties.periods, location);
    })
    .catch(() => {
      // HANDLE ERRORS IN FETCHING WEATHER DATA
      showErrorMessage("Failed to fetch weather data. Please try again.");
    });
}

// FUNCTION TO DISPLAY WEATHER INFORMATION
function displayWeatherInfo(forecastData, location) {
  const today = forecastData[0]; // GET TODAY'S FORECAST
  const nextDays = forecastData.slice(1, 7); // GET THE NEXT 6 DAYS' FORECAST

  // UPDATE THE HTML ELEMENTS WITH WEATHER INFORMATION
  document.getElementById("cityName").textContent = location;
  document.getElementById("weatherCondition").textContent = today.shortForecast;
  document.getElementById(
    "currentTemperature"
  ).textContent = `${today.temperature}°${today.temperatureUnit}`;

  // DISPLAY PRESSURE AND HUMIDITY
  // Ensure that pressure and dewPoint exist in the response
  document.getElementById("pressure").textContent = today.pressure
    ? `${today.pressure} ${today.pressureUnit}`
    : "Not available";
  document.getElementById("humidity").textContent = today.dewPoint
    ? `${today.dewPoint}°F`
    : "Not available"; // Dew Point as a proxy for humidity

  // DISPLAY HIGH AND LOW TEMPERATURES
  // Ensure that temperatureHigh and temperatureLow exist in the response
  document.getElementById("highTemperature").textContent = today.temperatureHigh
    ? `${today.temperatureHigh}°${today.temperatureUnit}`
    : "Not available";
  document.getElementById("lowTemperature").textContent = today.temperatureLow
    ? `${today.temperatureLow}°${today.temperatureUnit}`
    : "Not available";

  // DISPLAY THE 7-DAY FORECAST
  displaySevenDayForecast(nextDays);
}

// FUNCTION TO DISPLAY THE 7-DAY FORECAST
function displaySevenDayForecast(daysData) {
  const sevenDayForecast = document.getElementById("sevenDayForecast");
  sevenDayForecast.innerHTML = ""; // CLEAR PREVIOUS FORECAST

  // LOOP THROUGH EACH DAY'S DATA AND CREATE FORECAST CARDS
  daysData.forEach((day) => {
    const dayCard = `
      <div class="col forecastCard">
        <h5>${new Date(day.startTime).toLocaleDateString("en-US", {
          weekday: "long",
        })}</h5>
        <p>High: ${
          day.temperatureHigh
            ? `${day.temperatureHigh}°${day.temperatureUnit}`
            : "Not available"
        }</p>
        <p>Low: ${
          day.temperatureLow
            ? `${day.temperatureLow}°${day.temperatureUnit}`
            : "Not available"
        }</p>
        <p>${day.shortForecast}</p>
        <img src="${day.icon}" alt="${day.shortForecast}">
      </div>`;
    sevenDayForecast.innerHTML += dayCard; // ADD THE DAY CARD TO THE FORECAST SECTION
  });
}

// FUNCTION TO DISPLAY ERROR MESSAGES
function showErrorMessage(message) {
  alert(message); // SHOW ERROR MESSAGE IN AN ALERT BOX
}
