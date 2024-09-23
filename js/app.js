document.addEventListener("DOMContentLoaded", () => {
  // SET THE DEFAULT CITY TO GAUTIER, MISSISSIPPI
  const defaultCity = "Gautier, Mississippi";
  const latitude = 30.4057; // LATITUDE FOR GAUTIER, MS
  const longitude = -88.5853; // LONGITUDE FOR GAUTIER, MS

  // FETCH GRID POINT INFORMATION USING THE COORDINATES FOR THE DEFAULT CITY
  getGridPointInfo(latitude, longitude, defaultCity);
});

// Function to fetch grid point information based on latitude and longitude
function getGridPointInfo(lat, lon, location) {
  fetch(`https://api.weather.gov/points/${lat},${lon}`)
    .then((response) => response.json())
    .then((data) => {
      const { gridId, gridX, gridY } = data.properties;

      // Fetch the forecast data using grid point information
      fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`)
        .then((response) => response.json())
        .then((data) => {
          displayWeatherInfo(data.properties.periods, location);

          // Fetch current observations for pressure and dew point
          getGridPointObservations(gridId, gridX, gridY);
        })
        .catch(() => {
          showErrorMessage("Failed to fetch forecast data.");
        });
    })
    .catch(() => {
      showErrorMessage("Failed to fetch grid point information.");
    });
}

// Function to fetch grid point observations for current pressure and dew point
function getGridPointObservations(gridId, gridX, gridY) {
  fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/observations/latest`)
    .then((response) => response.json())
    .then((data) => {
      const observation = data.properties;
      
      // Extract and display pressure
      const pressureValue = observation.barometricPressure
        ? (observation.barometricPressure.value / 100).toFixed(2) + " hPa"  // Convert to hPa
        : "Not available";

      // Extract and display dew point (as a proxy for humidity)
      const dewPointValue = observation.dewpoint
        ? observation.dewpoint.value.toFixed(1) + "°F"
        : "Not available";

      // Update elements with actual data
      document.getElementById("pressure").textContent = pressureValue;
      document.getElementById("humidity").textContent = dewPointValue;
    })
    .catch(() => {
      // Handle errors in fetching observations
      document.getElementById("pressure").textContent = "Not available";
      document.getElementById("humidity").textContent = "Not available";
    });
}

// Function to display weather information from forecast data
function displayWeatherInfo(forecastData, location) {
  const today = forecastData[0]; // GET TODAY'S FORECAST
  const nextDays = forecastData.slice(1, 7); // GET NEXT 6 DAYS' FORECAST

  // Update main display
  document.getElementById("cityName").textContent = location;
  document.getElementById("weatherCondition").textContent = today.shortForecast;
  document.getElementById("currentTemperature").textContent = `${today.temperature}°${today.temperatureUnit}`;

  // Infer high and low temperatures from multiple periods
  const todayTemps = forecastData.slice(0, 2); // Get morning and afternoon periods
  const highTemperature = Math.max(...todayTemps.map(period => period.temperature));
  const lowTemperature = Math.min(...todayTemps.map(period => period.temperature));

  // Update high and low temperature
  document.getElementById("highTemperature").textContent = `${highTemperature}°F`;
  document.getElementById("lowTemperature").textContent = `${lowTemperature}°F`;

  // Display the 7-day forecast
  displaySevenDayForecast(nextDays);
}

// Function to display the 7-day forecast
function displaySevenDayForecast(daysData) {
  const sevenDayForecast = document.getElementById("sevenDayForecast");
  sevenDayForecast.innerHTML = ""; // CLEAR PREVIOUS FORECAST

  daysData.forEach((day) => {
    const highTemperature = Math.max(...daysData.map(period => period.temperature));
    const lowTemperature = Math.min(...daysData.map(period => period.temperature));

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
    sevenDayForecast.innerHTML += dayCard; // ADD THE DAY CARD TO THE FORECAST SECTION
  });
}

// Function to display error messages
function showErrorMessage(message) {
  alert(message); // SHOW ERROR MESSAGE IN AN ALERT BOX
}
