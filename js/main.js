angular.module('floodforecast', []).

controller('AppCtrl', function($scope,$http,$q,$sce) {

  var graphic;

  $scope.map;
  //Boulder
  $scope.location = [-104.9847, 39.7392];
  $scope.badHouses = [];

  $scope.when = [];
  $scope.forecast = "No rain in the forecast";
  $scope.altitude;
  $scope.address='';
  $scope.phone='';
  $scope.address='';
  $scope.user_id='';
  $scope.email='';  
  $scope.signup = "Sign Up";

  require(["esri/symbols/SimpleMarkerSymbol", "dojo/_base/array", "dojo/string", "esri/tasks/QueryTask", "esri/tasks/query", "esri/map", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/FeatureLayer", "dojo/domReady!"], 
   function(SimpleMarkerSymbol, array, dojoString, QueryTask, Query, Map, ArcGISDynamicMapServiceLayer, FeatureLayer) { 
    $scope.map = new Map("map", {
      center: $scope.location,
      zoom: 13,
      basemap: "streets"
    });

    $scope.flood = new FeatureLayer("http://services2.arcgis.com/XrTRbkeSS1aM6EfD/ArcGIS/rest/services/Dissolve%20Boulder%20floodplain/FeatureServer/0");
    $scope.houses = new FeatureLayer("http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/floody_houses/FeatureServer/0");
    $scope.houses.setSelectionSymbol(new SimpleMarkerSymbol({
      "color": [255,128,128,128],
      "size": 12,
      "style": "esriSMSCircle"
    }));

    $scope.map.addLayers([$scope.flood,$scope.houses]);

    // once both layers are loaded
    $scope.map.on("layers-add-result", function() {
      
      // get the polygon feature
      $scope.query1 = new Query();
      $scope.query1.where = "1=1";
      $scope.flood.queryFeatures($scope.query1, function(results){
          
          // get geometry of polygon feature
          $scope.query2 = new Query();
          $scope.query2.geometry = results.features[0].geometry; 
          
          // select only houses that are inside polygon geometry
          $scope.houses.selectFeatures($scope.query2, FeatureLayer.SELECTION_NEW, function(results){
              // returning FID for matching items
              $scope.badHouses = results;
              console.log(results);
          });
      });
      if ( $scope.houses.hasOwnProperty("fields") ) {
        console.log("got some fields");
        
        var fieldInfo, pad;
          pad = dojoString.pad;

        fieldInfo = array.map($scope.houses.fields, function(f) {
          return pad("Field:", 8, " ", true) + pad(f.name, 25, " ", true) + 
            pad("Alias:", 8, " ", true) + pad(f.alias, 25, " ", true) + 
            pad("Type:", 8, " ", true) + pad(f.type, 25, " ", true);
        });
        console.log(fieldInfo.join("\n"));
      }
    });



  });

  $scope.hasAlert = function(){
    switch($scope.score){
      case 1:
        $scope.forecast = "You are in a flood area, move to higher ground";
      break;
      case 2:
        $scope.forecast = "";
      break;
      case 3:
        $scope.forecast = "";
      break;
      case 4:
        $scope.forecast = "Looks like rain";
      break;
    }
  };

  $scope.saveUser = function(){
    if($scope.signup == "Sign Up"){

      $scope.signup = "Saving...";

      var args = {"geometry":{"x":$scope.location[1],"y":$scope.location[0]},"attributes":{"phone":$scope.phone,"email":$scope.email}};

      if($scope.address)
        args.address = $scope.address;

      $http.post('save.php', args).then(function(response){     
        if(response.data.addResults && response.data.addResults.length != 0){
          $scope.user_id = response.data.addResults[0].objectId;
          $scope.signup = "Change Address";
          $('.in-phone').addClass('hide');
          $('.in-address').removeClass('hide').focus();
        }
      },function(){
        //failed posting
        $scope.signup = "Sign Up";
      });

    } else if($scope.signup == "Change Address"){

      $scope.signup = "Saving...";

      geoCodeAddress().then(function(){
        // success
        var args = {"geometry":{"x":$scope.location[1],"y":$scope.location[0]},"attributes":{"phone":$scope.phone,"email":$scope.email}};

        if($scope.user_id)
          args.attributes.FID = $scope.user_id;

        if($scope.address)
          args.attributes.address = $scope.address;

        $http.post('update.php', args).then(function(response){

          if(response.data.addResults && response.data.addResults.length != 0){
            $scope.user_id = response.data.addResults[0].objectId;
            $scope.signup = "Sign Up";
            $('.in-phone').removeClass('hide');
            $('.in-address').addClass('hide');
          }
        },function(){
          //failed posting
          $scope.signup = "Change Address";
        });

      }, function(){
        //invalid address
      });
      
    }
  };

  function geoCodeAddress(){
    
    var deferred = $q.defer();

    $http.jsonp('http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?f=pjson&text='+$scope.address+'&callback=JSON_CALLBACK',{timeout: 10000}).then(function(response){

            console.log(response.data.locations[0].feature.geometry);

           if(response.data.locations && response.data.locations.length != 0 ){
            $scope.location = [response.data.locations[0].feature.geometry.x, response.data.locations[0].feature.geometry.y];
            updateMap();
            deferred.resolve( );
           } else {
            deferred.reject( );
           }                  
      });        
    return deferred.promise;
  }

  function getForecast(){
    
      $http.jsonp('https://api.forecast.io/forecast/e9c963d9b9cecdf941a11d1c2c46f4e5/'+$scope.location[1]+','+$scope.location[0]+'?callback=JSON_CALLBACK',{timeout: 10000}).then(function(response){

          figureForecast( response.data ); 
                  
      });        
  }

  function DateDiff(date1, date2) {
    return date1.getTime() - date2.getTime();
  }

  function figureForecast(data){

    data={"latitude":39.7334895,"longitude":-104.9926232,"timezone":"America/Denver","offset":-6,"currently":{"time":1401563955,"summary":"Partly Cloudy","icon":"partly-cloudy-day","nearestStormDistance":0,"precipIntensity":0,"precipProbability":0,"temperature":76.42,"apparentTemperature":76.42,"dewPoint":51.91,"humidity":0.42,"windSpeed":2.08,"windBearing":73,"visibility":3.6,"cloudCover":0.26,"pressure":1010.27,"ozone":310.43},"minutely":{"summary":"Drizzle starting in 40 min.","icon":"rain","data":[{"time":1401563940,"precipIntensity":0,"precipProbability":0},{"time":1401564000,"precipIntensity":0,"precipProbability":0},{"time":1401564060,"precipIntensity":0,"precipProbability":0},{"time":1401564120,"precipIntensity":0,"precipProbability":0},{"time":1401564180,"precipIntensity":0,"precipProbability":0},{"time":1401564240,"precipIntensity":0,"precipProbability":0},{"time":1401564300,"precipIntensity":0,"precipProbability":0},{"time":1401564360,"precipIntensity":0,"precipProbability":0},{"time":1401564420,"precipIntensity":0,"precipProbability":0},{"time":1401564480,"precipIntensity":0,"precipProbability":0},{"time":1401564540,"precipIntensity":0,"precipProbability":0},{"time":1401564600,"precipIntensity":0,"precipProbability":0},{"time":1401564660,"precipIntensity":0,"precipProbability":0},{"time":1401564720,"precipIntensity":0,"precipProbability":0},{"time":1401564780,"precipIntensity":0,"precipProbability":0},{"time":1401564840,"precipIntensity":0,"precipProbability":0},{"time":1401564900,"precipIntensity":0,"precipProbability":0},{"time":1401564960,"precipIntensity":0,"precipProbability":0},{"time":1401565020,"precipIntensity":0,"precipProbability":0},{"time":1401565080,"precipIntensity":0,"precipProbability":0},{"time":1401565140,"precipIntensity":0,"precipProbability":0},{"time":1401565200,"precipIntensity":0.002,"precipIntensityError":0.0002,"precipProbability":0.01,"precipType":"rain"},{"time":1401565260,"precipIntensity":0.002,"precipIntensityError":0.0002,"precipProbability":0.01,"precipType":"rain"},{"time":1401565320,"precipIntensity":0.002,"precipIntensityError":0.0002,"precipProbability":0.01,"precipType":"rain"},{"time":1401565380,"precipIntensity":0.0021,"precipIntensityError":0.0003,"precipProbability":0.03,"precipType":"rain"},{"time":1401565440,"precipIntensity":0.0021,"precipIntensityError":0.0003,"precipProbability":0.03,"precipType":"rain"},{"time":1401565500,"precipIntensity":0.0021,"precipIntensityError":0.0006,"precipProbability":0.05,"precipType":"rain"},{"time":1401565560,"precipIntensity":0.0022,"precipIntensityError":0.0007,"precipProbability":0.05,"precipType":"rain"},{"time":1401565620,"precipIntensity":0.0022,"precipIntensityError":0.0008,"precipProbability":0.06,"precipType":"rain"},{"time":1401565680,"precipIntensity":0.0023,"precipIntensityError":0.001,"precipProbability":0.09,"precipType":"rain"},{"time":1401565740,"precipIntensity":0.0024,"precipIntensityError":0.0011,"precipProbability":0.1,"precipType":"rain"},{"time":1401565800,"precipIntensity":0.0025,"precipIntensityError":0.0012,"precipProbability":0.13,"precipType":"rain"},{"time":1401565860,"precipIntensity":0.0027,"precipIntensityError":0.0013,"precipProbability":0.16,"precipType":"rain"},{"time":1401565920,"precipIntensity":0.0028,"precipIntensityError":0.0014,"precipProbability":0.18,"precipType":"rain"},{"time":1401565980,"precipIntensity":0.0029,"precipIntensityError":0.0015,"precipProbability":0.22,"precipType":"rain"},{"time":1401566040,"precipIntensity":0.003,"precipIntensityError":0.0015,"precipProbability":0.25,"precipType":"rain"},{"time":1401566100,"precipIntensity":0.0031,"precipIntensityError":0.0015,"precipProbability":0.31,"precipType":"rain"},{"time":1401566160,"precipIntensity":0.0032,"precipIntensityError":0.0016,"precipProbability":0.33,"precipType":"rain"},{"time":1401566220,"precipIntensity":0.0033,"precipIntensityError":0.0016,"precipProbability":0.36,"precipType":"rain"},{"time":1401566280,"precipIntensity":0.0034,"precipIntensityError":0.0017,"precipProbability":0.42,"precipType":"rain"},{"time":1401566340,"precipIntensity":0.0035,"precipIntensityError":0.0017,"precipProbability":0.44,"precipType":"rain"},{"time":1401566400,"precipIntensity":0.0036,"precipIntensityError":0.0018,"precipProbability":0.49,"precipType":"rain"},{"time":1401566460,"precipIntensity":0.0037,"precipIntensityError":0.0018,"precipProbability":0.52,"precipType":"rain"},{"time":1401566520,"precipIntensity":0.0038,"precipIntensityError":0.0018,"precipProbability":0.55,"precipType":"rain"},{"time":1401566580,"precipIntensity":0.0039,"precipIntensityError":0.0019,"precipProbability":0.57,"precipType":"rain"},{"time":1401566640,"precipIntensity":0.0039,"precipIntensityError":0.0019,"precipProbability":0.59,"precipType":"rain"},{"time":1401566700,"precipIntensity":0.0041,"precipIntensityError":0.002,"precipProbability":0.65,"precipType":"rain"},{"time":1401566760,"precipIntensity":0.0041,"precipIntensityError":0.002,"precipProbability":0.65,"precipType":"rain"},{"time":1401566820,"precipIntensity":0.0041,"precipIntensityError":0.002,"precipProbability":0.68,"precipType":"rain"},{"time":1401566880,"precipIntensity":0.0042,"precipIntensityError":0.0021,"precipProbability":0.7,"precipType":"rain"},{"time":1401566940,"precipIntensity":0.0042,"precipIntensityError":0.0021,"precipProbability":0.7,"precipType":"rain"},{"time":1401567000,"precipIntensity":0.0044,"precipIntensityError":0.0021,"precipProbability":0.73,"precipType":"rain"},{"time":1401567060,"precipIntensity":0.0044,"precipIntensityError":0.0022,"precipProbability":0.73,"precipType":"rain"},{"time":1401567120,"precipIntensity":0.0045,"precipIntensityError":0.0021,"precipProbability":0.74,"precipType":"rain"},{"time":1401567180,"precipIntensity":0.0045,"precipIntensityError":0.0023,"precipProbability":0.74,"precipType":"rain"},{"time":1401567240,"precipIntensity":0.0045,"precipIntensityError":0.0022,"precipProbability":0.74,"precipType":"rain"},{"time":1401567300,"precipIntensity":0.0046,"precipIntensityError":0.0023,"precipProbability":0.75,"precipType":"rain"},{"time":1401567360,"precipIntensity":0.0045,"precipIntensityError":0.0023,"precipProbability":0.74,"precipType":"rain"},{"time":1401567420,"precipIntensity":0.0046,"precipIntensityError":0.0023,"precipProbability":0.74,"precipType":"rain"},{"time":1401567480,"precipIntensity":0.0046,"precipIntensityError":0.0024,"precipProbability":0.74,"precipType":"rain"},{"time":1401567540,"precipIntensity":0.0058,"precipIntensityError":0.0032,"precipProbability":0.05,"precipType":"rain"}]},"hourly":{"summary":"Light rain starting later this afternoon, continuing until this evening.","icon":"rain","data":[{"time":1401562800,"summary":"Drizzle","icon":"rain","precipIntensity":0.0051,"precipProbability":0.38,"precipType":"rain","temperature":76.25,"apparentTemperature":76.25,"dewPoint":52.48,"humidity":0.44,"windSpeed":2.44,"windBearing":61,"visibility":2.72,"cloudCover":0.22,"pressure":1010.47,"ozone":311.22},{"time":1401566400,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0039,"precipProbability":0.33,"precipType":"rain","temperature":76.77,"apparentTemperature":76.77,"dewPoint":50.66,"humidity":0.4,"windSpeed":1.81,"windBearing":110,"visibility":5.46,"cloudCover":0.36,"pressure":1009.84,"ozone":308.75},{"time":1401570000,"summary":"Light Rain","icon":"rain","precipIntensity":0.0134,"precipProbability":0.5,"precipType":"rain","temperature":77.37,"apparentTemperature":77.37,"dewPoint":49.73,"humidity":0.38,"windSpeed":2.93,"windBearing":158,"visibility":7.13,"cloudCover":0.44,"pressure":1009.28,"ozone":306.89},{"time":1401573600,"summary":"Light Rain","icon":"rain","precipIntensity":0.0111,"precipProbability":0.52,"precipType":"rain","temperature":77.62,"apparentTemperature":77.62,"dewPoint":49.52,"humidity":0.37,"windSpeed":3.98,"windBearing":170,"visibility":8.4,"cloudCover":0.5,"pressure":1008.81,"ozone":306.21},{"time":1401577200,"summary":"Drizzle","icon":"rain","precipIntensity":0.007,"precipProbability":0.36,"precipType":"rain","temperature":77.68,"apparentTemperature":77.68,"dewPoint":48.98,"humidity":0.37,"windSpeed":4.48,"windBearing":165,"visibility":9.17,"cloudCover":0.52,"pressure":1008.46,"ozone":306.14},{"time":1401580800,"summary":"Drizzle","icon":"rain","precipIntensity":0.0063,"precipProbability":0.55,"precipType":"rain","temperature":76.92,"apparentTemperature":76.92,"dewPoint":48.58,"humidity":0.37,"windSpeed":4.14,"windBearing":170,"visibility":9.58,"cloudCover":0.57,"pressure":1008.29,"ozone":306.15},{"time":1401584400,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0031,"precipProbability":0.22,"precipType":"rain","temperature":75.03,"apparentTemperature":75.03,"dewPoint":48.63,"humidity":0.39,"windSpeed":3.91,"windBearing":173,"visibility":10,"cloudCover":0.52,"pressure":1008.31,"ozone":306.23},{"time":1401588000,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0014,"precipProbability":0.09,"precipType":"rain","temperature":71.59,"apparentTemperature":71.59,"dewPoint":48.77,"humidity":0.44,"windSpeed":3.78,"windBearing":158,"visibility":10,"cloudCover":0.44,"pressure":1008.47,"ozone":306.39},{"time":1401591600,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0008,"precipProbability":0.02,"precipType":"rain","temperature":68.34,"apparentTemperature":68.34,"dewPoint":48.46,"humidity":0.49,"windSpeed":3.85,"windBearing":177,"visibility":10,"cloudCover":0.29,"pressure":1008.7,"ozone":306.18},{"time":1401595200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":65.73,"apparentTemperature":65.73,"dewPoint":48.83,"humidity":0.54,"windSpeed":5.04,"windBearing":198,"visibility":10,"cloudCover":0.21,"pressure":1009.06,"ozone":305.21},{"time":1401598800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":63.75,"apparentTemperature":63.75,"dewPoint":48.29,"humidity":0.57,"windSpeed":6.25,"windBearing":210,"visibility":10,"cloudCover":0.19,"pressure":1009.48,"ozone":303.88},{"time":1401602400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":62.03,"apparentTemperature":62.03,"dewPoint":47.69,"humidity":0.59,"windSpeed":6.99,"windBearing":216,"visibility":10,"cloudCover":0.16,"pressure":1009.77,"ozone":302.89},{"time":1401606000,"summary":"Clear","icon":"clear-night","precipIntensity":0.001,"precipProbability":0.03,"precipType":"rain","temperature":60.53,"apparentTemperature":60.53,"dewPoint":47.11,"humidity":0.61,"windSpeed":7.22,"windBearing":217,"visibility":9.99,"cloudCover":0.17,"pressure":1009.87,"ozone":302.4},{"time":1401609600,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0024,"precipProbability":0.07,"precipType":"rain","temperature":59.42,"apparentTemperature":59.42,"dewPoint":46.56,"humidity":0.62,"windSpeed":7.16,"windBearing":215,"visibility":9.98,"cloudCover":0.26,"pressure":1009.86,"ozone":302.26},{"time":1401613200,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0031,"precipProbability":0.09,"precipType":"rain","temperature":58.48,"apparentTemperature":58.48,"dewPoint":46.33,"humidity":0.64,"windSpeed":7.13,"windBearing":214,"visibility":9.98,"cloudCover":0.34,"pressure":1009.8,"ozone":302.79},{"time":1401616800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0026,"precipProbability":0.08,"precipType":"rain","temperature":57.56,"apparentTemperature":57.56,"dewPoint":45.69,"humidity":0.65,"windSpeed":7.32,"windBearing":222,"visibility":9.98,"cloudCover":0.39,"pressure":1009.77,"ozone":303.85},{"time":1401620400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0015,"precipProbability":0.06,"precipType":"rain","temperature":56.55,"apparentTemperature":56.55,"dewPoint":44.72,"humidity":0.64,"windSpeed":7.69,"windBearing":230,"visibility":9.99,"cloudCover":0.46,"pressure":1009.68,"ozone":305.59},{"time":1401624000,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0006,"precipProbability":0.03,"precipType":"rain","temperature":57.07,"apparentTemperature":57.07,"dewPoint":44.41,"humidity":0.63,"windSpeed":7.94,"windBearing":235,"visibility":10,"cloudCover":0.52,"pressure":1009.33,"ozone":308.79},{"time":1401627600,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0002,"precipProbability":0.02,"precipType":"rain","temperature":60.26,"apparentTemperature":60.26,"dewPoint":45.25,"humidity":0.58,"windSpeed":6.79,"windBearing":234,"visibility":10,"cloudCover":0.46,"pressure":1008.47,"ozone":314.57},{"time":1401631200,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0001,"precipProbability":0.01,"precipType":"rain","temperature":65.05,"apparentTemperature":65.05,"dewPoint":45.62,"humidity":0.49,"windSpeed":5.37,"windBearing":239,"visibility":10,"cloudCover":0.35,"pressure":1007.33,"ozone":321.81},{"time":1401634800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":69.86,"apparentTemperature":69.86,"dewPoint":44.68,"humidity":0.4,"windSpeed":4.96,"windBearing":248,"visibility":10,"cloudCover":0.23,"pressure":1006.55,"ozone":327.95},{"time":1401638400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":74.74,"apparentTemperature":74.74,"dewPoint":43.49,"humidity":0.33,"windSpeed":5.57,"windBearing":261,"visibility":10,"cloudCover":0.19,"pressure":1006.1,"ozone":332.32},{"time":1401642000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":77.79,"apparentTemperature":77.79,"dewPoint":41,"humidity":0.27,"windSpeed":6.72,"windBearing":269,"visibility":10,"cloudCover":0.19,"pressure":1005.77,"ozone":335.58},{"time":1401645600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":79.75,"apparentTemperature":79.75,"dewPoint":37.88,"humidity":0.22,"windSpeed":7.55,"windBearing":274,"visibility":10,"cloudCover":0.2,"pressure":1005.54,"ozone":337.16},{"time":1401649200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":80.08,"apparentTemperature":78.71,"dewPoint":37.04,"humidity":0.21,"windSpeed":7.7,"windBearing":276,"visibility":10,"cloudCover":0.16,"pressure":1005.37,"ozone":336.43},{"time":1401652800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":80.06,"apparentTemperature":78.66,"dewPoint":36.15,"humidity":0.21,"windSpeed":7.47,"windBearing":281,"visibility":10,"cloudCover":0.18,"pressure":1005.26,"ozone":334.02},{"time":1401656400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":79.81,"apparentTemperature":79.81,"dewPoint":35.35,"humidity":0.2,"windSpeed":7.63,"windBearing":287,"visibility":10,"cloudCover":0.19,"pressure":1005.21,"ozone":331.13},{"time":1401660000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":79.59,"apparentTemperature":79.59,"dewPoint":34.24,"humidity":0.19,"windSpeed":8.94,"windBearing":294,"visibility":10,"cloudCover":0.18,"pressure":1005.15,"ozone":327.96},{"time":1401663600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":79.13,"apparentTemperature":79.13,"dewPoint":33.36,"humidity":0.19,"windSpeed":10.08,"windBearing":303,"visibility":10,"cloudCover":0.15,"pressure":1005.19,"ozone":324.31},{"time":1401667200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":77.55,"apparentTemperature":77.55,"dewPoint":33.15,"humidity":0.2,"windSpeed":10.42,"windBearing":307,"visibility":10,"cloudCover":0.11,"pressure":1005.53,"ozone":320.84},{"time":1401670800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":74.69,"apparentTemperature":74.69,"dewPoint":34.06,"humidity":0.23,"windSpeed":9.64,"windBearing":305,"visibility":10,"cloudCover":0.07,"pressure":1006.32,"ozone":317.69},{"time":1401674400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":70.61,"apparentTemperature":70.61,"dewPoint":34.8,"humidity":0.27,"windSpeed":8.01,"windBearing":299,"visibility":10,"cloudCover":0.03,"pressure":1007.37,"ozone":314.72},{"time":1401678000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":66.92,"apparentTemperature":66.92,"dewPoint":35.4,"humidity":0.31,"windSpeed":6.37,"windBearing":292,"visibility":10,"cloudCover":0,"pressure":1008.55,"ozone":312.17},{"time":1401681600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":63.62,"apparentTemperature":63.62,"dewPoint":35.76,"humidity":0.35,"windSpeed":5.78,"windBearing":283,"visibility":10,"cloudCover":0,"pressure":1009.91,"ozone":310.15},{"time":1401685200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":60.62,"apparentTemperature":60.62,"dewPoint":36.04,"humidity":0.4,"windSpeed":5.61,"windBearing":272,"visibility":10,"cloudCover":0,"pressure":1011.38,"ozone":308.56},{"time":1401688800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":58.06,"apparentTemperature":58.06,"dewPoint":36.22,"humidity":0.44,"windSpeed":5.55,"windBearing":266,"visibility":10,"cloudCover":0,"pressure":1012.61,"ozone":307.3},{"time":1401692400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":56.05,"apparentTemperature":56.05,"dewPoint":36.61,"humidity":0.48,"windSpeed":5.43,"windBearing":267,"visibility":10,"cloudCover":0,"pressure":1013.53,"ozone":306.41},{"time":1401696000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":54.5,"apparentTemperature":54.5,"dewPoint":37.13,"humidity":0.52,"windSpeed":5.39,"windBearing":272,"visibility":10,"cloudCover":0,"pressure":1014.23,"ozone":305.84},{"time":1401699600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":53.09,"apparentTemperature":53.09,"dewPoint":37.27,"humidity":0.55,"windSpeed":5.55,"windBearing":272,"visibility":10,"cloudCover":0,"pressure":1014.7,"ozone":305.39},{"time":1401703200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":51.48,"apparentTemperature":51.48,"dewPoint":36.72,"humidity":0.57,"windSpeed":5.57,"windBearing":263,"visibility":10,"cloudCover":0,"pressure":1015,"ozone":305.03},{"time":1401706800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":50.3,"apparentTemperature":50.3,"dewPoint":36.07,"humidity":0.58,"windSpeed":5.56,"windBearing":249,"visibility":10,"cloudCover":0,"pressure":1015.12,"ozone":304.78},{"time":1401710400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":50.82,"apparentTemperature":50.82,"dewPoint":36.26,"humidity":0.57,"windSpeed":5.23,"windBearing":236,"visibility":10,"cloudCover":0,"pressure":1015.04,"ozone":304.51},{"time":1401714000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":54.08,"apparentTemperature":54.08,"dewPoint":37.83,"humidity":0.54,"windSpeed":3.84,"windBearing":217,"visibility":10,"cloudCover":0,"pressure":1014.73,"ozone":304.1},{"time":1401717600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":59.19,"apparentTemperature":59.19,"dewPoint":40.06,"humidity":0.49,"windSpeed":2.88,"windBearing":170,"visibility":10,"cloudCover":0,"pressure":1014.2,"ozone":303.66},{"time":1401721200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":64.05,"apparentTemperature":64.05,"dewPoint":41.69,"humidity":0.44,"windSpeed":3.86,"windBearing":133,"visibility":10,"cloudCover":0,"pressure":1013.56,"ozone":303.43},{"time":1401724800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":68.13,"apparentTemperature":68.13,"dewPoint":42.62,"humidity":0.4,"windSpeed":4.83,"windBearing":126,"visibility":10,"cloudCover":0,"pressure":1012.81,"ozone":303.68},{"time":1401728400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":71.83,"apparentTemperature":71.83,"dewPoint":43.07,"humidity":0.36,"windSpeed":5.49,"windBearing":123,"visibility":10,"cloudCover":0,"pressure":1011.97,"ozone":304.13},{"time":1401732000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":74.84,"apparentTemperature":74.84,"dewPoint":42.89,"humidity":0.32,"windSpeed":5.91,"windBearing":118,"visibility":10,"cloudCover":0.01,"pressure":1011.07,"ozone":304.25},{"time":1401735600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":77.16,"apparentTemperature":77.16,"dewPoint":41.93,"humidity":0.28,"windSpeed":5.72,"windBearing":105,"visibility":10,"cloudCover":0.11,"pressure":1010.19,"ozone":303.88}]},"daily":{"summary":"Drizzle today through Friday, with temperatures rising to 84°F on Wednesday.","icon":"rain","data":[{"time":1401516000,"summary":"Light rain starting in the afternoon, continuing until evening.","icon":"rain","sunriseTime":1401536153,"sunsetTime":1401589343,"moonPhase":0.1,"precipIntensity":0.0022,"precipIntensityMax":0.0134,"precipIntensityMaxTime":1401570000,"precipProbability":0.97,"precipType":"rain","temperatureMin":51.59,"temperatureMinTime":1401537600,"temperatureMax":77.68,"temperatureMaxTime":1401577200,"apparentTemperatureMin":51.59,"apparentTemperatureMinTime":1401537600,"apparentTemperatureMax":77.68,"apparentTemperatureMaxTime":1401577200,"dewPoint":50.82,"humidity":0.64,"windSpeed":1.39,"windBearing":165,"visibility":5.72,"cloudCover":0.3,"pressure":1012.6,"ozone":309.88},{"time":1401602400,"summary":"Partly cloudy in the morning.","icon":"partly-cloudy-day","sunriseTime":1401622528,"sunsetTime":1401675787,"moonPhase":0.13,"precipIntensity":0.0007,"precipIntensityMax":0.0031,"precipIntensityMaxTime":1401613200,"precipProbability":0.09,"precipType":"rain","temperatureMin":56.55,"temperatureMinTime":1401620400,"temperatureMax":80.08,"temperatureMaxTime":1401649200,"apparentTemperatureMin":56.55,"apparentTemperatureMinTime":1401620400,"apparentTemperatureMax":78.71,"apparentTemperatureMaxTime":1401649200,"dewPoint":40.24,"humidity":0.39,"windSpeed":6.17,"windBearing":265,"visibility":10,"cloudCover":0.21,"pressure":1007.63,"ozone":318.16},{"time":1401688800,"summary":"Partly cloudy starting in the afternoon.","icon":"partly-cloudy-night","sunriseTime":1401708904,"sunsetTime":1401762229,"moonPhase":0.16,"precipIntensity":0,"precipIntensityMax":0,"precipProbability":0,"temperatureMin":50.3,"temperatureMinTime":1401706800,"temperatureMax":80.32,"temperatureMaxTime":1401746400,"apparentTemperatureMin":50.3,"apparentTemperatureMinTime":1401706800,"apparentTemperatureMax":78.92,"apparentTemperatureMaxTime":1401746400,"dewPoint":40.27,"humidity":0.41,"windSpeed":0.58,"windBearing":93,"visibility":10,"cloudCover":0.21,"pressure":1011.56,"ozone":301.52},{"time":1401775200,"summary":"Partly cloudy in the morning.","icon":"partly-cloudy-day","sunriseTime":1401795282,"sunsetTime":1401848670,"moonPhase":0.19,"precipIntensity":0.0003,"precipIntensityMax":0.0009,"precipIntensityMaxTime":1401829200,"precipProbability":0.02,"precipType":"rain","temperatureMin":56.19,"temperatureMinTime":1401796800,"temperatureMax":80.59,"temperatureMaxTime":1401832800,"apparentTemperatureMin":56.19,"apparentTemperatureMinTime":1401796800,"apparentTemperatureMax":79.34,"apparentTemperatureMaxTime":1401832800,"dewPoint":41.82,"humidity":0.4,"windSpeed":3.24,"windBearing":267,"visibility":10,"cloudCover":0.22,"pressure":1006.91,"ozone":312.72},{"time":1401861600,"summary":"Mostly cloudy starting in the evening.","icon":"partly-cloudy-night","sunriseTime":1401881663,"sunsetTime":1401935109,"moonPhase":0.22,"precipIntensity":0.0004,"precipIntensityMax":0.0011,"precipIntensityMaxTime":1401926400,"precipProbability":0.05,"precipType":"rain","temperatureMin":53.76,"temperatureMinTime":1401879600,"temperatureMax":83.94,"temperatureMaxTime":1401919200,"apparentTemperatureMin":53.76,"apparentTemperatureMinTime":1401879600,"apparentTemperatureMax":81.08,"apparentTemperatureMaxTime":1401919200,"dewPoint":34.32,"humidity":0.3,"windSpeed":1.47,"windBearing":228,"cloudCover":0.2,"pressure":1006.46,"ozone":320.36},{"time":1401948000,"summary":"Drizzle in the evening.","icon":"rain","sunriseTime":1401968044,"sunsetTime":1402021548,"moonPhase":0.25,"precipIntensity":0.002,"precipIntensityMax":0.0065,"precipIntensityMaxTime":1402012800,"precipProbability":0.5,"precipType":"rain","temperatureMin":52.79,"temperatureMinTime":1401966000,"temperatureMax":77.7,"temperatureMaxTime":1401998400,"apparentTemperatureMin":52.79,"apparentTemperatureMinTime":1401966000,"apparentTemperatureMax":77.7,"apparentTemperatureMaxTime":1401998400,"dewPoint":43.83,"humidity":0.47,"windSpeed":0.25,"windBearing":49,"cloudCover":0.07,"pressure":1007.76,"ozone":328.11},{"time":1402034400,"summary":"Drizzle starting in the evening.","icon":"rain","sunriseTime":1402054428,"sunsetTime":1402107985,"moonPhase":0.28,"precipIntensity":0.0024,"precipIntensityMax":0.0072,"precipIntensityMaxTime":1402110000,"precipProbability":0.58,"precipType":"rain","temperatureMin":54.12,"temperatureMinTime":1402052400,"temperatureMax":80.04,"temperatureMaxTime":1402088400,"apparentTemperatureMin":54.12,"apparentTemperatureMinTime":1402052400,"apparentTemperatureMax":79.1,"apparentTemperatureMaxTime":1402088400,"dewPoint":46.04,"humidity":0.49,"windSpeed":4,"windBearing":170,"cloudCover":0.17,"pressure":1009,"ozone":318.62},{"time":1402120800,"summary":"Partly cloudy starting in the afternoon, continuing until evening.","icon":"partly-cloudy-day","sunriseTime":1402140814,"sunsetTime":1402194420,"moonPhase":0.31,"precipIntensity":0.0008,"precipIntensityMax":0.0035,"precipIntensityMaxTime":1402120800,"precipProbability":0.26,"precipType":"rain","temperatureMin":53.35,"temperatureMinTime":1402138800,"temperatureMax":82.17,"temperatureMaxTime":1402174800,"apparentTemperatureMin":53.35,"apparentTemperatureMinTime":1402138800,"apparentTemperatureMax":79.92,"apparentTemperatureMaxTime":1402174800,"dewPoint":41.73,"humidity":0.42,"windSpeed":2.97,"windBearing":180,"cloudCover":0.28,"pressure":1008.04,"ozone":326.26}]},"flags":{"sources":["nwspa","isd","nearest-precip","fnmoc","rtma","cmc","gfs","sref","rap","nam","madis","lamp","darksky"],"isd-stations":["724690-23062","724695-23036","999999-23012","999999-23062","999999-93002"],"madis-stations":["AU271","AU280","AU839","C1575","C3821","C7015","C9516","CAMPD","CO003","CO006","D3661","DHPC2","DMNC2","E1637","E3771","E4747"],"lamp-stations":["KAPA","KBJC","KBKF","KDEN"],"darksky-stations":["KFTG","KCYS"],"units":"us"}}; 
    $.each(data.daily.data,function(){
      if(this.precipType && this.precipType=='rain'){

        // scoreForecast(this.precipIntensity
        //       ,this.precipProbability
        //       ,DateDiff(new Date(this.time), new Date())
        // );

      }
    });
  }

  function scoreForecast(precipIntensity,precipProbability,fireHistory,time){
    
    // precipIntensity*precipProbability*fireHistory

    //happening in the next hour
    //happening in the next day
    if(time<3600000){
      $scope.score = 1;      
    }
    else if(time<86400000){
      $scope.score = 2;      
    }
    else {
      $scope.score = 4;            
    }
  }

  function updateMap(){
    var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point($scope.location[0], $scope.location[1]));
        if (!graphic) {
          var symbol = new esri.symbol.PictureMarkerSymbol('images/bluedot.png', 40, 40);
          graphic = new esri.Graphic(pt, symbol);
          $scope.map.graphics.add(graphic);
        }
        else { //move the graphic if it already exists
          graphic.setGeometry(pt);
        }
        $scope.map.centerAt(pt);
  }

  function locateUser(){
    $.geolocation(function (lat, lng, alt, altAcc) {
      
      //Get Forecast from Forecast.io
      $scope.location = [lng,lat];
      $scope.altitude = alt;

      updateMap();

      // getForecast();  
      figureForecast();
    });
  }

  locateUser();

});