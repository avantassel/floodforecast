<!DOCTYPE html>
<html ng-app="floodforecast">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Flood Forecast</title>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no"/>
        <link rel="stylesheet" href="http://js.arcgis.com/3.9/js/esri/css/esri.css">
        <link rel="stylesheet" href="css/bootstrap.min.css"/>
        <link rel="stylesheet" href="css/main.css"/>
    </head>
    <body ng-controller="AppCtrl">
            
    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">Flood Forecast</a>
        </div>
        <div class="navbar-collapse collapse">
          <ul class="nav navbar-nav navbar-right">
            <li><a href="#">Floods</a></li>
            <li><a href="#">Fires</a></li>
            <li><a href="#">Disaster Centers</a></li>
          </ul>
          <!-- <form class="navbar-form navbar-right">
            <input type="text" class="form-control" placeholder="Search...">
          </form> -->
        </div>
      </div>
    </div>

    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-3 col-md-2 sidebar">
          <ul class="nav nav-sidebar">
            <li class="active"><a href="#">My Alerts</a></li>            
          </ul>
          <ul class="nav nav-sidebar">
            <form id="userInputForm" ng-submit="saveUser()">
            <li><input type="phone" class="form-control in-side-phone" ng-model="phone" value="<?php echo $_GET['From']; ?>"></li>
            <li><input type="email" class="form-control in-side-email" placeholder="Email" ng-model="email"></li>
            <li><input type="text" class="form-control in-side-address" ng-model="address" value="<?php echo $_GET['Body']; ?>"></li>
            <li>
              <button class="btn btn-default" type="submit" >{{signup}}</button>
            </li>
          </form>
          </ul>        
        </div>
        <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
          <h1 class="page-header">Flood Forecast</h1>

            <div id="map"></div>

        </div>
      </div>
    </div>
    <script type="text/javascript">
		var from = "<?php echo $_GET['from']; ?>";
		console.log(from);

    	setTimeout(function(){
    		if (from && from != "") {
				$("#userInputForm button").trigger("click");
    		}
    		
    	}, 5000);
    </script>
    </body>
    <script type="text/javascript" src="http://js.arcgis.com/3.9/"></script>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular.min.js"></script>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular-cookies.js"></script>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script type="text/javascript" src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/jquery.geolocation.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
</html>