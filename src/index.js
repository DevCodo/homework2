import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/";

async function loadCurrency() {
  const index = document.querySelector('#citys').value;
  const response = await fetch(`${meteoURL}${index}.xml`);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");
  
  const hours = currencyData.querySelectorAll("FORECAST");
  const temperature = currencyData.querySelectorAll("TEMPERATURE");
  const temperatureHeat = currencyData.querySelectorAll("HEAT");

  const arrHours = [];
  const arrTempMin = [];
  const arrTempMax = [];
  const arrTempHeat = [];

  for (let i = 0; i < hours.length; i++) {
    const hour = `${hours.item(i).getAttribute("hour")}:00 ${hours.item(i).getAttribute("day")}.${hours.item(i).getAttribute("month")}.${hours.item(i).getAttribute("year")}`;
    const tempMin = temperature.item(i).getAttribute("min");
    const tempMax = temperature.item(i).getAttribute("max");
    const tempHeat = temperatureHeat.item(i).getAttribute("max");
    arrHours.push(hour);
    arrTempMin.push(tempMin);
    arrTempMax.push(tempMax);
    arrTempHeat.push(tempHeat);
  }
 
  return {arrHours, arrTempMin, arrTempMax, arrTempHeat};
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");

buttonBuild.addEventListener("click", async function() {
  const currencyData = await loadCurrency();
  const {arrHours, arrTempMin, arrTempMax, arrTempHeat} = currencyData;

  const chartConfig = {
    type: "line",

    data: {
      labels: arrHours,
      datasets: [
        {
          label: "Максимальная температура",
          backgroundColor: "#e9575788",
          borderColor: "#bb4949",
          fill: 1,
          borderWidth: 7,
          data: arrTempMax
        },
        {
          label: "Минимальная температура",
          backgroundColor: "#579be955",
          borderColor: "#4579b4",
          fill: false,
          borderWidth: 7,
          data: arrTempMin
        },
        {
          label: "Температура по ощущениям",
          backgroundColor: "#98d86455",
          fill: false,
          borderColor: "#6b9746",
          borderWidth: 7,
          data: arrTempHeat
        },
      ]
    },
    
    options: {
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Время, дата'
          }
        }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Температура, °С'
            }
        }]
      }
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.data.datasets[1].data = chartConfig.data.datasets[1].data;
    chart.data.datasets[2].data = chartConfig.data.datasets[2].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});

