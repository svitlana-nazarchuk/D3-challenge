//This function automaticaly resizes the chart
//==============================================
function makeResponsive() {

    // If the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    //==============================================================
    var svgArea = d3.select("body").select("svg");
    
      // clear svg if not empty
      if (!svgArea.empty()) {
        svgArea.remove();
      }
    
    // Set up the chart
    //=================================
    var svgWidth = (window.innerWidth*3)/4;
    var svgHeight = (window.innerHeight)/2+50;
    var border=1;
    var borderColor='black';
    
    var margin = {
      top: 20,
      right: 20,
      bottom: 70,
      left: 70
    };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    
    //Create an SVG wrapper
    // =================================
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("border", border)
      .attr("bordercolor", borderColor);
    
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial parameters
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare"
    
    // function used for updating x-scale var upon click on bottomAxis label
    function xLinearScale(data, chosenXAxis) {
        var xScale = d3.scaleLinear()
          .domain([d3.min(data, d=>d[chosenXAxis]),
                d3.max(data, d=>d[chosenXAxis])])
          .range([0, width])
          .nice();
        return xScale;
    }

    // function used for updating xAxis var upon click on bottomAxis label
    function renderXAxis(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
         
      return xAxis;
    }

    // function used for updating y-scale var upon click on leftAxis label
    function yLinearScale(data, chosenYAxis) {
        var yScale = d3.scaleLinear()
          .domain([d3.min(data, d=>d[chosenYAxis]),
                d3.max(data, d=>d[chosenYAxis])])
          .range([height, 0])
          .nice();
        return yScale;
    }

    // function used for updating yAxis var upon click on leftAxis label
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
          .duration(1000)
          .call(leftAxis); 
        return yAxis;
      }

    // function used for updating circles group with a transition to
    // new circles for xLabels
    function renderXCircles(circles, text, newXScale, chosenXAxis) {

        circles.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            
        text.transition()
            .duration(1000)
            .attr("x", d=>(newXScale(d[chosenXAxis])-10));
        return (circles, text);
      }

    // function used for updating circles group with a transition to
    // new circles for yLabels
    function renderYCircles(circles, text, newYScale, chosenYAxis) {

        circles.transition()
            .duration(1000)
            .attr("cy", d => newYScale(d[chosenYAxis]))
            
        text.transition()
            .duration(1000)
            .attr("y", d=>(newYScale(d[chosenYAxis])+5));
        return (circles, text);
      }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circleGroups) {

        var xLabel;
        var yLabel;
    
        if (chosenXAxis === "poverty") {
        xLabel = "Poverty(%):";
        }
        else if(chosenXAxis === "age"){
        xLabel = "Age(Median):";
        };

        if (chosenYAxis === "healthcare") {
            yLabel = "Lacks Healthcare(%):";
            }
        else if (chosenYAxis === "smokes"){
            yLabel = "Smokes(%):";
            };

        var toolTip=d3.tip()
            .attr("class", "d3-tip")
            //.offset([80, -60])
            .html(function(d){
            return (`<strong>${d.state}</strong><br>${xLabel}${d[chosenXAxis]}
            <br>${yLabel}${d[chosenYAxis]}`)
        });

        circleGroups.call(toolTip);

        circleGroups.on("mouseover", function(d){
            toolTip.show(d, this);
          })
                .on("mouseout", function(d){
            toolTip.hide(d);
          });
    }
    
  // Import data from the data.csv file
    // =================================
    d3.csv("assets/data/data.csv").then(function(stateData) {
        console.log(stateData);
        // Format the data
        stateData.forEach(function(data){
            data.poverty=+data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes=+data.smokes
            });
             
        
        var healthcare=[];
        healthcare=stateData.map(d=>d.healthcare);
        
        var poverty=[];
        poverty=stateData.map(d=>d.poverty);
    
        var age=[];
        age=stateData.map(d=>d.age);
    
        var smokers=[];
        smokers=stateData.map(d=>d.smokes);
    
        // xScale function above csv import
        console.log(chosenXAxis);
        var xScale = xLinearScale(stateData, chosenXAxis);
        
        // yScale function above csv import
        console.log(chosenYAxis);
        var yScale = yLinearScale(stateData, chosenYAxis);
        
        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xScale);
        var leftAxis = d3.axisLeft(yScale);
        
        // append x axis
        var xAxis = chartGroup.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(bottomAxis); 

        // append y axis
        var yAxis=chartGroup.append("g").call(leftAxis);

        
        // append initial circles
        var join = chartGroup.selectAll(".points").data(stateData);
    
        var circleGroups = join
          .enter()
          .append("g")
          
        //Append circles to the join groups  
        var circles=circleGroups.append("circle")
          .attr("cx", d=>xScale(d.poverty))
          .attr("cy", d=>yScale(d.healthcare))
          .attr("r", 15)
          .attr("stroke","black")
          .attr("fill", "blue")
          .attr("opacity", 0.5);
        
        //Append text to the join groups
        var texts=circleGroups.append("text")
              .data(stateData)
              .text( function (d) { return d.abbr; })
              .attr("x", d=>(xScale(d.poverty)-10))
              .attr("y", d=>(yScale(d.healthcare)+5))
              .attr("font-family", "sans-serif")
              .attr("font-size", "15px");  
        
        //append initial tooltips
        updateToolTip(chosenXAxis, chosenYAxis, circleGroups);
        
        // Create group for  2 x-axis labels
        var xLabelsGroup = chartGroup.append("g")
            
        //Create group for 2 y-axis labels
        var yLabelsGroup = chartGroup.append("g")
        
        // Create axes labels
        //==========================================
        var povertyLabel=xLabelsGroup.append("text")
          .attr("transform", `translate(${(width/2)-40}, ${height+40})`)
          .attr("value", "poverty") // value to grab for event listener
          .classed("active", true)
          .text("In Poverty(%)");
    
        var ageLabel=xLabelsGroup.append("text")
          .attr("transform", `translate(${(width/2)-40}, ${height+60})`)
          .attr("value", "age") // value to grab for event listener
          .classed("inactive", true)
          .text("Age(Median)");

        var healthcareLabel=yLabelsGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left + 40)
          .attr("x", 0 - (height / 2))
          .attr("value", "healthcare") // value to grab for event listener
          .classed("active", true)
          .text("Lacks Healthcare (%)");

        var smokersLabel=yLabelsGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left + 20)
          .attr("x", 0 - (height / 2))
          .attr("value", "smokes") // value to grab for event listener
          .classed("inactive", true)
          .text("Smokes (%)");

        //y axis labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function(){
                var value=d3.select(this).attr("value");
                console.log(`YValue:${value}`);
                if(value !== chosenYAxis){
                    chosenYAxis=value;
                    yScale=yLinearScale(stateData, chosenYAxis);
                    yAxis=renderYAxis(yScale, yAxis);
                    renderYCircles(circles, texts, yScale, chosenYAxis);
                    updateToolTip(chosenXAxis, chosenYAxis, circleGroups);
                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                        smokersLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                    else if (chosenYAxis === "smokes"){
                        healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        smokersLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }
                }
            })
        

        // x axis labels event listener
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                console.log(`XValue:${value}`);
                if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xScale = xLinearScale(stateData, chosenXAxis);
                
                // updates x axis with transition
                xAxis = renderXAxis(xScale, xAxis);

                // updates circles with new x values
                renderXCircles(circles, texts, xScale, chosenXAxis);
                
                // updates tooltips with new info
                updateToolTip(chosenXAxis, chosenYAxis, circleGroups);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "age"){
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
            }
        }) 
    
        }).catch(function(error) {
            console.log(error);
        });
    }
    // When the browser loads, makeResponsive() is called.
    //====================================================
    makeResponsive();
    
    // When the browser window is resized, makeResponsive() is called.
    //===============================================================
    d3.select(window).on("resize", makeResponsive);