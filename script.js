//Create Map
var map = L.map('map',{
    center: [42.729014, -73.676728],
    zoom: 15
    });

var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
    imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright%22%3EOpenStreetMap</a> contributors'
    }).addTo(map);

var popup = L.popup();
var clickLat = 0;
var clickLong = 0;
//Create marker on map click and get lat/lon
function onMapClick(e) {
  clickLat = e.latlng.lat;
  clickLong = e.latlng.lng;
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString().substring(6,27))
        .openOn(map);
 latNum = e.latlng.lat
  lngNum = e.latlng.lng 
  if (marker) { // check
        map.removeLayer(marker);

    }
  marker = new L.Marker(e.latlng);
  marker.addTo(map);
  marker.bindPopup("Current Latitude and Longitude is " + e.latlng.toString().substring(6,27)).openPopup();
}


//Read boolean array to see if the grid point is covered by water
//If it is, draw a square over the grid point
function drawFlood(gridPoints, flooded, latIncrement, longIncrement, map) {
    for(let i = 0; i < gridPoints.length; i++) {
        for(let j = 0; j < gridPoints[i].length; j++) {
            if(flooded[i][j]) {
                let bounds = [[gridPoints[i][j][0] - latIncrement / 2,
                    gridPoints[i][j][1] - longIncrement / 2],
                    [gridPoints[i][j][0] + latIncrement / 2,
                    gridPoints[i][j][1] + longIncrement / 2]];
                L.rectangle(bounds, {color: 'blue', weight: 1, stroke: false}).addTo(map);
            }
        }
    }
}


//Make points for each river gridPoint on the map
function makeRiverPoints()
{
  gridPoints = [];

  //Loop through the grid and add a point for each grid point on the map
  for(var i = 0; i < gridPoints.length; i++)
  {
    var circleCenter = [gridPoints[i][0], gridPoints[i][1]];
    var circleOptions = {
       color: 'red',
       fillColor: '#f03',
       fillOpacity: 1
    }
    var circle = L.circle(circleCenter, 10, circleOptions);
    circle.addTo(map);
  }
}

map.on('click', onMapClick)



//Get depth value
function getDepth() {
  var text = document.forms["form"]["depth"].value;
  var depth = 0;
  
  if(text != null && text != "")
  {
    depth = document.getElementById("depth").value;
  }
  return depth;
}













 function latlongtogridcoordinate(lat, lng, south, west, latIncrement, longIncrement) {
        return [Math.floor((lat - south) / latIncrement), Math.floor((lng - west) / longIncrement)]
    
  }
	
	function toElevationGrid(gridPoints, height) {
		console.log(height);
		console.log(gridPoints);
    let ret = [];
    for(let i = 0; i < gridPoints.length; i += 1) {
				let temp = []
				for(let j = 0; j < gridPoints[i].length; j++) {
					temp.push(0);
				}
        ret.push(temp);
    }
		console.log(ret);
    for(let i = 0; i < height.length; i++) {
				let index = height[i];
        let x = index[1];
        let y = index[2];
				console.log(i + ": " + x + ', ' + y + ': ' + index[0]);
        ret[x][y] = index[0];
				console.log(x + ',' + y + ',' + ret[x][y]);
    }
    return ret;
}


    function flood(grid, north, east, south, west, pointLat, pointLong, depth) {
				console.log(grid);
				console.log("Other arguments: " + north + ", " + east + ", " + south + ", " + west + ", " + pointLat + ", " + pointLong + ", " + depth);
        //Create "Flooded" array
        let flooded = [];
        for (let i = 0; i < grid.length; i++) {
            let temp = [];
            for (let j = 0; j < grid[i].length; j++) {
                temp.push(false);
            }
            flooded.push(temp);
						console.log(temp);
        }
        
        let lat0 = Math.floor(grid.length * (pointLong - west) / (east - west));
				console.log("Lat0: " + lat0 + " from " + pointLong + ", " +  west + ", " + east + ", " + grid.length);
        let lng0 = Math.floor(grid[0].length * (pointLat - south) / (north - south));
				console.log("lng0: " + lng0 + " from " + pointLat + ", " +  south + ", " + north + ", " + grid[0].length);
        let targetElevation = parseFloat(depth) + parseFloat(grid[lat0][lng0]);
				
				console.log("Target elevation of " + targetElevation + " with water depth of " + depth + " above " + grid[lat0][lng0]);
				
        let items = [{lat: lat0, lng: lng0}]
        while(items.length > 0) {
            let point = items.pop();
            let lat = point.lat;
            let lng = point.lng;
            if(flooded[lat][lng]) {
                continue;
            }
            let elevation = grid[lat][lng];
            if(elevation >= targetElevation) {
                continue;
            }
						console.log("Setting flooded at " + lat + ", " + lng);
            flooded[lat][lng] = true;
            
            if(lat < grid.length - 1) {
                items.push({lat: lat + 1, lng: lng});
                //floodRecursion(grid, lat + 1, lng, flooded, targetElevation);
            }
            if(lng < grid[lat].length - 1) {
                items.push({lat: lat, lng: lng + 1});
                //floodRecursion(grid, lat, lng + 1, flooded, targetElevation);
            }
            if(lat > 0) {
                items.push({lat: lat - 1, lng: lng});
                //floodRecursion(grid, lat - 1, lng, flooded, targetElevation);
            }
            if(lng > 0) {
                items.push({lat: lat, lng: lng - 1});
                //floodRecursion(grid, lat, lng - 1, flooded, targetElevation);
            }
                
        }
        
        //floodRecursion(grid, lat, lng, flooded, targetElevation);
        
        return flooded;
        
    }    

    var lowerLat = map.getBounds().getSouth();
    var upperLat = map.getBounds().getNorth();
    var lowerLon = map.getBounds().getWest();
    var upperLon = map.getBounds().getEast();
		var depth = getDepth();
		//var clickLat = lastEvent.latlng.lat;
		//var clickLong = lastEvent.latlng.lng;
		console.log(lowerLon, clickLong);


