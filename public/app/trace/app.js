var map, opts, trace_points;

angular.module('myApp.trace', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/trace', {
            templateUrl: 'app/trace/partial.html',
            controller: 'TraceCtrl'
        });
    }])

    .controller('TraceCtrl', ["$scope", function ($scope) {
        init($scope);

        $scope.get_trace = function(){
            map.clearOverlays();
            $('#info').show();
            $('#btn').hide();
            var uid = $scope.userid;
            var beg = get_timestamp('from');//$('#from').val();
            var end = get_timestamp('to');//$('#to').val();
            //alert(JSON.stringify({user_id:uid,begin:beg,end:end}));
            //AV.Cloud.run('get_trace',{user_id:'55a45b7fe4b04ac4cd851b06',begin:'0',end:'1437146994390'})
            AV.Cloud.run('get_trace',{user_id:uid,begin:beg,end:end})
                .then(function (data) {
                    //alert(data);
                    getData(JSON.parse(data));
                });
        };

        var polyline;

        $scope.mark_trace = function(){
            if(!trace_points){
                alert('Get trace first!');
                return;
            }
            map.removeOverlay(polyline);
            var beg = get_timestamp('mark_from');
            var end = get_timestamp('mark_to');
            var mark_points = [];
            //var tlist = [];
            for(var i in trace_points){
                if(trace_points[i].timestamp >= beg && trace_points[i].timestamp <= end) {
                    mark_points.push(new BMap.Point(trace_points[i]["gps"]["lon"], trace_points[i]["gps"]["lat"]));
                    //tlist.push(trace_points[i].timestamp);
                }
            }
            //alert(JSON.stringify({begin:beg,end:end,list:tlist}));
            polyline = new BMap.Polyline(mark_points, {strokeColor:"red", strokeWeight:4, strokeOpacity:0.5});
            map.addOverlay(polyline);
        }

    }]);


function init(scope){
    $('#info').hide();
    opts = {
        title : "INFORMATION" ,
        enableMessage:true
    };

    map = new BMap.Map("allmap");
    map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.MapTypeControl());
    map.enableScrollWheelZoom();

    AV.Cloud.run('get_user_list').then(function (data) {
        var users = JSON.parse(data);
        scope.user_list = users;
    });

    datepicker('from');
    datepicker('to');
    datepicker('mark_from');
    datepicker('mark_to');

}

function datepicker(id){

    //alert(id)

    $('#'+id).datetimepicker({
        timeFormat: "HH:mm:ss",
        dateFormat: "yy-mm-dd"
    });

}

function get_timestamp(id){
    var time = $('#'+id).val();
    var f = time.split(' ', 2);
    var d = (f[0] ? f[0] : '').split('-', 3);
    var t = (f[1] ? f[1] : '').split(':', 3);
    var timestamp = new Date(
        parseInt(d[0], 10) || null,
        (parseInt(d[1], 10) || 1) - 1,
        parseInt(d[2], 10) || null,
        parseInt(t[0], 10) || null,
        parseInt(t[1], 10) || null,
        parseInt(t[2], 10) || null
    ).getTime();
    return timestamp;
}

function toDatetime(timestamp) {
    var time = new Date(timestamp);
    var ymdhis = "";
    ymdhis += time.getFullYear() + "-";
    ymdhis += (time.getMonth()+1) + "-";
    ymdhis += time.getDate();

    ymdhis += " " + time.getHours() + ":";
    ymdhis += time.getMinutes() + ":";
    ymdhis += time.getSeconds();

    return ymdhis;
}

function addClickHandler(content, marker){
    marker.addEventListener("click",function(e){

            var contentStr = '<br>Time: '+content.time+'<br>POI: '+content.poi;

            var p = e.target.getPosition();
            var point = new BMap.Point(p.lng, p.lat);
            var infoWindow = new BMap.InfoWindow(contentStr, opts);
            map.openInfoWindow(infoWindow, point);
        }
    );
}

