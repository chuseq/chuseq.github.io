// d3 content here

ancho_total=+d3.select('#grafica').style('width').slice(0,-2)
alto_total= +d3.select('#grafica').style('height').slice(0,-2)
margin = {top:60, right:20, bottom:80, left:40}
ancho=ancho_total-margin.left-margin.right
alto=alto_total-margin.top-margin.bottom

svg=d3.select('#grafica')
        .append('svg')
        .attr('width',ancho_total)
        .attr('height',alto_total)

g = svg.append('g')
        .attr('width', ancho_total-margin.left-margin.right)
        .attr('height', alto_total-margin.top-margin.bottom)
        .attr('transform','translate('+margin.left+','+margin.top+')')

// escala para los continentes
continentColor = d3
	.scaleOrdinal()
	.domain(['africa','americas','asia','europe'])
	.range(['red','blue','green','brown'])

xGroup = g
	.append('g')
	.attr('transform','translate(0,'+alto+')')
yGroup = g.append('g')

titleDisplay = g
	.append('text')
	.attr('x',ancho/2)
	.attr('y',alto/2)
	.attr('text-anchor','middle')
	.attr('font-size','64px')
	.attr('font-family','arial')
	.attr('fill','#cccccc')

x = d3
	.scaleLog() //Linear()

y = d3
	.scaleLinear()
r= d3
	.scaleLinear()

// objetivo: grafica de burbujas donde
// eje x = pib per capita
// eje y = expectativa de vida
// el radio de las burbujas sera la población
function render(data,year=1800) {
	data=data.filter( (d)=>d.year==year)

	// ejes
	xAxisCall = d3.axisBottom(x)
	xGroup.call(xAxisCall)

	yAxisCall = d3.axisLeft(y)
	yGroup.call(yAxisCall)

	titleDisplay.text(year)

	// 3 join
	puntos = g
		.selectAll('circle')
		.data(data, (d)=>d.country)

	// 4 enter
	puntos
		.enter()
		.append('circle')
		  .attr('cx', (d)=>x(d.income))
		  .attr('cy', (d)=>y(d.life_exp))
		  .attr('r',0)
		  .attr('fill','gray')
	// merge para los puntos que cambian
		.merge(puntos)
	// animación
		.transition()
		.duration(300)
		.attr('cx', (d)=>x(d.income))
		.attr('cy', (d)=>y(d.life_exp))
		.attr('r',  (d)=>r(d.population))
		.attr('fill',(d)=>continentColor(d.continent))
		.attr('fill-opacity', 0.75)
		.attr('stroke','gray')
	puntos
		.exit()
		.remove()

}

datos=[]
function load() {
	// 1 cargar convertir limpiar
        d3.csv('/unir3/csv/gap.csv') // continent,country,income,life_exp,population,year
        .then(function(data) { 
                data.forEach( (d) => {
                        d.income=+d.income
                        d.life_exp=+d.life_exp
                        d.population=+d.population
                        d.year=+d.year
                })
		// limpieza: eliminar datos que son mayores a cero
		data=data.filter((d)=>{ return (d.income>0) && (d.life_exp>0) })
		datos=data
		// para color por continente
		continentes = d3
			.map(data, (d)=>d.continent)
			.keys()

		// 2 escalas
		x
			.domain([ 
				d3.min(data, (d)=>d.income),
				d3.max(data, (d)=>d.income)])
			.range([0,ancho])
		y
			.domain([
				d3.min(data, (d)=>d.life_exp),
				d3.max(data, (d)=>d.life_exp)])
			.range([alto,0])
		r
			.domain([d3.min(data, (d)=>d.population), d3.max(data, (d)=>d.population)])
			.range([5,50])
		
		years = d3
			.map(data, (d)=>+d.year)
			.keys()

		yearIndex=0
		d3.interval((d)=>{
			render(data,years[yearIndex++])
			yearIndex%=years.length
			}, 300)

        })
}

load()