function createGrid(){
    /*var lowerLat = 38.086743;
    var upperLat = 38.206623;
    var lowerLon = -122.232857;
    var upperLon = -121.906185;
		var clickLat = lowerLat + 0.1;
		var clickLong = lowerLon + 0.1;*/

    //Change in latitude for 30 meters
    var changeLat = 7/3700;
	var gridPoints = [];

    var countLat = 0;
    var  countLong = 0;
     var changeLon = 7/3700;

    //Grid spaced by 30 meters
     for(var i = lowerLat; i < upperLat; i += changeLat)
     {
         gridPoints[countLat] = [];

        

         //Change in longitude for 30 meters
       //this is a constant of miles at equator

        //Convert to meters
       // changeLon = changeLon * 1609.34;
        countLong = 0;
         for(var j = lowerLon; j < upperLon; j += changeLon)
         {
         	 gridPoints[countLat][countLong] = [];
             gridPoints[countLat][countLong][0] = i;
             //console.log(j);
             gridPoints[countLat][countLong][1] = j;
             countLong++;
         }

          countLat++;
     }
     return gridPoints;
 }

//$(document).ready(function () {


var rivers = new Map();

var ways = new Map();

var nodes = new Map();


var height = [];

function submitData() {
  
console.log("clicked");

     lowerLat = map.getBounds().getSouth();
     upperLat = map.getBounds().getNorth();
     lowerLon = map.getBounds().getWest();
     upperLon = map.getBounds().getEast();
		 depth = getDepth();
//pass in an array
gridPoints = createGrid();
console.log(gridPoints);
var coords = "";
var chars = 142;


for(var i = 0; i < gridPoints.length; i++) {
    var sub = gridPoints[i];

    //console.log(sub);
    for(var j = 0; j < sub.length; j++) {
    	var subsub = sub[j];



 	 // console.log(subsub);
    	 	
    	 	/*if (j==0){
    	 		coords+=subsub+",";
    	 	} else {
    	 		coords+=subsub;
    	 	}*/
    	 	
    	 coords += subsub[0] + "," + subsub[1] + "|";

    }
       	 //coords+="|";

}

//coords = coords.substring(0, coords.length - 1);


console.log(coords);
var data = coords;
    var parsedData = [];

    var max = 7000;
    var count = 0;
    var newRow = true;
    var secondCount = 0;
    while(count < data.length - 1)
    {
        var pairCount = 0;
        var temp = count;
        while(pairCount == 0 || data.charAt(temp) != '|')
        {
            pairCount++;
            temp++;
        }
        //pairCount = 10;
        if(1 + count + pairCount < max * (secondCount + 1))
        {
            for(var i = 0; i < pairCount; i++)
            {


                if(newRow)
                {
                    parsedData[secondCount] = data.charAt(count);
                    newRow = false;
                }
                else
                {
                    parsedData[secondCount] += data.charAt(count);
                }



                count++;
            //    console.log(secondCount);
            }
        }

        else
        {
            newRow = true;
         //   console.log("HIII");
            secondCount++;
        }

}
//console.log("test");


for (var i = 1; i < parsedData.length; i++){
	parsedData[i] = parsedData[i].substr(1); 
}

//console.log(parsedData);
//console.log(parsedData[0]);

/*
for(var i = 0; i < gridPoints.length; i++) {
    var hsub = gridPoints[i];
    height.push([]);
    for(var j = 0; j < hsub.length; j++) {
    	var hsubsub = hsub[j];

    	height[i].push(hsubsub);
    	 	
    	 

    }
    height[i].push("mem");
        	

}
*/

	
//coords = "39.7391536,-104.9847034|32.7391536,-104.9847034";

//var link2 = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/elevation/json?locations=39.7391536,-104.9847034&key=AIzaSyDDi1AcGVDSECE3Kh8TgNva7_YKuq2W-1Q";
var counter = 0;
for (var i = 0; i < parsedData.length; i++){

	var link = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/elevation/json?locations=" + parsedData[i] + "&key=AIzaSyDDi1AcGVDSECE3Kh8TgNva7_YKuq2W-1Q";

$.getJSON(link, function( data ) {
	//console.log(data);	
	//console.log(data.results.length);
	for (var j = 0; j < data.results.length; j++){
	//	console.log(data.results[j].elevation);
		var elev = data.results[j].elevation;
		if (elev<0.00001){
			elev = 0.00001;
		}
		var increment = 7/3700;
		var coords = latlongtogridcoordinate(data.results[j].location.lat,data.results[j].location.lng,  lowerLat, lowerLon, increment, increment);
		let temp = [parseFloat(elev), parseFloat(coords[0]), parseFloat(coords[1])];
		height.push(temp);
		console.log("JSON GOT");

	}
	counter++;
	if(counter == parsedData.length) {
		cont(gridPoints, height, upperLat, upperLon, lowerLat, lowerLon, clickLat, clickLong, depth);
	}

	});

}

//console.log(height);


function cont(gridPoints, height, upperLat, upperLon, lowerLat, lowerLon, clickLat, clickLong, depth) {
	console.log(height[0]);
	console.log("EE");
	console.log(height.length);
	var floodGrid = toElevationGrid(gridPoints, height);
  console.log(floodGrid);
	console.log(lowerLon, clickLong);
	console.log(upperLat + ", " + upperLon + ", " + lowerLat + ", " + lowerLon + ", " + clickLat + ", " + clickLong + ", " + depth);
  var flooded = flood(floodGrid, upperLat, upperLon, lowerLat, lowerLon, clickLat, clickLong, depth);
	console.log(flooded);
  drawFlood(gridPoints, flooded, 7/3700, 7/3700, map);
}
}


