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
        .domain([d3.min(healthData, d => d[chosenYAxis]) *  .8,
            d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

    return yLinearScale;
};

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
};

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
};

function renderText(circlesText, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesText.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]))
        .attr("dy", d => newYScale(d[chosenYAxis]));
    return circlesText;
};
    

// function used for updating circles group with new tooltip // textGroup?
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // Create the tool tip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip)

    //Create the event listener for the tool tip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    .on("mouseout", function(data) {
        toolTip.hide(data);
    });

    return circlesGroup;
};

/// Retrieve data from the CSV file and execute the functions
d3.csv("assets/data/data.csv").then(function(healthData, err) {
    if (err) throw err;

    //Parse the data
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

    // Append X axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // Append Y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Set data for circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
    
    // Bind Data
    var circlesEnter = circlesGroup.enter()
    
    // Create circles
    var circles = circlesEnter.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true);
    
    // Create dot text
    var circlesText = circlesEnter.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        .classed("stateText", true);
    
    // Update tool tip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circles, circlesText);

    // Set up the X axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty Rate (%)");
        // return "20px";
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0 + (height/2))
        .attr("y", 20)
        .attr("value", "age")
        .classed("active", true)
        .text("Median Age");
    
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
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
        .classed("inactive", true)
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
                circles = renderCircles(circles, xLinearScale, chosenXAxis);

                // Update circle text x values
                circlesText = renderText(circlesText, xLinearScale, chosenXAxis);

                // Update tooltips
                circlesGroup - updateToolTip(circlesGroup, chosenXAxis, ChosenYAxis);

                // Switch between active labels
                if (chosenXAxis == "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis == "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis  == "income") {
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
                circles = renderCircles(circles, yLinearScale, chosenYAxis);

                // Update circle text Y values
                circlesText = renderText(circlesText, yLinearScale, chosenYAxis);

                // Update tooltips
                circlesGroup - updateToolTip(circlesGroup, chosenXAxis, ChosenYAxis);

                //Switch between active labels
                if (chosenYAxis == "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokingLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis == "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokingLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis == "obesity"){
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
}).catch(function(err) {
    console.log(err);
})