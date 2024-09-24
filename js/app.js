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
      showErrorMessage("Failed to fetch weather data. Please try again.");
    });
}

// FUNCTION TO DISPLAY WEATHER INFORMATION
function displayWeatherInfo(forecastData, location) {
  const today = forecastData[0]; // GET TODAY'S FORECAST
  const nextDays = forecastData.slice(1, 7); // GET NEXT 6 DAYS' FORECAST

  // Update main display
  document.getElementById("cityName").textContent = location;
  document.getElementById("weatherCondition").textContent = today.shortForecast;
  document.getElementById("currentTemperature").textContent = `${today.temperature}°${today.temperatureUnit}`;

  // Handle pressure, temperature high/low, and dew point for humidity
  const pressure = today.pressure || "Not available"; // If not available, display "Not available"
  const highTemperature = today.temperatureHigh || "Not available";
  const lowTemperature = today.temperatureLow || "Not available";
  const humidity = today.dewPoint ? `${today.dewPoint}°F` : "Not available"; 

  // Update elements with actual data
  document.getElementById("pressure").textContent = pressure;
  document.getElementById("highTemperature").textContent = `${highTemperature}°F`;
  document.getElementById("lowTemperature").textContent = `${lowTemperature}°F`;
  document.getElementById("humidity").textContent = humidity;

  // Display the 7-day forecast
  displaySevenDayForecast(nextDays);
}

// FUNCTION TO DISPLAY THE 7-DAY FORECAST
function displaySevenDayForecast(daysData) {
  const sevenDayForecast = document.getElementById("sevenDayForecast");
  sevenDayForecast.innerHTML = ""; 

  daysData.forEach((day) => {
    const dayCard = `
      <div class="col forecastCard">
        <h5>${new Date(day.startTime).toLocaleDateString("en-US", {
          weekday: "long",
        })}</h5>
        <p>High: ${day.temperatureHigh || "Not available"}°F</p>
        <p>Low: ${day.temperatureLow || "Not available"}°F</p>
        <p>${day.shortForecast}</p>
        <img src="${day.icon}" alt="${day.shortForecast}">
      </div>`;
    sevenDayForecast.innerHTML += dayCard; 
  });
}

// FUNCTION TO SHOW ERROR MESSAGES
function showErrorMessage(message) {
  alert(message); 
}
