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
})

const grades = [1000, 5000, 20000],
    colors = ['rgb(208,209,230)', 'rgb(103,169,207)', 'rgb(1,108,89)'],
    radii = [5, 15, 25]

async function loadCovidData() {
    const response = await fetch('assets/us-covid-2020-counts.geojson')
    const data = await response.json()

    map.on('load', () => {
        map.addSource('covid', {
            type: 'geojson',
            data: data
        })

        map.addLayer({
            id: 'covid-points',
            type: 'circle',
            source: 'covid',
            paint: {
                'circle-radius': {
                    'property': 'cases',
                    'stops': [
                        [grades[0], radii[0]],
                        [grades[1], radii[1]],
                        [grades[2], radii[2]]
                    ]
                },
                'circle-color': {
                    'property': 'cases',
                    'stops': [
                        [grades[0], colors[0]],
                        [grades[1], colors[1]],
                        [grades[2], colors[2]]
                    ]
                },
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': 0.6
            }
        })

        map.on('click', 'covid-points', (event) => {
            new mapboxgl.Popup()
                .setLngLat(event.features[0].geometry.coordinates)
                .setHTML(`<strong>County:</strong> ${event.features[0].properties.county}<br>
                          <strong>State:</strong> ${event.features[0].properties.state}<br>
                          <strong>Cases:</strong> ${event.features[0].properties.cases}<br>
                          <strong>Deaths:</strong> ${event.features[0].properties.deaths}`)
                .addTo(map)
        })
    })

    const legend = document.getElementById('legend')
    var labels = ['<strong>Cases</strong>'], vbreak
    for (var i = 0; i < grades.length; i++) {
        vbreak = grades[i]
        const dot_radii = 2 * radii[i]
        labels.push('<p class="break"><i class="dot" style="background:' + colors[i] + '; width:' + dot_radii + 'px; height:' + dot_radii + 'px;"></i> <span class="dot-label" style="top:' + dot_radii / 2 + 'px;">' + vbreak + '</span></p>')
    }
    const source = '<p style="text-align:right; font-size:10pt">Source: <a href="https://www.cdc.gov/covid-data-tracker">CDC</a></p>'
    legend.innerHTML = labels.join('') + source
}

loadCovidData()
