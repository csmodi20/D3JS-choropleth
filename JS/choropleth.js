
// define the dimensions and margins for the graph
var margin = {top: 100, right: 200, bottom: 40, left: 100};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var padding = 1;

var svg = d3.select("#choropleth")
            .append("svg")
            .attr("width", width + margin.left + margin.right )
            .attr("height",height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                
var projection =  d3.geoNaturalEarth1() //d3-geo-projection
                    .scale((width+200) / 1.65 / Math.PI)
                    .translate([width / 2, height / 2])
var pathGenerator = d3.geoPath().projection(projection);
                                          
Promise.all([
    d3.csv('DATA/ratings-by-country.csv'),
    d3.json('DATA/world_countries.json')
]).then(([gameData, topoData])=>{

            ready(topoData, gameData) //-added ready function
    
})
//...................colorScale................................
        

function ready( topoData, gameData) 
{
        //if (error) throw error; 
        // enter code to extract all unique games from gameData
            variableNames = d3.map(gameData, function(d){return d.Game}).keys().sort()

        // enter code to append the game options to the dropdown
            var dropdown = d3.select('#choropleth')           
            // .on('change', dropdownChange)
                .append('select')
                .attr('class', 'selection')
                .attr('name', 'gamelist')
                .style('x', "50px")
            dropdown.selectAll('option')
                //.data(allGroup)                    
                .data(variableNames)
                .enter()
                .append('option')
                .text(function(d){return d})
                .attr('value', function(d){return d})
        

        selectedGame = d3.selectAll('.selection').property('value')
        createMapAndLegend(topoData, gameData, selectedGame)

            d3.selectAll('.selection').on('change', function changemap(){
                d3.selectAll('path').remove();
                d3.selectAll('.legendEntry').remove()
                var selectedGame = this.value
                createMapAndLegend(topoData, gameData, selectedGame)
                

        })

           
}

// create Choropleth with default option. Call createMapAndLegend() with required arguments. 


// this function should create a Choropleth and legend using the world and gameData arguments for a selectedGame
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
    function createMapAndLegend(topoData, gameData, selectedGame){ 
        
               
        var filteredData = gameData.filter(function(d){         /// - filtering game data based on seletedgame
            return d.Game == selectedGame})
        
        var selectedrate = {};                                  ///maping rating to country
            filteredData.forEach(function(d){
                selectedrate[d.Country] = d["Average Rating"]
            }); 
        var selectedusers = {};                                  ///maping rating to country
            filteredData.forEach(function(d){
                selectedusers[d.Country] = d["Number of Users"]
            });
        var selgame= {};                                  ///maping rating to country
            filteredData.forEach(function(d){
                selgame[d.Country] = d["Game"]
            });           
            

        var domain =  filteredData.map(function(d){
            return +d["Average Rating"]})

        var mycolor = d3.scaleQuantile()
            .domain(domain)
            .range(["#d4c7e4","#a184c4","#825db1","#6f4b9c"]);   
        
         

        var mymap =svg.selectAll('path')
            .data(topoData.features)
            .enter().append('path')
                .attr('d',pathGenerator)
                .attr('fill', function(d) 
                {  
                    var value = selectedrate[d.properties.name];
                    if (value){
                        return mycolor(value);}
                    else{
                        return "#949494"}
                })                           
                .attr('class', 'country')

                .on("mouseover", function(d) 
                {
                    tooltip = d3.select("#tooltip")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("left", (d3.event.pageX+30) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                        .html( 'Country:'+ d.properties.name +'<br>'
                            + 'Game:'+ selgame[d.properties.name]+ '<br>'
                            + 'Avg Rating:' +  (selectedrate[d.properties.name] 
                                                !==undefined ? selectedrate[d.properties.name]:'NA')  +'<br>'
                            + 'Number of Users:' + (selectedusers[d.properties.name] 
                                                !==undefined ? selectedusers[d.properties.name]:'NA')    
                            )
                                                
            
                })
                
                .on("mouseout", function(d)
                    {
                    d3.selectAll('.tooltip').remove()     
                    });
 
        //addeing legend...................................
    
        var legend = svg.selectAll('g.legendEntry')
            .data( mycolor.range())
            .enter()
            .append('g').attr('class','legendEntry')
        legend.append('rect')
            .attr('x',760)
            .attr("y", function(d, i) {return i * 20;})
            .attr("width", 10)
            .attr("height", 10)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", function(d){return d;})
        legend.append('text')
            .attr("x", 780) 
            .attr("y", function(d, i) {return i * 20;})
            .attr("dy", "0.7em")
            .attr('font-size',12)
            .text(function(d,i) 
                {
                var extent = mycolor.invertExtent(d);
                var format = d3.format("0.2f");
                return format(+extent[0]) + " to " + format(+extent[1]);
                })

            
			
}

