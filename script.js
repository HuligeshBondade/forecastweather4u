// Function to update the clock
function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = ((seconds / 60) * 360) + 90;
    const minuteDeg = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
    const hourDeg = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;

    document.getElementById('second').style.transform = `rotate(${secondDeg}deg)`;
    document.getElementById('minute').style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById('hour').style.transform = `rotate(${hourDeg}deg)`;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call to set the time right away

// Function to fetch weather data and update background
async function fetchWeather(location) {
    const apiKey = 'bc27ffbc2c0e026af5788b080a75c9ae'; // Your actual API key
    let url = '';

    if (typeof location === 'string') {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${apiKey}`;
    } else {
        // If location is an object with latitude and longitude
        const { latitude, longitude } = location;
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== '200') {
            alert('City not found!');
            return;
        }

        // Update current weather
        const weatherCondition = data.list[0].weather[0].description;
        document.getElementById('weather-condition').innerText = weatherCondition;
        document.getElementById('temperature').innerText = `${data.list[0].main.temp}°C`;

        // Display detected city name
        if (typeof location !== 'string') {
            document.getElementById('detected-city').innerText = `Detected City: ${data.city.name}`;
        }

        // Update the background based on weather condition
        updateBackground(weatherCondition);

        // Update weekly forecast
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = ''; // Clear any previous forecasts

        // Display forecast for the week (every 8 items corresponds to a new day)
        for (let i = 0; i < data.list.length; i += 8) {
            const forecast = data.list[i];
            const date = new Date(forecast.dt * 1000).toLocaleDateString('en-GB', { weekday: 'long' });
            const temp = forecast.main.temp;
            const condition = forecast.weather[0].description;

            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');
            forecastCard.innerHTML = `
                <p>${date}</p>
                <p>${temp}°C</p>
                <p>${condition}</p>
            `;
            forecastContainer.appendChild(forecastCard);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Function to update the background image based on weather condition
function updateBackground(condition) {
    let imageUrl = '';

    if (condition.includes('cloud')) {
        imageUrl = 'https://images.unsplash.com/photo-1670258421086-338921eda8a2?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Cloudy
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        imageUrl = 'https://images.unsplash.com/photo-1518803194621-27188ba362c9?q=80&w=1474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Rainy
    } else if (condition.includes('clear')) {
        imageUrl = 'https://images.unsplash.com/photo-1617142138582-297417cbd0d8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Clear
    } else if (condition.includes('snow')) {
        imageUrl = 'https://images.unsplash.com/photo-1528191710846-99b8717a2830?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Snowy
    } else {
        imageUrl = 'https://images.unsplash.com/photo-1560408833-620e54cd0e8a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Default
    }

    document.body.style.backgroundImage = `url(${imageUrl})`;
}

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeather({ latitude, longitude });
        }, error => {
            console.error('Error getting location:', error);
            fetchWeather('Hubballi'); // Fallback to default city
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        fetchWeather('Hubballi'); // Fallback to default city
    }
}

// Fetch autocomplete suggestions for city names
async function fetchCitySuggestions(query) {
    const apiKey = 'bc27ffbc2c0e026af5788b080a75c9ae'; // Your actual API key
    const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '200') {
            const suggestions = data.list.map(city => city.name);
            updateSuggestionsList(suggestions);
        } else {
            console.error('No city suggestions found');
        }
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
    }
}

// Update the suggestions dropdown
function updateSuggestionsList(suggestions) {
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';

    suggestions.forEach(city => {
        const listItem = document.createElement('li');
        listItem.innerText = city;
        listItem.addEventListener('click', () => {
            document.getElementById('city-search').value = city;
            fetchWeather(city);
            suggestionsList.innerHTML = ''; // Clear the dropdown after selection
        });
        suggestionsList.appendChild(listItem);
    });
}

// Add event listener for search button click
document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('city-search').value;
    fetchWeather(city);
});

getCurrentLocation(); // Initial location detection
