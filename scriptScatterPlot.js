(function() {
    // Set dimensions and margins for the graph
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

    // Define a color scale to differentiating data points visually
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Load and process data from a CSV file
    d3.csv("england-premier-league-teams-2018-to-2019-stats.csv").then(function(data) {
        // Iterate through each data point to convert fields to numeric values and calculate win percentages
        data.forEach(d => {
            // Convert string data types to numbers for 'matches_played' and 'wins'
            d.matches_played = +d.matches_played;
            d.wins = +d.wins;

            // Check if there are matches played to avoid dividing by zero
            if (d.matches_played > 0) {
                // Calculate win percentage as the number of wins divided by matches played, multiplied by 100
                const winPercentage = (d.wins / d.matches_played) * 100;

                // Round win percentage to two decimal places
                d.win_percentage_overall = winPercentage.toFixed(2);
            } else {
                // Assign "N/A" when no matches are played to indicate that the data is not applicable
                d.win_percentage_overall = "N/A";
            }
        });


        // Filter out irrelevant data entries 
        let validData = data.filter(d => !isNaN(d.average_possession) && !isNaN(d.win_percentage_overall));

        // Define scales for the axes
        const x = d3.scaleLinear()
            .domain([0, 100]) // Possession as a percentage
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, 100]) // Win rate as a percentage
            .range([height, 0]);

        // Add axes to the SVG
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));
        svg.append("g")
            .call(d3.axisLeft(y));

        // Labels for the axes
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 20)
            .text("Ball Possession (%)");
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top)
            .text("Win Rate (%)");

        // Create dots for each valid data point 
        svg.append("g")
            .selectAll("dot")
            .data(validData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.average_possession)) // Set x-coordinate based on possession percentage
            .attr("cy", d => y(d.win_percentage_overall)) // Set y-coordinate based on win rate
            .attr("r", 5)
            .style("fill", (d, i) => colorScale(i))
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                    tooltip.html(`Team: ${d.team_name}<br>Possession: ${d.average_possession}%<br>Win Rate: ${d.win_percentage_overall}%`)
                        .style("left", `${event.pageX}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
    }).catch(function(error) {
        console.error('Error loading the CSV file', error);
    });

})(); 
