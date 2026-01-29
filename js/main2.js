mapboxgl.accessToken = 'pk.eyJ1Ijoiam9ubnlqczIiLCJhIjoiY21oZG56a3h5MDUybzJscHU5dDlveHEyMyJ9.Zj4MO5kQbqLf6QDwWWTs2A'

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 4,
    minZoom: 3,
    center: [-95, 38],
    projection: {
        name: 'albers',
        parallels: [29.5, 45.5]
    }
});

async function loadRatesData() {
    const response = await fetch('assets/us-covid-2020-rates.geojson')
    const data = await response.json()

    map.on('load', () => {
        map.addSource('covid-rates', {
            type: 'geojson',
            data: data
        })

        map.addLayer({
            id: 'covid-rates-layer',
            type: 'fill',
            source: 'covid-rates',
            paint: {
                'fill-color': [
                    'step',
                    ['get', 'rates'],
                    '#FFEDA0', // 0-20
                    20, '#FED976', // 20-40
                    40, '#FEB24C', // 40-60
                    60, '#FD8D3C', // 60-80
                    80, '#FC4E2A', // 80-100
                    100, '#E31A1C', // 100-120
                    120, '#BD0026', // 120-140
                    140, '#800026', // 140-160+
                ],
                'fill-outline-color': '#BBBBBB',
                'fill-opacity': 0.7
            }
        })

                map.on('mousemove', ({point}) => {
            const county = map.queryRenderedFeatures(point, {
                layers: ['covid-rates-layer']
            })
            if (county.length) {
                const props = county[0].properties
                document.getElementById('text-description').innerHTML =
                    `<div style="text-align:center;">
                        <strong>${props.county}, ${props.state}</strong><br>
                        <span style="font-size:14px;">${props.rates.toFixed(1)} per 100k</span>
                    </div>`
            } else {
                document.getElementById('text-description').innerHTML = `<p>Hover over a county!</p>`
            }
        })


        const legend = document.getElementById('legend')
          legend.innerHTML = "<b>COVID-19 Rate<br>(per 100k)</b><br><br>"

          const labels = ['Low (20)', 'Medium-Low (40)', 'Medium (60)', 'Medium-High (80)', 'High (100)', 'Very High (120)', 'Extreme (140)', 'Severe (160)']
          const colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']

          labels.forEach((label, i) => {
            const item = document.createElement('div')
            const key = document.createElement('span')
            key.className = 'legend-key'
            key.style.backgroundColor = colors[i]
            const value = document.createElement('span')
            value.innerHTML = label
            item.appendChild(key)
            item.appendChild(value)
            legend.appendChild(item)
        })

    })
}

loadRatesData()
