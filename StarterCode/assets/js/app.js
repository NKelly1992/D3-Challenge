//Set up the box for the SVG components
var svgWidth = 1000;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create an SVG wrapper
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

//Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params
var chosenXAxis = "income";
var chosenYAxis = "obesity";

// Set up functions
// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    //create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
            d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale
};

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // Create scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) - 1,
            d3.max(healthData, d => d[chosenYAxis]) + 1
    ])
    .range([height, 0]);

    return yLinearScale;
};

// function used for transitioningyAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
};

// Functions for transitioning circles group with new X and Y coordinates
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
};

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

// Functions for updating circles text with new X and Y coordinates
function renderXText(circlesText, newXScale, chosenXAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));

    return circlesText;
}

function renderYText(circlesText, newYScale, chosenYAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]));

    return circlesText;
}

// function used for updating circles group with new tooltip // textGroup?
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {

    // Change the labels
    var xLabel = "";
    if (chosenXAxis === "income") {
        xLabel = "Median Household Income"
    } else if (chosenXAxis === "age") {
        xLabel = "Median Age"
    } else if (chosenXAxis === "poverty") {
        xLabel = "Poverty Rate"
    }

    var yLabel = "";
    if (chosenYAxis === "obesity") {
        yLabel = "Obesity Rate"
    } else if (chosenYAxis === "healthcare") {
        yLabel = "Lack of Healthcare Rate"
    } else if (chosenYAxis === "smokes") {
        yLabel = "Smoking Rate"
    }

    // Create the tool tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            if (chosenXAxis === "income") {
                return (`${d.state}<br>${xLabel}: $${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]} %`);
            } else if (chosenXAxis === "age") {
                return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]} %`);
            } else { 
                return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]} % <br>${yLabel}: ${d[chosenYAxis]} %`);
            }
        });

    circlesGroup.call(toolTip)

    //Create the event listener for the tool tip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    .on("mouseout", function(data) {
        toolTip.hide(data, this);
    });

    return circlesGroup;
};

(async function(){
    // Import the data
    var healthData = await d3.csv("assets/data/data.csv");

    // Parse Data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes
    });

     // Create X and Y linear scales
     var xLinearScale = xScale(healthData, chosenXAxis);
     var yLinearScale = yScale(healthData, chosenYAxis);
 
     // Create initial axis functions
 
     var bottomAxis = d3.axisBottom(xLinearScale);
     var leftAxis = d3.axisLeft(yLinearScale);

     //Append x and y axes to the chart
     var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    
    // Create circles for the scatterplot
    var circlesGroup = chartGroup.selectAll("g circle")
        .data(healthData)
        .enter()
        .append("g");
    
    // Create circles
    var circles = circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true);
    
    // Create dot text
    var circlesText = circlesGroup.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        .classed("stateText", true);
    
    // Set up the X axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("Poverty Rate (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Median Age");
    
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "income")
        .classed("active", true)
        .text("Median Household Income");

        // Set up the Y axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        
    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2 ))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obesity Rate (%)");
    
    var smokingLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2 ))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smoking Rate (%)");
        
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (height / 2 ))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lack of Healthcare (%)");
    
    // Initial tooltips
    circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

    // X axis event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // Select the label value
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // Replace current x axis with new value
                chosenXAxis = value;

                // Update X scale
                xLinearScale = xScale(healthData, chosenXAxis);

                // Update X Axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Update circles x values
                circles = renderXCircles(circles, xLinearScale, chosenXAxis);

                // Update circle text x values
                circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

                // Update tooltips
                circlesGroup - updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

                // Switch between active labels
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "income") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // Y axis event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            //select the label value
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // Replace current y axis with new value
                chosenYAxis = value;

                // Update Y scale
                yLinearScale = yScale(healthData, chosenYAxis);

                // Update Y Axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Update circles Y values
                circles = renderYCircles(circles, yLinearScale, chosenYAxis);

                // Update circle text Y values
                circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

                // Update tooltips
                circlesGroup - updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

                //Switch between active labels
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokingLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokingLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "obesity"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokingLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
})()