/*$("#go").click(function () {
console.log("clicked");
var coords = $("#address").val();

//int lat = coords


//int southwest = 

//var link = "https://overpass-turbo.eu/?Q=";
var link = "https://www.overpass-api.de/api/interpreter?data=";
link += "%0D%0A%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0D%0A%28%0D%0A++node%5B%22waterway%22%3D%22river%22%5D%28"+coords+"%29%3B%0D%0A++way%5B%22waterway%22%3D%22river%22%5D%28"+coords+"%29%3B%0D%0A++relation%5B%22waterway%22%3D%22river%22%5D%28"+coords+"%29%3B%0D%0A%29%3B%0D%0A%0D%0Aout+body%3B%0D%0A%3E%3B%0D%0Aout+skel+qt%3B";


$.getJSON(link, function( data ) {
  var items = [];
  $.each( data, function( key, val ) {

  	console.log(key);
  	if(key=="elements"){

  		for (var i = 0;  i < val.length; i++) {
  			if (val[i].type=="node"){
  				var longlat = "" +val[i].lon + ",";
  				longlat+=val[i].lat;
  				nodes.set(val[i].id, longlat);
  			}
  			
        
    	}

    	for (var i = 0; i< val.length; i++ ){
    		if (val[i].type=="way"){
    			var nodeArray = [];
    			for (var j = 0; j < val[i].nodes.length; j++){
    				nodeArray.push(nodes.get(val[i].nodes[j]));
    			}
    			ways.set(val[i].id, nodeArray);
    			 
    		}
    	}

    	for (var i = 0; i < val.length; i++){
    		if (val[i].type=="relation"){
    			var wayArray = [];

    			for (var j = 0; j < val[i].members.length; j++){
    				wayArray.push(ways.get(val[i].members[j].ref));

    			}

    			rivers.set(val[i].tags.name, wayArray);
    		}
    	}


  	}
   
  });

for (var value of rivers.values()) {
  
  console.log(value);
}


});

});
});*/
