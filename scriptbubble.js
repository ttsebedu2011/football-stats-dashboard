// Define the dimensions and margins for the chart
const margin = { top: 30, right: 150, bottom: 30, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Create the SVG element for the bubble chart
const bubbleSvg = d3.select("#bubbleChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data from CSV and process
d3.csv("england-premier-league-teams-2018-to-2019-stats.csv").then(function(data) {
    // Convert numeric values from strings to numbers
    data.forEach(d => {
        d.wins = +d.wins;
        d.league_position = +d.league_position;
    });

    // Create scales for bubble size and color
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.wins)])
        .range([0, 50]); // Size range for bubbles
    
    // Create ordinal scale for color based on league position
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(d3.range(1, 21)); // League position range

    // Define the force simulation
    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => sizeScale(d.wins) + 1))
        .on("tick", ticked);

    // Update bubble and label positions on simulation 'tick'
    function ticked() {
        bubbles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        bubbleSvg.selectAll(".bubble-label")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    }

    // Create a bubble for each team
    const bubbles = bubbleSvg.selectAll(".bubble")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("r", d => sizeScale(d.wins)) // Set radius based on wins
        .style("fill", d => colorScale(d.league_position))
        .on("click", displayInformation) 
        .call(d3.drag() // Start drag behavior
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Create labels for each bubble
    bubbleSvg.selectAll(".bubble-label")
        .data(data)
        .enter().append("text")
        .attr("class", "bubble-label")
        .text(d => d.team_name)
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-weight", "bold")
        .style("font-size", "10px") 
        .style("pointer-events", "none"); 

    // Define functions for drag events
    function dragstarted(event, d) {
        // Start the simulation on drag start
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        // Update the fixed position on drag
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        // End the simulation on drag end
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }


    // Add a legend 
    const legend = bubbleSvg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width},${i * 20 + 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", 22)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => `Position ${d}`);
});

// Function to display information on click
function displayInformation(event, d) {
    // Just for Debugging
    console.log("Event:", event);
    console.log("Data:", d);
    
    // alert(`Team: ${d.team_name}, Wins: ${d.wins}, Position: ${d.league_position}`);// Debugging
    // Update the info box with details of the selected team
    d3.select(".info-box").html(`
        <h3>${d.team_name}</h3>
        <p>Wins: ${d.wins}</p>
        <p>League Position: ${d.league_position}</p>
        
    `).style("display", "block"); 
}