var drawMap = function (converted_points, contents){
    // Create the polyline.
    for (var i = 0; i < converted_points.length; i ++){
        var marker = new BMap.Marker(converted_points[i]);
        map.addOverlay(marker);
        addClickHandler(contents[i],marker);
    }
    // Create the polyline.
    var polyline = new BMap.Polyline(converted_points, {strokeColor:"blue", strokeWeight:4, strokeOpacity:0.5});
    map.addOverlay(polyline);
};
var getData = function (result){
    //var result = {"result": [{"type1": {"life_service": 0.0025712516327714187, "infrastructure": 0.114683473058526, "shopping": 0.003478752209043685, "office": 0.00015125009604537756, "estate": 0.6375678501936872, "entertainment": 0.0016637510564991528, "unknown": 0.018352224349400075, "hotel": 0.2153301934661676, "auto_related": 0.0010587506723176428, "dining": 0.0018150011525445303, "healthcare": 0.0006050003841815102, "exhibition": 0.0009075005762722653, "scenic_spot": 0, "home": 0.00015125009604537756, "education": 0.0010587506723176428, "finance": 0.0006050003841815102}, "gps": {"lat": 39.980342, "lon": 116.309296}, "locationId": "55a1227be4b0822c499f6d31", "timestamp": 1436623306432, "type2": {"economy_hotel": 0.00015125009604537756, "outdoor": 0.00015125009604537756, "bath_sauna": 0.00015125009604537756, "technical_school": 0.00015125009604537756, "bike_store": 0.00015125009604537756, "pet_service": 0.00015125009604537756, "clinic": 0.00015125009604537756, "motorcycle": 0.00015125009604537756, "guest_house": 0.00015125009604537756, "ticket_agent": 0.00015125009604537756, "chinese_restaurant": 0.00015125009604537756, "flea_market": 0.00015125009604537756, "resort": 0.00015125009604537756, "pet_market": 0.00015125009604537756, "digital_store": 0.00015125009604537756, "coffee": 0.00015125009604537756, "dessert": 0.00015125009604537756, "cosmetics_store": 0.00015125009604537756, "traffic": 0.11422972277038987, "bank": 0.00015125009604537756, "adult_education": 0.00015125009604537756, "bar": 0.00015125009604537756, "talent_market": 0.00015125009604537756, "university": 0.00015125009604537756, "cooler": 0.00015125009604537756, "convenience_store": 0.00015125009604537756, "snack_bar": 0.00015125009604537756, "exhibition_hall": 0.00015125009604537756, "post_office": 0.00015125009604537756, "hostel": 0.00015125009604537756, "motel": 0.10817790320113124, "welfare_house": 0.00015125009604537756, "farmers_market": 0.00015125009604537756, "vegetarian_diet": 0.00015125009604537756, "high_school": 0.00015125009604537756, "sports_store": 0.00015125009604537756, "gas_station": 0.00015125009604537756, "training_institutions": 0.00015125009604537756, "muslim": 0.00015125009604537756, "supermarket": 0.00015125009604537756, "insurance_company": 0.00015125009604537756, "antique_store": 0.00015125009604537756, "video_store": 0.00015125009604537756, "commodity_market": 0.00015125009604537756, "chafing_dish": 0.00015125009604537756, "housekeeping": 0.00015125009604537756, "residence": 0.15471991364959153, "convention_center": 0.00015125009604537756, "atm": 0.00015125009604537756, "lottery_station": 0.00015125009604537756, "business_building": 0.4828479365440957, "internet_bar": 0.00015125009604537756, "mother_store": 0.00015125009604537756, "hospital": 0.00015125009604537756, "night_club": 0.00015125009604537756, "auto_sale": 0.00015125009604537756, "japan_korea_restaurant": 0.00015125009604537756, "other_infrastructure": 0.00015125009604537756, "car_maintenance": 0.00015125009604537756, "odeum": 0.00015125009604537756, "museum": 0.00015125009604537756, "primary_school": 0.00015125009604537756, "photographic_studio": 0.00015125009604537756, "drugstore": 0.00015125009604537756, "glass_store": 0.00015125009604537756, "bbq": 0.00015125009604537756, "auto_repair": 0.00015125009604537756, "toll_station": 0.00015125009604537756, "hotel": 0.10669853997690024, "newstand": 0.00015125009604537756, "stationer": 0.00015125009604537756, "public_utilities": 0.00015125009604537756, "library": 0.00015125009604537756, "security_company": 0.00015125009604537756, "comprehensive_market": 0.00015125009604537756, "salvage_station": 0.00015125009604537756, "ktv": 0.00015125009604537756, "barbershop": 0.00015125009604537756, "clothing_store": 0.00015125009604537756, "water_supply_office": 0.00015125009604537756, "telecom_offices": 0.00015125009604537756, "furniture_store": 0.00015125009604537756, "gift_store": 0.00015125009604537756, "cinema": 0.00015125009604537756, "car_wash": 0.00015125009604537756, "travel_agency": 0.00015125009604537756, "photography_store": 0.00015125009604537756, "electricity_office": 0.00015125009604537756, "pawnshop": 0.00015125009604537756, "game_room": 0.00015125009604537756, "kinder_garten": 0.00015125009604537756, "emergency_center": 0.00015125009604537756, "intermediary": 0.00015125009604537756, "jewelry_store": 0.00015125009604537756, "parking_plot": 0.00015125009604537756, "laundry": 0.00015125009604537756, "buffet": 0.00015125009604537756, "gallery": 0.00015125009604537756, "western_restaurant": 0.00015125009604537756, "science_museum": 0.00015125009604537756, "seafood": 0.00015125009604537756, "cigarette_store": 0.00015125009604537756}}, {"type1": {"life_service": 0.0015980397773768908, "infrastructure": 0.019740779314767976, "shopping": 0.0021620538164510874, "office": 9.400233984569943e-05, "estate": 0.40531313532584334, "entertainment": 0.001034025738302694, "unknown": 0.010898868988776667, "hotel": 0.5553049987649626, "auto_related": 0.0006580163789198961, "dining": 0.0011280280781483935, "healthcare": 0.00037600935938279773, "exhibition": 0.0005640140390741966, "scenic_spot": 0, "home": 9.400233984569943e-05, "education": 0.0006580163789198961, "finance": 0.00037600935938279773}, "gps": {"lat": 39.979964, "lon": 116.308834}, "locationId": "55a124d4e4b0822c499f998e", "timestamp": 1436623535468, "type2": {"economy_hotel": 9.400233984569943e-05, "outdoor": 9.400233984569943e-05, "bath_sauna": 9.400233984569943e-05, "technical_school": 9.400233984569943e-05, "bike_store": 9.400233984569943e-05, "pet_service": 9.400233984569943e-05, "clinic": 9.400233984569943e-05, "motorcycle": 9.400233984569943e-05, "guest_house": 9.400233984569943e-05, "ticket_agent": 9.400233984569943e-05, "chinese_restaurant": 9.400233984569943e-05, "flea_market": 9.400233984569943e-05, "resort": 9.400233984569943e-05, "pet_market": 9.400233984569943e-05, "digital_store": 9.400233984569943e-05, "coffee": 9.400233984569943e-05, "dessert": 9.400233984569943e-05, "cosmetics_store": 9.400233984569943e-05, "traffic": 0.019458772295230877, "bank": 9.400233984569943e-05, "adult_education": 9.400233984569943e-05, "bar": 9.400233984569943e-05, "talent_market": 9.400233984569943e-05, "university": 9.400233984569943e-05, "cooler": 9.400233984569943e-05, "convenience_store": 9.400233984569943e-05, "snack_bar": 9.400233984569943e-05, "exhibition_hall": 9.400233984569943e-05, "post_office": 9.400233984569943e-05, "hostel": 9.400233984569943e-05, "motel": 9.400233984569943e-05, "welfare_house": 9.400233984569943e-05, "farmers_market": 9.400233984569943e-05, "vegetarian_diet": 9.400233984569943e-05, "high_school": 9.400233984569943e-05, "sports_store": 9.400233984569943e-05, "gas_station": 9.400233984569943e-05, "training_institutions": 9.400233984569943e-05, "muslim": 9.400233984569943e-05, "supermarket": 9.400233984569943e-05, "insurance_company": 9.400233984569943e-05, "antique_store": 9.400233984569943e-05, "video_store": 9.400233984569943e-05, "commodity_market": 9.400233984569943e-05, "chafing_dish": 9.400233984569943e-05, "housekeeping": 9.400233984569943e-05, "residence": 0.14163151434531437, "convention_center": 9.400233984569943e-05, "atm": 9.400233984569943e-05, "lottery_station": 9.400233984569943e-05, "business_building": 0.26368162098052894, "internet_bar": 9.400233984569943e-05, "mother_store": 9.400233984569943e-05, "hospital": 9.400233984569943e-05, "night_club": 9.400233984569943e-05, "auto_sale": 9.400233984569943e-05, "japan_korea_restaurant": 9.400233984569943e-05, "other_infrastructure": 9.400233984569943e-05, "car_maintenance": 9.400233984569943e-05, "odeum": 9.400233984569943e-05, "museum": 9.400233984569943e-05, "primary_school": 9.400233984569943e-05, "photographic_studio": 9.400233984569943e-05, "drugstore": 9.400233984569943e-05, "glass_store": 9.400233984569943e-05, "bbq": 9.400233984569943e-05, "auto_repair": 9.400233984569943e-05, "toll_station": 9.400233984569943e-05, "hotel": 0.5549289894055799, "newstand": 9.400233984569943e-05, "stationer": 9.400233984569943e-05, "public_utilities": 9.400233984569943e-05, "library": 9.400233984569943e-05, "security_company": 9.400233984569943e-05, "comprehensive_market": 9.400233984569943e-05, "salvage_station": 9.400233984569943e-05, "ktv": 9.400233984569943e-05, "barbershop": 9.400233984569943e-05, "clothing_store": 9.400233984569943e-05, "water_supply_office": 9.400233984569943e-05, "telecom_offices": 9.400233984569943e-05, "furniture_store": 9.400233984569943e-05, "gift_store": 9.400233984569943e-05, "cinema": 9.400233984569943e-05, "car_wash": 9.400233984569943e-05, "travel_agency": 9.400233984569943e-05, "photography_store": 9.400233984569943e-05, "electricity_office": 9.400233984569943e-05, "pawnshop": 9.400233984569943e-05, "game_room": 9.400233984569943e-05, "kinder_garten": 9.400233984569943e-05, "emergency_center": 9.400233984569943e-05, "intermediary": 9.400233984569943e-05, "jewelry_store": 9.400233984569943e-05, "parking_plot": 9.400233984569943e-05, "laundry": 9.400233984569943e-05, "buffet": 9.400233984569943e-05, "gallery": 9.400233984569943e-05, "western_restaurant": 9.400233984569943e-05, "science_museum": 9.400233984569943e-05, "seafood": 9.400233984569943e-05, "cigarette_store": 9.400233984569943e-05}}, {"type1": {"life_service": 0.0020572118064272056, "infrastructure": 0.0043749998431245815, "shopping": 0.0027832865616368063, "office": 0.00012101245920160029, "estate": 0.8306521418483735, "entertainment": 0.0013311370512176035, "unknown": 0.00012101245920160029, "hotel": 0.011783264252241491, "auto_related": 0.0008470872144112022, "dining": 0.0014521495104192039, "healthcare": 0.00048404983680640115, "exhibition": 0.0007260747552096018, "scenic_spot": 0, "home": 0.00012101245920160029, "education": 0.1426615101057221, "finance": 0.00048404983680640115}, "gps": {"lat": 39.977952, "lon": 116.325777}, "locationId": "55a127b0e4b0822c499ff9d9", "timestamp": 1436624179428, "type2": {"economy_hotel": 0.00012101245920160029, "outdoor": 0.00012101245920160029, "bath_sauna": 0.00012101245920160029, "technical_school": 0.00012101245920160029, "bike_store": 0.00012101245920160029, "pet_service": 0.00012101245920160029, "clinic": 0.00012101245920160029, "motorcycle": 0.00012101245920160029, "guest_house": 0.00012101245920160029, "ticket_agent": 0.00012101245920160029, "chinese_restaurant": 0.00012101245920160029, "flea_market": 0.00012101245920160029, "resort": 0.00012101245920160029, "pet_market": 0.00012101245920160029, "digital_store": 0.00012101245920160029, "coffee": 0.00012101245920160029, "dessert": 0.00012101245920160029, "cosmetics_store": 0.00012101245920160029, "traffic": 0.004011962465519781, "bank": 0.00012101245920160029, "adult_education": 0.00012101245920160029, "bar": 0.00012101245920160029, "talent_market": 0.00012101245920160029, "university": 0.09541105069800536, "cooler": 0.00012101245920160029, "convenience_store": 0.00012101245920160029, "snack_bar": 0.00012101245920160029, "exhibition_hall": 0.00012101245920160029, "post_office": 0.00012101245920160029, "hostel": 0.00012101245920160029, "motel": 0.01129921441543509, "welfare_house": 0.00012101245920160029, "farmers_market": 0.00012101245920160029, "vegetarian_diet": 0.00012101245920160029, "high_school": 0.04664539711170874, "sports_store": 0.00012101245920160029, "gas_station": 0.00012101245920160029, "training_institutions": 0.00012101245920160029, "muslim": 0.00012101245920160029, "supermarket": 0.00012101245920160029, "insurance_company": 0.00012101245920160029, "antique_store": 0.00012101245920160029, "video_store": 0.00012101245920160029, "commodity_market": 0.00012101245920160029, "chafing_dish": 0.00012101245920160029, "housekeeping": 0.00012101245920160029, "residence": 0.560701309334394, "convention_center": 0.00012101245920160029, "atm": 0.00012101245920160029, "lottery_station": 0.00012101245920160029, "business_building": 0.26995083251397956, "internet_bar": 0.00012101245920160029, "mother_store": 0.00012101245920160029, "hospital": 0.00012101245920160029, "night_club": 0.00012101245920160029, "auto_sale": 0.00012101245920160029, "japan_korea_restaurant": 0.00012101245920160029, "other_infrastructure": 0.00012101245920160029, "car_maintenance": 0.00012101245920160029, "odeum": 0.00012101245920160029, "museum": 0.00012101245920160029, "primary_school": 0.00012101245920160029, "photographic_studio": 0.00012101245920160029, "drugstore": 0.00012101245920160029, "glass_store": 0.00012101245920160029, "bbq": 0.00012101245920160029, "auto_repair": 0.00012101245920160029, "toll_station": 0.00012101245920160029, "hotel": 0.00012101245920160029, "newstand": 0.00012101245920160029, "stationer": 0.00012101245920160029, "public_utilities": 0.00012101245920160029, "library": 0.00012101245920160029, "security_company": 0.00012101245920160029, "comprehensive_market": 0.00012101245920160029, "salvage_station": 0.00012101245920160029, "ktv": 0.00012101245920160029, "barbershop": 0.00012101245920160029, "clothing_store": 0.00012101245920160029, "water_supply_office": 0.00012101245920160029, "telecom_offices": 0.00012101245920160029, "furniture_store": 0.00012101245920160029, "gift_store": 0.00012101245920160029, "cinema": 0.00012101245920160029, "car_wash": 0.00012101245920160029, "travel_agency": 0.00012101245920160029, "photography_store": 0.00012101245920160029, "electricity_office": 0.00012101245920160029, "pawnshop": 0.00012101245920160029, "game_room": 0.00012101245920160029, "kinder_garten": 0.00012101245920160029, "emergency_center": 0.00012101245920160029, "intermediary": 0.00012101245920160029, "jewelry_store": 0.00012101245920160029, "parking_plot": 0.00012101245920160029, "laundry": 0.00012101245920160029, "buffet": 0.00012101245920160029, "gallery": 0.00012101245920160029, "western_restaurant": 0.00012101245920160029, "science_museum": 0.00012101245920160029, "seafood": 0.00012101245920160029, "cigarette_store": 0.00012101245920160029}}, {"type1": {"life_service": 0.001174196559037378, "infrastructure": 0.0002762815433029125, "shopping": 0.02784310446657241, "office": 6.907038582572812e-05, "estate": 0.09904939274494684, "entertainment": 0.04232052888679482, "unknown": 0.01986001188316903, "hotel": 0.0003453519291286406, "auto_related": 0.0004834927007800968, "dining": 0.0008288446299087373, "healthcare": 0.0002762815433029125, "exhibition": 0.008796705886544404, "scenic_spot": 0, "home": 6.907038582572812e-05, "education": 0.7983313849115581, "finance": 0.0002762815433029125}, "gps": {"lat": 39.969411, "lon": 116.365253}, "locationId": "55a12991e4b0822c49a04c8f", "timestamp": 1436624927842, "type2": {"economy_hotel": 6.907038582572812e-05, "outdoor": 6.907038582572812e-05, "bath_sauna": 6.907038582572812e-05, "technical_school": 6.907038582572812e-05, "bike_store": 6.907038582572812e-05, "pet_service": 6.907038582572812e-05, "clinic": 6.907038582572812e-05, "motorcycle": 6.907038582572812e-05, "guest_house": 6.907038582572812e-05, "ticket_agent": 6.907038582572812e-05, "chinese_restaurant": 6.907038582572812e-05, "flea_market": 6.907038582572812e-05, "resort": 6.907038582572812e-05, "pet_market": 6.907038582572812e-05, "digital_store": 0.026323555978406413, "coffee": 0.04162982502853752, "dessert": 6.907038582572812e-05, "cosmetics_store": 6.907038582572812e-05, "traffic": 6.907038582572812e-05, "bank": 6.907038582572812e-05, "adult_education": 6.907038582572812e-05, "bar": 6.907038582572812e-05, "talent_market": 6.907038582572812e-05, "university": 0.7979169625966037, "cooler": 6.907038582572812e-05, "convenience_store": 6.907038582572812e-05, "snack_bar": 6.907038582572812e-05, "exhibition_hall": 6.907038582572812e-05, "post_office": 6.907038582572812e-05, "hostel": 6.907038582572812e-05, "motel": 6.907038582572812e-05, "welfare_house": 6.907038582572812e-05, "farmers_market": 6.907038582572812e-05, "vegetarian_diet": 6.907038582572812e-05, "high_school": 6.907038582572812e-05, "sports_store": 6.907038582572812e-05, "gas_station": 6.907038582572812e-05, "training_institutions": 6.907038582572812e-05, "muslim": 6.907038582572812e-05, "supermarket": 6.907038582572812e-05, "insurance_company": 6.907038582572812e-05, "antique_store": 6.907038582572812e-05, "video_store": 6.907038582572812e-05, "commodity_market": 6.907038582572812e-05, "chafing_dish": 6.907038582572812e-05, "housekeeping": 6.907038582572812e-05, "residence": 0.0488280800407677, "convention_center": 6.907038582572812e-05, "atm": 6.907038582572812e-05, "lottery_station": 6.907038582572812e-05, "business_building": 0.050221312704179136, "internet_bar": 6.907038582572812e-05, "mother_store": 6.907038582572812e-05, "hospital": 6.907038582572812e-05, "night_club": 6.907038582572812e-05, "auto_sale": 6.907038582572812e-05, "japan_korea_restaurant": 6.907038582572812e-05, "other_infrastructure": 6.907038582572812e-05, "car_maintenance": 6.907038582572812e-05, "odeum": 6.907038582572812e-05, "museum": 6.907038582572812e-05, "primary_school": 6.907038582572812e-05, "photographic_studio": 6.907038582572812e-05, "drugstore": 6.907038582572812e-05, "glass_store": 6.907038582572812e-05, "bbq": 6.907038582572812e-05, "auto_repair": 6.907038582572812e-05, "toll_station": 6.907038582572812e-05, "hotel": 6.907038582572812e-05, "newstand": 6.907038582572812e-05, "stationer": 6.907038582572812e-05, "public_utilities": 6.907038582572812e-05, "library": 0.008451353957415763, "security_company": 6.907038582572812e-05, "comprehensive_market": 6.907038582572812e-05, "salvage_station": 6.907038582572812e-05, "ktv": 6.907038582572812e-05, "barbershop": 6.907038582572812e-05, "clothing_store": 6.907038582572812e-05, "water_supply_office": 6.907038582572812e-05, "telecom_offices": 6.907038582572812e-05, "furniture_store": 6.907038582572812e-05, "gift_store": 6.907038582572812e-05, "cinema": 6.907038582572812e-05, "car_wash": 6.907038582572812e-05, "travel_agency": 6.907038582572812e-05, "photography_store": 6.907038582572812e-05, "electricity_office": 6.907038582572812e-05, "pawnshop": 6.907038582572812e-05, "game_room": 6.907038582572812e-05, "kinder_garten": 6.907038582572812e-05, "emergency_center": 6.907038582572812e-05, "intermediary": 6.907038582572812e-05, "jewelry_store": 6.907038582572812e-05, "parking_plot": 6.907038582572812e-05, "laundry": 6.907038582572812e-05, "buffet": 6.907038582572812e-05, "gallery": 6.907038582572812e-05, "western_restaurant": 6.907038582572812e-05, "science_museum": 6.907038582572812e-05, "seafood": 6.907038582572812e-05, "cigarette_store": 6.907038582572812e-05}}]};
    $('#info').hide();
    $('#btn').show();
    // Extract raw points
    trace_points = result["result"];
    if (trace_points.length <= 0){
        alert("The event did not catch any gps points.");
        return;
    }
    else{
        //alert("There are " + trace_points.length + "gps points on map.");
    }
    // Initiation of Baidu POI
    var points = [];
    var contents = [];
    for (var i = 0; i < trace_points.length; i++){
        points.push(new BMap.Point(trace_points[i]["gps"]["lon"], trace_points[i]["gps"]["lat"]));
        contents.push({
                    time: toDatetime(trace_points[i].timestamp),
                    id: trace_points[i].locationId,
                    poi: trace_points[i].poi
        });
    }
    map.centerAndZoom(points[0], 14);
    drawMap(points, contents);
};
