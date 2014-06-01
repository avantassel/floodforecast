angular.module('floodforecast', ['ngCookies']).

controller('AppCtrl', function($scope,$http,$q,$sce,$cookies,$timeout,$filter) {

  var usergraphic;

  $scope.map;
  //Boulder
  $scope.location = [-104.9847, 39.7392];
  $scope.badHouses = [];

  $scope.when = [];
  $scope.hourlyforecast = {};
  $scope.altitude;
  $scope.address='';
  $scope.phone='';
  $scope.address='';
  $scope.user_id='';
  $scope.email='';  
  $scope.signup = "Sign Up";
  $scope.score = 3;
  $scope.hourlyforecastsummary;
  $scope.prev_address='';

  require(["esri/geometry/webMercatorUtils", "esri/geometry/Polygon", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "dojo/_base/array", "dojo/string", "esri/tasks/QueryTask", "esri/tasks/query", "esri/map", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/FeatureLayer", "dojo/domReady!"], 
   
   function(webMercatorUtils, Polygon, Graphic, SimpleMarkerSymbol, PictureMarkerSymbol, array, dojoString, QueryTask, Query, Map, ArcGISDynamicMapServiceLayer, FeatureLayer) { 
   
    $scope.map = new Map("map", {
      center: $scope.location,
      zoom: 13,
      basemap: "streets"
    });


    // urlUtils.addProxyRule({
    //   urlPrefix: "route.arcgis.com",  
    //   proxyUrl: "http://floodforecast/PHP/proxy.php"
    // });


    $scope.flood = new FeatureLayer("http://services2.arcgis.com/XrTRbkeSS1aM6EfD/ArcGIS/rest/services/Dissolve%20Boulder%20floodplain/FeatureServer/0");
    $scope.centres = new FeatureLayer("http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/Evacuation_Centers/FeatureServer/0/", {
      mode: FeatureLayer.MODE_SNAPSHOT
    });
    $scope.houses = new FeatureLayer("http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/new_floody_houses/FeatureServer/0/",
      {
        outFields: ["*"]
      });
    $scope.houses.setSelectionSymbol(new SimpleMarkerSymbol({
      "color": [255,128,128,128],
      "size": 12,
      "style": "esriSMSCircle"
    }));

    $scope.map.addLayers([$scope.flood,$scope.houses,$scope.centres]);

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

              // Loop through results and send text message
              array.forEach(results, function(entry, i){

                // find closest DAC
                findDAC(entry);

                // off for now
                // sendAlert();
              });
          });
      });
    });



  
    function findDAC(userLocation) {
      // $scope.centres
      // userLocation

      // var params = new esri.tasks.ClosestFacilityParameters();
      // params.defaultCutoff = 3.0;
      // params.returnIncidents = false;
      // params.returnRoutes = false;
      // params.returnDirections = false;
      // // $scope.facilities.features[0].attributes = null;
      // array.forEach($scope.facilities.features, function(entry, i) {
      //   entry.attributes = null
      // });
      
      // params.facilities = $scope.facilities; // needs to be a DataFile
      

      // // $scope.incidents = new esri.tasks.FeatureSet();
      // // $scope.incidents.features = userLocation;
      // // $scope.incidents.features = [$scope.incidents.features];
      // // $scope.incidents.features[0].attributes = null;
      // // $scope.incidents.geometry = $scope.incidents;
      // // params.incidents = $scope.incidents;

      // var features = [];
      // userLocation.attributes = null;
      // features.push(userLocation);
      // var incidents = new FeatureSet();
      // incidents.features = features;
      // params.incidents = incidents;

      
      // This is broken. Need auth token and params.incidents isn't a valid location
      // closestFacilityTask = new esri.tasks.ClosestFacilityTask("http://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World");

      // closestFacilityTask.solve(params, function(solveResult){
      //   console.log(solveResult);
      // });
      $scope.dac = "450 Power St, Erie CO 80516"
    }

    function getNoaa(){
    
      $http.get('getNOAA.php').then(function(response){

        $scope.noaaAlerts=response.data;

        $.each(response.data,function(){

          if(this.points && this.points.length!=0){
            var points = [];

            $.each(this.points,function(){
              points.push([parseFloat(this[1]), parseFloat(this[0])]);
            });
            
           var alertPoly = {"geometry":{"rings":[ points ],"spatialReference":{"wkid":4326}},"symbol":{"color":[0,0,0,64],"outline":{"color":[0,0,0,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"},"type":"esriSFS","style":"esriSFSSolid"}};
           var gra = new Graphic(alertPoly);
           $scope.map.graphics.add(gra);

          }
        });       
                  
      });        
  }
  
  getNoaa();

  }); //end of esri

  function sendAlert() {

    $.ajax({
      type: "GET",
      url: 'sendAlert.php',
      data: { 'phone': $scope.phone, 'dac': $scope.dac },
      success: function(){
       console.log('sentAlert','Alert sent to '+$scope.phone) 
      }
    });
  }

  function sendEmail() {

    $.ajax({
      type: "GET",
      url: 'sendEmail.php',
      data: { 'to': $scope.email },
      success: function(){
       console.log('sendEmail','Email sent to '+$scope.email) 
      }
    });
  }

  $scope.getAlertClass = function(){
     switch($scope.score){
      case 1:
        return 'alert-danger';
      case 2:
        return 'alert-warning';
      case 3:
        return 'alert-info';
      case 4:
        return 'alert-success';      
    }    
  };

  $scope.saveUser = function(){ 

        if(!angular.equals($scope.prev_address,$scope.address)){
          geoCodeAddress().then(function(){
            $scope.updateUser();            
          });
        } else {
          $scope.updateUser();            
        }
  };   

  $scope.updateUser = function(){ 
      
      $scope.signup = "Saving...";

      var args = {"geometry":{"x":$scope.location[1],"y":$scope.location[0]},"attributes":{"phone":$scope.phone,"email":$scope.email,"address":$scope.address}};
      var save_url = 'save.php';

      //update the user record if we have their ID
      if($scope.user_id && $scope.user_id != ''){
        save_url='update.php';
        args.attributes.FID = $scope.user_id;        
      }

      $http.post(save_url, args).then(function(response){     
        if(response.data){
          
          if(!$scope.user_id || $scope.user_id == '')
            $scope.user_id = response.data.addResults[0].objectId;

          $cookies.lng = $scope.location[0];
          $cookies.lat = $scope.location[1];
          $cookies.phone = $scope.phone;     
          $cookies.email = $scope.email;     
          $cookies.address = $scope.address;  
          $cookies.user_id = $scope.user_id;   

          if(!$scope.address || $scope.address==''){
            $('.in-phone').hide();
            $('.in-address').show().focus();
            $('.in-email').hide();            
          }
          else if(!$scope.email || $scope.email==''){
            $('.in-phone').hide();
            $('.in-address').hide();
            $('.in-email').show().focus();            
          }

          if($scope.phone && !$cookies.alert_sent){
            sendAlert();
            $cookies.alert_sent = true;
          }

          if($scope.email && !$cookies.email_sent){
            sendEmail();
            $cookies.email_sent = true;
          }

          $scope.signup = "Save";
        }
      },function(){
        //failed posting
        $scope.signup = "Sign Up";
      });
    
  };

  $scope.getWeatherIcon = function(){

  }
  function geoCodeAddress(){
    
    var deferred = $q.defer();

    $http.jsonp('http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?f=pjson&text='+$scope.address+'&callback=JSON_CALLBACK',{timeout: 10000}).then(function(response){

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
      
      var skycons = new Skycons();          
      skycons.add('logo', 'rain');
      skycons.add('logo2', 'rain');  
      skycons.play();

      $http.jsonp('https://api.forecast.io/forecast/e9c963d9b9cecdf941a11d1c2c46f4e5/'+$scope.location[1]+','+$scope.location[0]+'?callback=JSON_CALLBACK',{timeout: 10000}).then(function(response){

            if(response.data){
              
              figureForecast( response.data ); 

              if(response.data.hourly)
                $scope.hourlyforecast = response.data.hourly.data;

              if(response.data.hourly.summary)
                $scope.hourlyforecastsummary = response.data.hourly.summary;

              
              skycons.add('currentweathericon', response.data.currently.icon);  
              skycons.play();

              $timeout(function(){
                       
                $.each($scope.hourlyforecast,function(){                
                if(this.icon)
                  skycons.add('w'+this.time, this.icon);
                });
                skycons.play();
              },1500);
            }
      });        
  }

  $scope.getTime = function(time){
      //time is epoch in seconds
      //need milliseconds so * 1000
      return $filter('date')(time*1000, 'h:mm a');
  };

  function DateDiff(date1, date2) {
    return date1.getTime() - date2.getTime();
  }

  function figureForecast(data){

    if(!data)
      return;

    $.each(data.daily.data,function(){

      if(this.precipType && this.precipType=='rain'){

        scoreForecast(this.precipIntensity
              ,this.precipProbability
              ,DateDiff(new Date(this.time), new Date())
        );        
      }
    });    
  }

  function scoreForecast(precipIntensity,precipProbability,fireHistory,time){
    
    // precipIntensity*precipProbability*fireHistory

    if(time<3600000){ //happening in the next hour
      $scope.score = 1;      
    }
    else if(time<86400000){ //happening in the next day
      $scope.score = 2;      
    }
    else if(!$scope.phone || $scope.phone==''){
      $scope.score = 3;            
    }
    else {
      $scope.score = 4;            
    }
  }

  function updateMap(){

    var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point($scope.location[0], $scope.location[1]));
        if (!usergraphic) {
          var symbol = new esri.symbol.PictureMarkerSymbol('images/bluedot.png', 40, 40);
          usergraphic = new esri.Graphic(pt, symbol);
          $scope.map.graphics.add(usergraphic);
        }
        else { //move the graphic if it already exists
          usergraphic.setGeometry(pt);
        }
        $scope.map.centerAt(pt);
  }

  function locateUser(){
    $.geolocation(function (lat, lng, alt, altAcc) {
      
      //Get Forecast from Forecast.io
      $scope.location = [lng,lat];
      $scope.altitude = alt;

      updateMap();

      getForecast();  
    });
  }

  if($cookies.phone)
    $scope.phone = $cookies.phone;     

  if($cookies.email)
    $scope.email = $cookies.email;     

  if($cookies.address){
    $scope.address = $cookies.address;   
    $scope.prev_address = $cookies.address;   
    geoCodeAddress();
  }

  if($cookies.user_id)
    $scope.user_id = $cookies.user_id;    

  if($scope.phone)
    $scope.signup='Save';

  if(!$scope.address || $scope.address==''){
      $('.in-phone').hide();
      $('.in-address').show().focus();
      $('.in-email').hide();            
    }
  if(!$scope.email || $scope.email==''){
      $('.in-phone').hide();
      $('.in-address').hide();
      $('.in-email').show().focus();            
    }
  if(!$scope.phone || $scope.phone==''){
    $('.in-phone').show().focus();
    $('.in-address').hide();
    $('.in-email').hide();            
  }

  if($scope.phone && $scope.email && $scope.address){
    $('#frmUser').hide();
  }

  if(!$cookies.address || $cookies.address == ''){
    locateUser();    
  } else {
    getForecast();
  }

});
