// jquery.geolocation.js
;
(function ($, window, document, undefined) {
    $.geolocation = function (success_func, fail_func) {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getPosition, errors);
        } else {
            // browser doesn't supports geolocation
            // so exit now.
            FAIL("NOT_SUPPORTED");
            return;
        }

        function getPosition(position) {

            var user_lat = position.coords.latitude;
            var user_long = position.coords.longitude;            
            var alt = position.coords.altitude;
            var altAcc = position.coords.altitudeAccuracy;

            SUCCESS(user_lat, user_long, alt, altAcc);
            return;
        }

        function errors(error_code) {
            switch (error.code) {
            case error.PERMISSION_DENIED:
                FAIL("PERMISSION_DENIED");
                break;

            case error.POSITION_UNAVAILABLE:
                FAIL("POSITION_UNAVAILABLE");
                break;

            case error.TIMEOUT:
                FAIL("TIMEOUT");
                break;

            case error.UNKNOWN_ERROR:
                FAIL("UNKNOWN_ERROR");
                break;
            }
            return;
        }

        function SUCCESS(user_lat, user_long, alt, altAcc) {
            if (typeof (success_func) != "undefined") {
                success_func(user_lat, user_long, alt, altAcc);
            } else {
                alert("Latitude = " + user_lat + " and Longitude = " + user_long);
            }
        }

        function FAIL(error) {
            if (typeof (fail_func) != "undefined") {
                fail_func(error);
            } else {
                alert(error);
            }
        }

    }
})(jQuery, window, document);