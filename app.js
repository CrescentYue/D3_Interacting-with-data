//create a scatter plot between two of the data variables such as Healthcare vs. Poverty or Smokers vs. Age.

//Step 1: set the dimensions and margin of the graph 

var svgWidth=600;
var svgHeight=500;

var margin={
    top:40,
    right:30,
    bottom:30,
    left:40
};

var width =svgWidth - margin.right- margin.left;
var height = svgHeight- margin.top - margin.bottom;

// Step 2: append the svg object to the body of the page
// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg=d3
    .select("#scatter")
    .append("svg")
    .attr("width",svgWidth)
    .attr("height",svgHeight);

// Append an SVG group, The <g> SVG element is a container used to group other SVG elements.
//Translates the origin to the top-left corner of the chart area. 
//By default, the origin of a transform is “50% 50%”, which is exactly in the center of any given element. 
//Changing the origin to “top left” causes the element to use the top left corner of the element as a rotation point.

var chartgroup= svg
    .append("g")
    .attr("transform",`translate(${margin.top},${margin.left})`);

//Step 3 create axis

//Initial Params

var chosenXAxis="age";

//function for updating x-scale upon click on axis label

//Scale defines axis's domain and range
//domain (what's shown x axis);range (where x is placed)
//scales have no implicit visual representation
//基本公式scaleX = d3.scaleLinear()
//       .domain([0, d3.max(carData.map(d => d[xEncoding]))])
//       .range([0, width - 2*margin]);

function xScale(data,chosenXAxis){
    //// Add X axis, create scales
    var xLinearScale=d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d =>d [chosenXAxis]) * 1.2
         ])
        .range([0,width]);

return xLinearScale;
};
// function used for updating xAxis var upon click on axis label

