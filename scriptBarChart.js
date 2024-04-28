(function(){
    // Set up the margins and dimensions for the chart
    const margin = { top: 30, right: 30, bottom: 130, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Select the SVG element, configure its dimensions, and append a 'g' element to offset for margins
    const svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialize a hidden tooltip 
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Dropdown filter handling
    d3.select('#filter').on('change', function() {
        updateChart(d3.select(this).property('value'));
    });
    
    // Function to update the chart based on the selected number of goals range
    function updateChart(goalsRange) {
        // Clear the existing chart
        svg.selectAll('*').remove(); // Clear any existing elements in the SVG

        // Load and process data from CSV file
        d3.csv("EPL_20_21.csv").then(function(data) {
            data.forEach(d => {
                d.Goals = +d.Goals; // Convert 'Goals' field to number
                d.Assists = +d.Assists; // Convert 'Assists' field to number
            });

            // Slice a specific range of entries from the data for manageable processing
            // Choosing rows from 50 to 170 due to large dataset size
            let slicedData = data.slice(50, 170);

            // Filter the sliced data based on the selected goals range
            let filteredData = goalsRange === 'all' ? slicedData : slicedData.filter(d => {
                const goals = d.Goals;
                switch(goalsRange) {
                    case '0-10':
                        return goals <= 10;
                    case '10-20':
                        return goals > 10 && goals <= 20;
                    case '20-30':
                        return goals > 20 && goals <= 30;
                    default:
                        return true; // Default case to handle unexpected input
                }
            });
        
            // Creating a band scale for the x-axis with player names
            const x = d3.scaleBand()
                .range([0, width])
                .domain(filteredData.map(d => d.Name))
                .padding(0.1);

            // Creating a linear scale for the y-axis for the maximum value of goals or assists
            const y = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => Math.max(d.Goals, d.Assists))])
                .range([height, 0]);

            // Append x-axis to the SVG
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            // Append y-axis
            svg.append("g")
                .call(d3.axisLeft(y));

            // Create bars for goals
            svg.selectAll(".bar-goals")
                .data(filteredData)
                .enter().append("rect")
                .attr("class", "bar-goals")
                .attr("x", d => x(d.Name))
                .attr("width", x.bandwidth() / 2)
                .attr("y", d => y(d.Goals))
                .attr("height", d => height - y(d.Goals))
                .attr("fill", "steelblue");

            // Create bars for assists right next to goals
            svg.selectAll(".bar-assists")
                .data(filteredData)
                .enter().append("rect")
                .attr("class", "bar-assists")
                .attr("x", d => x(d.Name) + x.bandwidth() / 2)
                .attr("width", x.bandwidth() / 2)
                .attr("y", d => y(d.Assists))
                .attr("height", d => height - y(d.Assists))
                .attr("fill", "orange");
        
            // Tooltip mouseover event
            svg.selectAll('.bar-goals, .bar-assists')
            .on('mouseover', (event, d) => {
                d3.select('.tooltip')
                    .style('opacity', 1)
                    .html(`Player: ${d.Name}<br>Goals: ${d.Goals}<br>Assists: ${d.Assists}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                d3.select('.tooltip').style('opacity', 0);
            });
        
        
        // Add a legend for visual reference
        const legendData = ['Goals', 'Assists'];
        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(legendData) 
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${width - 10},${i * 20})`); 

        legend.append("rect")
            .attr("x", 0) 
            .attr("width", 19)
            .attr("height", 19) 
            .attr("fill", d => d === 'Goals' ? 'steelblue' : 'orange'); 

        legend.append("text")
            .attr("x", -5) 
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);

        // Add a chart title for better context
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle") 
            .style("font-size", "16px") 
            .style("text-decoration", "underline") 
            .text("Premier League Forward Players Goals/Assists 2020/21 Season"); 

        });
        
    }
    // Call updateChart with 'all' goals range selected
    updateChart('all');
})();