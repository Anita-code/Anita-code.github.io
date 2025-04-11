// Clé API - vous devrez en obtenir une sur openweathermap.org
const API_KEY = '18576d0f518d1d2cb61732181305115f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Éléments du DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const forecastElement = document.getElementById('forecast');

// Événements
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Fonction pour obtenir les données météo
async function getWeatherData(city) {
    try {
        // Météo actuelle
        const currentResponse = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&lang=fr&appid=${API_KEY}`);
        const currentData = await currentResponse.json();
        
        if (currentData.cod === '404') {
            alert('Ville non trouvée. Veuillez essayer un autre nom.');
            return;
        }
        
        displayCurrentWeather(currentData);
        
        // Prévisions sur 5 jours
        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&lang=fr&appid=${API_KEY}`);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la récupération des données météo.');
    }
}

// Afficher la météo actuelle
function displayCurrentWeather(data) {
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    
    const now = new Date();
    dateElement.textContent = formatDate(now);
    
    const temp = Math.round(data.main.temp);
    temperatureElement.textContent = `${temp}°C`;
    
    const description = data.weather[0].description;
    descriptionElement.textContent = description;
    
    humidityElement.textContent = `${data.main.humidity}%`;
    windElement.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = description;
}

// Afficher les prévisions
function displayForecast(data) {
    // On groupe les prévisions par jour
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        
        if (!dailyForecasts[dateString]) {
            dailyForecasts[dateString] = {
                temps: [],
                icons: [],
                descriptions: []
            };
        }
        
        dailyForecasts[dateString].temps.push(item.main.temp);
        dailyForecasts[dateString].icons.push(item.weather[0].icon);
        dailyForecasts[dateString].descriptions.push(item.weather[0].description);
    });
    
    // On crée les éléments HTML pour chaque jour
    forecastElement.innerHTML = '';
    
    for (const [day, forecast] of Object.entries(dailyForecasts)) {
        if (forecastElement.children.length >= 5) break;
        
        const maxTemp = Math.round(Math.max(...forecast.temps));
        const minTemp = Math.round(Math.min(...forecast.temps));
        
        // On prend l'icône la plus fréquente pour la journée
        const iconCounts = {};
        forecast.icons.forEach(icon => {
            iconCounts[icon] = (iconCounts[icon] || 0) + 1;
        });
        const mostCommonIcon = Object.keys(iconCounts).reduce((a, b) => 
            iconCounts[a] > iconCounts[b] ? a : b
        );
        
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-day';
        dayElement.innerHTML = `
            <div class="day">${day}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${mostCommonIcon}.png" alt="${forecast.descriptions[0]}">
            </div>
            <div class="temps">
                <span class="max-temp">${maxTemp}°</span>
                <span class="min-temp">${minTemp}°</span>
            </div>
        `;
        
        forecastElement.appendChild(dayElement);
    }
}

// Formater la date
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
}

// Charger les données météo pour une ville par défaut au démarrage
window.addEventListener('load', () => {
    getWeatherData('Paris');
});