//define axes that represent the scales
//The only parameter that axes generator function take is a reference to the scale that they represent. 
//基本公式 axisBottom and axisLeft functions  
//The -bottom and -left suffices indicate the position of the tick marks along the axis.
//基本公式 axisX = d3.axisBottom(scaleX);
function renderAxes(newXScale,xAxis){
    var bottomAxis=d3.axisBottom(newXScale);
//By default the transition will start immediately and will last for a duration of 250ms, 
//this can be changed using the .delay() and .duration() operators.
//When a scale's domain changes, transition the axis.
//axis() creates and returns a function that appends the SVG elements to display the axis. 
//It does not actually append anything. 
//If you don't call the function that is returned, those elements will not be added. 
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

//function used for updating circles with a transition to new circles

function renderCircles(circlesGroup,newXScale,chosenXAxis){
    
    circlesGroup.transition()
    .duration(1000)
    .attr("cx",d=>newXScale(d[chosenXAxis]));
//cx, cy  define the location and ,r is basic attributes of a circle,
return circlesGroup;
};

//function used for updating circles group with new tooltip
//mouseover event

function updateToolTip(chosenXAxis,circlesGroup){

    var label;

    if (chosenXAxis === "age"){
        label =" Age(Median):"
    }
    if ( chosenXAxis === "poverty"){
        label="In Porverty(%):"
    }
    if( chosenXAxis === "income"){
        label="Household Income(Median):"
    };

    var tooltip=d3.tip()
    ////Give a class to this element: we'll have to call it later
        .attr("class","tooltip")
        .offset([80,-60])
        .html(function(d){
            return(`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(tooltip);

    circlesGroup
        .on("mouseover",function(data){
        tooltip.show(data);
     })
        //on mouse event
        .on("mouseout", function(data){
            tooltip.hide(data);
        });

    return circlesGroup;
}

//// Load data from data.csv
d3.csv('data.csv').then(function(data,err){
    if (err) throw err;
    //parse date
    //forEach() method calls a function once for each element in an array, in order
    data.forEach(function(data){
        //parse string as numbers
        data.age=+data.age;
        data.poverty=+data.poverty;
        data.income=+data.income;
        data.smokes=+data.smokes;
    });

    //XlinearScale function above csv import
    var xLinearScale=xScale(data,chosenXAxis);

    //Create y scale 
    var yLinearScale=d3.scaleLinear()
    .domain([d3.min(data,d=>d.smokes)*0.8,d3.max(data,d=>d.smokes)*1.2])
    .range([height-70,0]);
    //create initial axis functions
    var bottomAxis=d3.axisBottom(xLinearScale);
    var leftAxis=d3.axisLeft(yLinearScale);

    //append x axis
    //All xAxis are named with class "x-aixs", therefore you could style them as an single element
    //xAxis is subject to translation, 
    //in the abscense of specifications, the x-axis would be drawn at the top of the drawing area
    var xAxis=chartgroup.append("g")
        .classed("x-axis",true)
        .attr("transform",`translate(0,${height-70})`)
        .call(bottomAxis);

    //append y axis
    chartgroup.append("g")
        .call(leftAxis);

    //append initial circles
    var circlesGroup=chartgroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx",d=>xLinearScale(d[chosenXAxis]))
        .attr("cy",d=>yLinearScale(d.smokes))
        .attr("r",5)
        .attr("fill","blue")
        .attr("opacity",".5");
    //create group for three x-axis labels

    var labelsgroup=chartgroup.append("g")
        .attr("transform",`translate(${width/2},${height-50})`);

    var agelabel=labelsgroup.append("text")
        .attr("x",0)
        .attr("y",10)
        .attr("value","age") // value to grab event listener
        .classed("active",true)
        .text("Age (Median)");

    var povertylabel=labelsgroup.append("text")
        .attr("x",0)
        .attr("y",30)
        .attr("value","poverty")
        .classed("inactive",true)
        .text("In Porverty(%)");

    var incomelabel=labelsgroup.append("text")
        .attr("x",0)
        .attr("y",50)
        .attr("value","income")
        .classed("inactive",true)
        .text("Household Income(Median)");

    //append y axis

    chartgroup.append("text")
        .attr("transform","rotate(-90)")
        .attr("y",0-margin.left)
        .attr("x",0- (height/2))
        .attr("dy","1em")
        .classed("axis-test",true)
        .text("Smokes(%)");

    //update tooltip function above csv import

    var circlesGroup=updateToolTip(chosenXAxis,circlesGroup);

    //x axis labels event listener

    labelsgroup.selectAll("text")
        .on("click", function(){
            //get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis){

            //replace chosenxAxis with value
            chosenXAxis=value;
            //console.log(chosenXAxis)
            //functions here found above csv import
            //update x scale for new data
            //update x scale with transition
            //update circles with new x values
            //update tooptip with new info
            xLinearScale=xScale(data,chosenXAxis);
            xAxis=renderAxes(xLinearScale,xAxis);
            cirslesGroup=renderCircles(circlesGroup,xLinearScale,chosenXAxis);
            circlesGroup=updateToolTip(chosenXAxis,circlesGroup);

            //change classes to change bold text
            if (chosenXAxis==="age"){
                agelabel
                    .classed("active",true)
                    .classed("inactive",false);
                povertylabel
                    .classed("active",false)
                    .classed("inactive",true);
                incomelabel
                    .classed("active",false)
                    .classed("inactive",true);
            }
            if (chosenXAxis==="poverty"){
                agelabel
                    .classed("active",false)
                    .classed("inactive",true);
             povertylabel
                    .classed("active",true)
                    .classed("inactive",false);
                incomelabel
                    .classed("active",false)
                    .classed("inactive",true);

            }   
            else if (chosenXAxis ==="income"){
                agelabel
                    .classed("active",false)
                    .classed("inactive",true);
                povertylabel
                    .classed("active",false)
                    .classed("inactive",true);
                incomelabel
                    .classed("active",true)
                    .classed("inactive",false);
            }
        }
    });

}).catch(function(error){
    console.log(error);
});










