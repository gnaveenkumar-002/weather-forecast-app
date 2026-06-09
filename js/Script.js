
// CONFIG
const API_KEY = "9d719c70c1f550adc75316917958d967";

const BASE_URL =
"https://api.openweathermap.org/data/2.5/";


// DOM ELEMENTS


const cityInput =
document.getElementById("cityInput");

const errorMsg =
document.getElementById("errorMsg");

const loader =
document.getElementById("loader");

const weatherSection =
document.getElementById("weatherSection");

const forecastSection =
document.getElementById("forecastSection");

const forecastCards =
document.getElementById("forecastCards");

const historyList =
document.getElementById("historyList");

// ICONS


function getWeatherIcon(condition){

    const icons = {

        Clear:
        "assets/icons/clear.png",

        Clouds:
        "assets/icons/cloudy.png",

        Rain:
        "assets/icons/rain.png",

        Drizzle:
        "assets/icons/drizzle.jpg",

        Mist:
        "assets/icons/cloudy.png",

        Haze:
        "assets/icons/cloudy.png",

        Fog:
        "assets/icons/cloudy.png",

        Snow:
        "assets/icons/cloudy.png",

        Thunderstorm:
        "assets/icons/rain.png"
    };

    return icons[condition]
        || "assets/icons/cloudy.png";
}


// SHOW/HIDE


function showLoader(){
    loader.style.display="block";
}

function hideLoader(){
    loader.style.display="none";
}

function showError(){
    errorMsg.style.display="block";
}

function hideError(){
    errorMsg.style.display="none";
}


// TIME FORMAT

function formatTime(unix,timezone){

    const date =
    new Date((unix + timezone)*1000);

    let hrs =
    date.getUTCHours();

    let mins =
    date.getUTCMinutes();

    const ampm =
    hrs >= 12 ? "PM":"AM";

    hrs = hrs % 12 || 12;

    mins =
    mins < 10 ? "0"+mins : mins;

    return `${hrs}:${mins} ${ampm}`;
}

// MAIN WEATHER


async function checkWeather(city){

    hideError();
    showLoader();

    try{

        const response =
        await fetch(
        `${BASE_URL}weather?units=metric&q=${city}&appid=${API_KEY}`
        );

        const data =
        await response.json();

        if(data.cod == "404"){

            hideLoader();
            showError();
            return;
        }

        // Temperature

        document.getElementById("temp")
        .textContent =
        Math.round(data.main.temp)+"°C";

        // City

        document.getElementById("cityName")
        .textContent =
        data.name;

        // Condition

        document.getElementById("condition")
        .textContent =
        data.weather[0].description;

        // Humidity

        document.getElementById("humidity")
        .textContent =
        data.main.humidity+"%";

        // Wind

        document.getElementById("wind")
        .textContent =
        data.wind.speed+" km/hr";

        // Feels Like

        document.getElementById("feelsLike")
        .textContent =
        Math.round(data.main.feels_like)+"°C";

        // Pressure

        document.getElementById("pressure")
        .textContent =
        data.main.pressure+" hPa";

        // Visibility

        document.getElementById("visibility")
        .textContent =
        (data.visibility/1000)+" km";

        // Icon

        document.getElementById("weatherIcon")
        .src =
        getWeatherIcon(
        data.weather[0].main
        );

        // Sunrise Sunset

        document.getElementById("sunrise")
        .textContent =
        formatTime(
        data.sys.sunrise,
        data.timezone
        );

        document.getElementById("sunset")
        .textContent =
        formatTime(
        data.sys.sunset,
        data.timezone
        );

        saveHistory(data.name);

        await getForecast(city);

        hideLoader();

    }
    catch(error){

        hideLoader();
        showError();

        console.log(error);
    }
}


// FORECAST


async function getForecast(city){

    try{

        const response =
        await fetch(
        `${BASE_URL}forecast?units=metric&q=${city}&appid=${API_KEY}`
        );

        const data =
        await response.json();

        forecastCards.innerHTML="";

        const daily = {};

        data.list.forEach(item=>{

            const date =
            item.dt_txt.split(" ")[0];

            const time =
            item.dt_txt.split(" ")[1];

            if(time==="12:00:00"
            && !daily[date]){

                daily[date]=item;
            }

        });

        const forecast =
        Object.values(daily).slice(0,5);

        forecast.forEach(day=>{

            const card =
            document.createElement("div");

            card.className =
            "forecast-card";

            card.innerHTML = `

            <div class="day">
            ${new Date(day.dt_txt)
            .toLocaleDateString(
            "en-US",
            {weekday:"short"}
            )}
            </div>

            <img
            src="${getWeatherIcon(day.weather[0].main)}">

            <div class="fc-temp">
            ${Math.round(day.main.temp)}°C
            </div>

            <div class="fc-desc">
            ${day.weather[0].main}
            </div>

            `;

            forecastCards.appendChild(card);
        });

    }
    catch(error){

        console.log(error);
    }
}


// SEARCH BUTTON


function searchCity(){

    const city =
    cityInput.value.trim();

    if(city){

        checkWeather(city);
    }
}


// ENTER KEY


cityInput.addEventListener(
"keypress",
function(e){

    if(e.key==="Enter"){

        searchCity();
    }
});


// GEOLOCATION


function useMyLocation(){

    if(!navigator.geolocation){

        alert(
        "Geolocation not supported"
        );

        return;
    }

    navigator.geolocation
    .getCurrentPosition(

    async(position)=>{

        const lat =
        position.coords.latitude;

        const lon =
        position.coords.longitude;

        const response =
        await fetch(
        `${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        const data =
        await response.json();

        checkWeather(data.name);
    });
}

// DARK MODE


function toggleTheme(){

    const body =
    document.body;

    const btn =
    document.getElementById("themeBtn");

    body.classList.toggle(
    "dark-mode"
    );

    if(body.classList
        .contains("dark-mode")){

        btn.textContent =
        "☀️ Light Mode";

        localStorage.setItem(
        "theme",
        "dark"
        );
    }
    else{

        btn.textContent =
        "🌙 Dark Mode";

        localStorage.setItem(
        "theme",
        "light"
        );
    }
}


// LOAD THEME

(function(){

    const theme =
    localStorage.getItem("theme");

    if(theme==="dark"){

        document.body
        .classList.add("dark-mode");

        document.getElementById(
        "themeBtn"
        ).textContent =
        "☀️ Light Mode";
    }

})();

// SEARCH HISTORY


function saveHistory(city){

    let history =
    JSON.parse(
    localStorage.getItem(
    "weatherHistory"
    )
    ) || [];

    history =
    history.filter(
    c=>c.toLowerCase() !==
    city.toLowerCase()
    );

    history.unshift(city);

    if(history.length>6){

        history = history.slice(0,6);
    }

    localStorage.setItem(
    "weatherHistory",
    JSON.stringify(history)
    );

    renderHistory();
}


// RENDER HISTORY


function renderHistory(){

    const history =
    JSON.parse(
    localStorage.getItem(
    "weatherHistory"
    )
    ) || [];

    historyList.innerHTML="";

    history.forEach(city=>{

        const li =
        document.createElement("li");

        li.textContent = city;

        li.onclick = ()=>{

            cityInput.value = city;

            checkWeather(city);
        };

        historyList.appendChild(li);
    });
}

// INIT

renderHistory();

// Default city

checkWeather("Bengaluru");