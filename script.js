const apiKey = 'b820d708467ead15e917ab5ea351738a';

document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    getCurrentWeather(city);
    getForecast(city);
});

function getCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('cityName').textContent = data.name;
            document.getElementById('weatherDescription').textContent = data.weather[0].description;
            document.getElementById('temperature').textContent = data.main.temp;
            document.getElementById('humidity').textContent = data.main.humidity;
            document.getElementById('windSpeed').textContent = data.wind.speed;
            document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            updateWeatherWidgetBackground(data.weather[0].main);
        })
        .catch(error => {
            alert("City not found!");
            document.getElementById('cityName').textContent = '';
            document.getElementById('weatherDescription').textContent = '';
            document.getElementById('temperature').textContent = '';
            document.getElementById('humidity').textContent = '';
            document.getElementById('windSpeed').textContent = '';
        });
}

function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const fifteenRecords = data.list.filter((item, index) => index % 8 === 0 || index % 8 === 3 || index % 8 === 6);
            updateCharts(fifteenRecords.map(item => item.main.temp), fifteenRecords.map(item => item.weather[0].main), fifteenRecords.map(item => new Date(item.dt_txt).toLocaleString()));
            updateForecastTable(fifteenRecords);
        });
}

function updateWeatherWidgetBackground(weather) {
    const widget = document.getElementById('weatherWidget');

    if (weather.includes("Clear")) {
        widget.style.backgroundImage = "url('img/clearsky.jpg')";
    } else if (weather.includes("Cloud")) {
        widget.style.backgroundImage = "url('img/cloudysky.jpg')";
    } else if (weather.includes("Rain")) {
        widget.style.backgroundImage = "url('img/rainysky.jpg')";
    } else if (weather.includes("Snow")) {
        widget.style.backgroundImage = "url('img/snowysky.jpg')";
    } else {
        widget.style.backgroundImage = "url('img/default.jpg')";
    }

    widget.style.backgroundSize = "cover";
    widget.style.backgroundPosition = "center";
}

let barChart, doughnutChart, lineChart;

function updateCharts(temperatures, weatherConditions, labels) {
    if (barChart) barChart.destroy();
    if (doughnutChart) doughnutChart.destroy();
    if (lineChart) lineChart.destroy();

    const barChartCtx = document.getElementById('temperatureBarChart').getContext('2d');
    barChart = new Chart(barChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { delay: 1000 },
            scales: { y: { beginAtZero: false } }
        }
    });

    const weatherConditionCount = weatherConditions.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {});

    const doughnutChartCtx = document.getElementById('weatherConditionChart').getContext('2d');
    doughnutChart = new Chart(doughnutChartCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherConditionCount),
            datasets: [{
                data: Object.values(weatherConditionCount),
                backgroundColor: ['#b3d8e8', '#a2a3a8', '#3498db', '#2e8acc'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { delay: 1000 }
        }
    });

    const lineChartCtx = document.getElementById('temperatureLineChart').getContext('2d');
    lineChart = new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature Change (°C)',
                data: temperatures,
                backgroundColor: 'rgba(52,152,219)',
                borderColor: 'rgba(75, 192, 192)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                delay: 1000,
                easing: 'easeInOutBounce'
            }
        }
    });
}

let currentPage = 1;
const itemsPerPage = 5;

function updateForecastTable(data) {
    const tableBody = document.getElementById('forecastTable').querySelector('tbody');
    tableBody.innerHTML = '';

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach((item) => {
        const date = new Date(item.dt_txt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${formattedTime}</td>
            <td>${item.main.temp}°C</td>
            <td>${item.weather[0].description}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationControls(totalPages);
}

function updatePaginationControls(totalPages) {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-btn');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            getForecast(document.getElementById('cityInput').value);
        });
        paginationContainer.appendChild(button);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sortAscBtn').addEventListener('click', () => {
        sortTemperatures('asc');
    });
    
    document.getElementById('sortDescBtn').addEventListener('click', () => {
        sortTemperatures('desc');
    });
    
    document.getElementById('filterRainBtn').addEventListener('click', () => {
        filterRainyDays();
    });
    
    document.getElementById('highestTempBtn').addEventListener('click', () => {
        showHighestTemperatureDay();
    });
})

function sortTemperatures(order) {
    const table = document.getElementById('forecastTable');
    const rowsArray = Array.from(table.rows).slice(1);
    let sortedRows;

    if (order === 'asc') {
        sortedRows = rowsArray.sort((a, b) => {
            const tempA = parseFloat(a.cells[1].textContent);
            const tempB = parseFloat(b.cells[1].textContent);
            return tempA - tempB;
        });
    } else if (order === 'desc') {
        sortedRows = rowsArray.sort((a, b) => {
            const tempA = parseFloat(a.cells[1].textContent);
            const tempB = parseFloat(b.cells[1].textContent);
            return tempB - tempA;
        });
    }

    const tableBody = table.querySelector('tbody');
    tableBody.innerHTML = '';
    sortedRows.forEach(row => tableBody.appendChild(row));
}

function filterRainyDays() {
    const table = document.getElementById('forecastTable');
    const rowsArray = Array.from(table.rows).slice(1);
    const filteredRows = rowsArray.filter(row => row.cells[2].textContent.toLowerCase().includes('light rain'));

    const tableBody = table.querySelector('tbody');
    tableBody.innerHTML = '';
    filteredRows.forEach(row => tableBody.appendChild(row));
}

function showHighestTemperatureDay() {
    const table = document.getElementById('forecastTable');
    const rowsArray = Array.from(table.rows).slice(1);
    const highestTempRow = rowsArray.reduce((maxRow, currentRow) => {
        const maxTemp = parseFloat(maxRow.cells[1].textContent);
        const currentTemp = parseFloat(currentRow.cells[1].textContent);
        return currentTemp > maxTemp ? currentRow : maxRow;
    });

    highestTempRow.style.backgroundColor = '#9dc9cd';
}

document.addEventListener('DOMContentLoaded', () => {
    const askButton = document.getElementById('askChatbotBtn');
    const chatInput = document.getElementById('chatInput');
    const chatResponse = document.getElementById('chatResponse');

    askButton.addEventListener('click', async () => {
        const question = chatInput.value;

        if (question.toLowerCase().includes("weather")) {
            const city = document.getElementById('cityInput') ? document.getElementById('cityInput').value : 'default';

            if (city) {
                try {
                    const weatherResponse = await getWeatherDetails(city);
                    chatResponse.textContent = `The weather in ${city} is ${weatherResponse.weather} with a temperature of ${weatherResponse.temp}°C.`;
                } catch (error) {
                    chatResponse.textContent = 'Could not retrieve weather information. Please try again later.';
                }
            } else {
                chatResponse.textContent = 'Please provide a city name to get the weather information.';
            }
        } else {
            try {
                const response = await getChatGptResponse(question);
                chatResponse.textContent = response;
            } catch (error) {
                chatResponse.textContent = 'I am currently unable to process this query.';
            }
        }
    });
});

async function getWeatherDetails(city) {
    const apiKey = 'b820d708467ead15e917ab5ea351738a';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return {
        weather: data.weather[0].description,
        temp: data.main.temp
    };
}

async function getChatGptResponse(query) {
    const apiKey ='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';
    const url = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: query }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
