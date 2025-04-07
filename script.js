const apiKey = 'a3cae39f39eabd2b78734ba77517b8e7'; // OpenWeatherMap API key

const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton'); // New
const cityInput = document.getElementById('cityInput');
const weatherData = document.getElementById('weatherData');
const extendedForecast = document.getElementById('extendedForecast');
const recentCities = document.getElementById('recentCities');
const dropdown = document.getElementById('dropdown');

// 🔍 Search by city
searchButton.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeatherData(city);
        saveRecentCity(city);
    }
});

// 📍 Search by current location
locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherDataByCoords(latitude, longitude);
            },
            error => {
                alert('Location access denied or unavailable.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// 🌆 Fetch weather by city
async function fetchWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeatherData(data);
        fetchExtendedForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        alert(error.message);
    }
}

// 🌍 Fetch weather by coordinates
async function fetchWeatherDataByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('Weather data unavailable for your location');
        const data = await response.json();
        displayWeatherData(data);
        fetchExtendedForecast(lat, lon);
    } catch (error) {
        alert(error.message);
    }
}

// 📊 Display current weather
function displayWeatherData(data) {
    weatherData.innerHTML = `
        <h2 class="text-2xl font-semibold text-blue-700">${data.name}</h2>
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

// 📅 Fetch extended forecast
async function fetchExtendedForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayExtendedForecast(data);
    } catch (error) {
        alert('Error fetching extended forecast');
    }
}

// 📅 Display extended forecast
function displayExtendedForecast(data) {
    extendedForecast.innerHTML = '<h3 class="text-xl font-semibold mb-2">5-Day Forecast</h3>';
    data.list.forEach((item, index) => {
        if (index % 8 === 0) {
            extendedForecast.innerHTML += `
                <div class="mt-2 p-3 bg-white rounded shadow">
                    <p><strong>Date:</strong> ${new Date(item.dt * 1000).toLocaleDateString()}</p>
                    <p>Temperature: ${item.main.temp} °C</p>
                    <p>Humidity: ${item.main.humidity}%</p>
                    <p>Wind Speed: ${item.wind.speed} m/s</p>
                    <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                </div>
            `;
        }
    });
}

// 💾 Save city to local storage
function saveRecentCity(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(cities));
        updateDropdown();
    }
}

// ⬇️ Update recent city dropdown
function updateDropdown() {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCities.innerHTML = '';
    cities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.className = 'p-2 hover:bg-gray-200 cursor-pointer';
        li.addEventListener('click', () => {
            cityInput.value = city;
            fetchWeatherData(city);
            dropdown.classList.add('hidden');
        });
        recentCities.appendChild(li);
    });
    dropdown.classList.toggle('hidden', cities.length === 0);
}

// 👀 Show dropdown when typing
cityInput.addEventListener('input', () => {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    dropdown.classList.toggle('hidden', cities.length === 0);
});

// 🟡 Load recent cities on start
document.addEventListener('DOMContentLoaded', updateDropdown);
