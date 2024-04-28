(function() {
    // Set the dimensions and margins of the graph
    const margin = { top: 10, right: 150, bottom: 50, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append SVG to the div with id #my_dataviz, set dimensions, and offset for margins
    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialize a tooltip 
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Load and process data
    d3.csv("football_players.csv").then(function(data) {
        // Convert 'Season' to numerical years and 'Goals' to numbers
        data.forEach(d => {
            d.Season = +d.Season.split('/')[0]; // Get the starting year of the season
            d.Goals = +d.Goals;
        });
        // Sort data by season 
        data.sort((a, b) => a.Season - b.Season);

        // Define scales
        const x = d3.scalePoint() // Scale for x-axis
            .domain(data.map(d => d.Season))
            .range([0, width]);
        const y = d3.scaleLinear() // Scale for y-axis
            .domain([0, d3.max(data, d => d.Goals)])
            .range([height, 0]);

        // Append and configure the x-axis on the SVG
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)); // Adds the x-axis to the graph
        
        // X-axis label
        svg.append("text")
            .attr("x", width)
            .attr("y", height + 40)
            .style("text-anchor", "end")
            .text("Seasons");

        // Append and configure the y-axis on the SVG
        svg.append("g")
            .call(d3.axisLeft(y)); // Adds the y-axis to the graph
        
        // Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -height/2)
            .style("text-anchor", "middle")
            .text("Goals");

        // Define a line generator
        const lineGenerator = d3.line() // Defines how lines are drawn
            .curve(d3.curveMonotoneX) // Applies smoothing to the line
            .x(d => x(d.Season))
            .y(d => y(d.Goals));

        // Define a color scale for different players
        const color = d3.scaleOrdinal(d3.schemeTableau10); // Color scheme

        // Group data by player name for individual lines
        const groupedData = d3.group(data, d => d.Name);

        // Draw lines and points for each player
        groupedData.forEach((values, key) => {
            svg.append("path") // Draws line for each player
                .datum(values)
                .attr("fill", "none")
                .attr("stroke", color(key))
                .attr("stroke-width", 1.5)
                .attr("d", lineGenerator);

            svg.selectAll(null) // Adds points (circles) for each data point
                .data(values)
                .enter().append("circle")
                .attr("cx", d => x(d.Season))
                .attr("cy", d => y(d.Goals))
                .attr("r", 5)
                .attr("fill", color(key))
                .on("mouseover", (event, d) => { // Tooltip display on mouseover
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`Name: ${d.Name}<br>Goals: ${d.Goals}<br>Season: ${d.Season}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => { // Hide tooltip on mouseout
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });

        // Append a legend to the SVG 
        const legend = svg.selectAll(".legend")
            .data(groupedData.keys())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", width + 20)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => color(d));

        legend.append("text")
            .attr("x", width + 40)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);
    }).catch(function(error) {
        console.error('Error loading the CSV file', error);
    });

})(); 
