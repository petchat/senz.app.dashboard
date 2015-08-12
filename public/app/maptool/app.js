var map, startMarker, endMarker, waypointMarkers, pointType;


angular.module('myApp.maptool', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/maptool', {
            templateUrl: 'app/maptool/partial.html',
            controller: 'MaptoolCtrl'
        });
    }])

    .controller('MaptoolCtrl', ["$scope", function ($scope) {
        //alert('aaaaaa');
        //init part

        startMarker = null;
        endMarker = null;
        waypointMarkers = [];
        pointType = -1;

        // generate point mode init
        $scope.isPoint = false;
        $scope.genPoints = [];


        $scope.mapResult = null;

        $scope.isPublicRoute = false;

        var seq_context;
        $scope.init_context = function () {
            $.ajax({
                url: 'http://maptools.avosapps.com/context',
                success: function (result) {
                    var context_obj = JSON.parse(result);
                    $("#select-context").empty();
                    for (var i = 0; i < context_obj.length; i++) {
                        var option_text = '<option value="' + context_obj[i] + '">' + context_obj[i] + '</option>';
                        //console.log(option_text);
                        $("#select-context").append(option_text);
                    }
                }
            })
        };
        $scope.init_feature = function () {
            $.ajax({
                url: 'http://maptools.avosapps.com/feature',
                success: function (result) {
                    var feature_obj = JSON.parse(result);
                    $("#select-time").empty();
                    for (var i = 0; i < feature_obj['time'].length; i++) {
                        var option_text = '<option value="' + feature_obj['time'][i] + '">' + feature_obj['time'][i] + '</option>';
                        //console.log(option_text);
                        $("#select-time").append(option_text);
                    }
                    $("#select-day").empty();
                    for (var i = 0; i < feature_obj.day.length; i++) {
                        var option_text = '<option value="' + feature_obj.day[i] + '">' + feature_obj.day[i] + '</option>';
                        //console.log(option_text);
                        $("#select-day").append(option_text);
                    }
                }
            })
        };
        $scope.init_context();
        $scope.init_feature();
        get_recent_traceid();
//set timestamp
        $scope.datepicker = $('#datetimepicker')
            .datetimepicker({todayButton: true, format: "Y/m/d H:i:s"});//中文化});
        $('#datetimepicker').val(new Date().dateFormat("Y/m/d H:i:s"));
        $('#datetimepicker').click(function () {
            //console.log('123123');
            //console.log($(this));
            //console.log($('#datetimepicker').val());
            var str_date = $('#datetimepicker').val();
            var dd = new Date(Date.parse(str_date));

            console.log(dd.getTime());
        });
//$('#timestamp_interval').val(1);
        $('#timestamp_interval').click(function () {
            console.log($(this).val());
        });
        function getDatepickerVal() {
            var str_date = $('#datetimepicker').val();
            var dd = new Date(Date.parse(str_date));
            return dd.getTime();
        }


// 百度地图API功能
        map = new BMap.Map("bdmap");
        map.centerAndZoom("北京", 12);
        map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
        map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
//单击获取点击的经纬度
        map.addEventListener("click", function (e) {
            var epoint = e.point;
            switch (pointType) {
                case 0:
                    setStartPoint(map, epoint);
                    break;
                case 1:
                    setEndPoint(map, epoint);
                    break;
                case 2:
                    setWayPoint(map, epoint);
                    break;
                case 3:
                    setGenPoints(map, epoint);
                    break;
                default :
                    break;
            }
        });


        $("#isPointGenerate").click(function (e) {
            $scope.isPoint = $("#isPointGenerate")[0].checked;
            console.log($scope.isPoint);
            map.clearOverlays();
            $scope.mapResult = null;
            if ($scope.isPoint) {
                pointType = 3;
            } else {
                pointType = -1;
            }
        });
// init buttons
        $("#btn_start").click(function () {
            //console.log("start = " + startMarker);
            //console.log("end = " + endMarker);
            pointType = 0;
            $scope.genPoints = [];
            $scope.isPoint = false;
            $scope.isPublicRoute = false;
            $("#isPointGenerate")[0].checked = false;
        });
        $("#btn_end").click(function () {
            //console.log("start = " + startMarker);
            //console.log("end = " + endMarker);
            pointType = 1;
            $scope.genPoints = [];
            $scope.isPoint = false;
            $scope.isPublicRoute = false;
            $("#isPointGenerate")[0].checked = false;
        });

        $("#btn_waypoint").click(function () {
            //console.log("start = " + startMarker);
            //console.log("end = " + endMarker);
            pointType = 2;
            $scope.genPoints = [];
            $scope.isPoint = false;
            $scope.isPublicRoute = false;
            $("#isPointGenerate")[0].checked = false;
        });

        $("#btn_driving_router").click(function () {
            $scope.genPoints = [];
            $scope.isPoint = false;
            $scope.isPublicRoute = false;
            $("#isPointGenerate")[0].checked = false;
            makeDrivingRoute(map);
        });

        $("#btn_walking_router").click(function () {
            $scope.genPoints = [];
            $scope.isPoint = false;
            $scope.isPublicRoute = false;
            $("#isPointGenerate")[0].checked = false;
            makeWalkingRoute(map);
        });

        $("#btn_transit_router").click(function () {
            $scope.genPoints = [];
            $scope.isPoint = false;
            $("#isPointGenerate")[0].checked = false;
            $scope.isPublicRoute = true;
            makeTransitRoute(map);
        });

        $("#btn_reset").click(function () {
            map.clearOverlays();
            startMarker = null;
            endMarker = null;
            waypointMarkers = [];
            pointType = -1;
            $scope.mapResult = null;
            $scope.genPoints = [];
            $("#isPointGenerate")[0].checked = false;
            $scope.isPoint = false;
            $scope.isPublicRoute = false;
        });

        $("#btn_getdata").click(function () {
            getRouteData($scope.mapResult);
        });

        $("#btn_gettrace").click(function () {
            click_btn_gettrace();
        });


        // operations part

// point setter
        function setStartPoint(bmap, e_point) {
            console.log("startMarker=" + startMarker);
            if (startMarker == null) {
                startMarker = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
                startMarker.setLabel(new BMap.Label("起点", {offset: new BMap.Size(20, -10)}));
                startMarker.enableDragging();
                startMarker.addEventListener("dragend", function (event) {
                    var point = event.point;
                    //console.log(point);
                    console.log("start marker的位置是" + point.lng + "," + point.lat);
                });
                bmap.addOverlay(startMarker);
            } else {
                startMarker.setPosition(new BMap.Point(e_point.lng, e_point.lat));
            }

            pointType = -1;//reset pointType
        };

        function setEndPoint(bmap, e_point) {
            if (endMarker == null) {
                endMarker = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
                endMarker.setLabel(new BMap.Label("终点", {offset: new BMap.Size(20, -10)}));
                endMarker.enableDragging();
                endMarker.addEventListener("dragend", function (event) {
                    var point = event.point;
                    console.log("end marker的位置是" + point.lng + "," + point.lat)
                });
                bmap.addOverlay(endMarker);
            } else {
                endMarker.setPosition(new BMap.Point(e_point.lng, e_point.lat));
            }
            pointType = -1;//reset pointType
        };

        function setWayPoint(bmap, e_point) {
            var waypointMark = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
            waypointMark.setLabel(new BMap.Label("途经点-" + waypointMarkers.length, {offset: new BMap.Size(20, -10)}));
            waypointMark.enableDragging();
            waypointMark.addEventListener("dragend", function (event) {
                var point = event.point;
                console.log(waypointMark.getLabel().content + "的位置是" + point.lng + "," + point.lat)
            });
            bmap.addOverlay(waypointMark);
            waypointMarkers.push(waypointMark);
            pointType = -1;//reset pointType
        };

        function setGenPoints(bmap, e_point) {
            var genPointMarker = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
            genPointMarker.setLabel(new BMap.Label("生成点-" + $scope.genPoints.length, {offset: new BMap.Size(20, -10)}));
            genPointMarker.enableDragging();
            genPointMarker.addEventListener("dragend", function (event) {
                var point = event.point;
                console.log(genPointMarker.getLabel().content + "的位置是" + point.lng + "," + point.lat)
            });
            console.log(genPointMarker.point.lng + "-" + genPointMarker.point.lat);
            $scope.genPoints.push(genPointMarker.point);
            bmap.addOverlay(genPointMarker);
            //pointType = -1;//reset pointType
        }

// Map router
        function makeDrivingRoute(renderMap) {
            //alert('fffff');
            renderMap.clearOverlays();
            var transit = new BMap.DrivingRoute(renderMap, {
                renderOptions: {
                    map: renderMap,
                    //panel: "r-result",
                    enableDragging: true //起终点可进行拖拽
                }
            });
            var wayPoints = [];
            for (var i = 0; i < waypointMarkers.length; i++) {
                wayPoints.push(waypointMarkers[i].getPosition())
            }
            transit.setSearchCompleteCallback(function () {
                $scope.mapResult = transit.getResults();
            });
            transit.search(startMarker.getPosition(), endMarker.getPosition(), {waypoints: wayPoints});
        };

        var makeWalkingRoute = function (renderMap) {
            renderMap.clearOverlays();
            var transit = new BMap.WalkingRoute(renderMap, {
                renderOptions: {
                    map: renderMap,
                    //panel: "r-result",
                    enableDragging: true //起终点可进行拖拽
                }
            });
            transit.setSearchCompleteCallback(function () {
                $scope.mapResult = transit.getResults();
            });
            transit.search(startMarker.getPosition(), endMarker.getPosition());
        };

        var makeTransitRoute = function (renderMap) {
            renderMap.clearOverlays();
            var transit = new BMap.TransitRoute(renderMap, {
                renderOptions: {
                    map: renderMap,
                    //panel: "r-result",
                    enableDragging: true //起终点可进行拖拽
                }
            });
            transit.setSearchCompleteCallback(function () {
                $scope.mapResult = transit.getResults();
                console.log('方案总数：' + transit.getResults().getNumPlans());
                console.log('公交路段数:' + transit.getResults().getPlan(0).getNumLines());
                console.log('步行路段数:' + transit.getResults().getPlan(0).getNumRoutes());
            });
            transit.search(startMarker.getPosition(), endMarker.getPosition());
        };


//data collector
//draw points
        function drawpoints(result) {
            function openInfo(content, e) {
                var p = e.target;
                var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
                var opts = {
                    width: 250,     // 信息窗口宽度
                    height: 500,     // 信息窗口高度
                    title: "数据点信息", // 信息窗口标题
                    enableMessage: true//设置允许信息窗发送短息
                };
                var infoWindow = new BMap.InfoWindow(content, opts);  // 创建信息窗口对象
                map.openInfoWindow(infoWindow, point); //开启信息窗口
            }

            function addClickHandler(content, marker) {
                marker.addEventListener("click", function (e) {
                        openInfo(content, e)
                    }
                );
            }

            new_points = result;
            //console.log("point=" + new_points);
            //console.log(new_points);
            var t_point_list = [];
            for (var i = 0; i < new_points.length; i++) {
                var t_point = new BMap.Point(new_points[i].lng, new_points[i].lat);
                t_point_list.push(t_point);
                var t_marker = new BMap.Marker(t_point);
                var poi_text = "lng=" + new_points[i].lng + "<br>lat=" + new_points[i].lat + "<br>";
                poi_text += 'Timestamp:' + new_points[i].timestamp + '<br>';
                poi_text += 'Datetime:' + new Date(parseInt(new_points[i].timestamp)) + '<br>';
                poi_text += '<br>Context:' + new_points[i].context + '<br>';
                poi_text += 'Location:' + new_points[i].location + '<br>';
                poi_text += 'Sound:' + new_points[i].sound + '<br>';
                poi_text += 'Motion:' + new_points[i].motion + '<br>';
                poi_text += 'Speed:' + new_points[i].speed + '<br>';
                poi_text += 'Time:' + new_points[i].time + '<br>';
                poi_text += 'Day:' + new_points[i].day + '<br>';
                poi_text += '<br>RealPOIs:<br>';
                for (var j = 0; j < new_points[i].poi_types.length; j++) {
                    poi_text += new_points[i].poi_types[j].title + ":" + new_points[i].poi_types[j].mapping_type + "<br>";
                }
                //console.log(poi_text);
                addClickHandler(poi_text, t_marker);
                map.addOverlay(t_marker);
            }
            var polyline = new BMap.Polyline(t_point_list, {
                strokeColor: "blue",
                strokeWeight: 3,
                strokeOpacity: 1
            });   //创建折线
            map.addOverlay(polyline);   //增加折线
            alert("ok");
            map.centerAndZoom(new BMap.Point(t_point_list[0].lng, t_point_list[0].lat), 12);
        }


        function postRouteData(routeDatas) {
            console.log('isSaved=' + $("#isSaved")[0].checked);
            $.ajax({
                    url: "http://maptools.avosapps.com/data",
                    data: JSON.stringify({
                        "isSaved": $("#isSaved")[0].checked,
                        "routeDatas": routeDatas
                    }),
                    type: "POST",
                    contentType: "application/json",
                    success: function (result) {
                        var jsonroot = JSON.parse(result);
                        drawpoints(jsonroot.result);
                        if ($("#isSaved")[0].checked) {
                            alert('trace_id=' + jsonroot.trace_id);
                            get_recent_traceid();
                        }
                    }
                }
            );
            alert("正在读取，请稍候");
        };


        function getRouteData(routeResult) {
            //map.clearOverlays();
            //isPoint = $("#isPointGenerate")[0].checked;
            console.log($scope.isPoint);
            pointType = -1;
            var start_timestamp = getDatepickerVal();
            var timestamp_interval = parseInt($('#timestamp_interval').val()) * 1000;
            console.log('start:\t' + start_timestamp);
            console.log('interval:\t' + timestamp_interval);
            if ($scope.isPoint) {
                if ($scope.genPoints.length > 0) {
                    var routeDatas = [];
                    for (var i = 0; i < $scope.genPoints.length; i++) {
                        routeDatas.push({
                            "context": $("#select-context").val(),
                            "day": $("#select-day").val(),
                            "time": $("#select-time").val(),
                            "index": i,
                            "lng": $scope.genPoints[i].lng,
                            "lat": $scope.genPoints[i].lat,
                            "timestamp": start_timestamp + i * timestamp_interval
                        });
                    }
                    console.log(routeDatas);
                    map.clearOverlays();
                    postRouteData(routeDatas);
                    $("#isPointGenerate")[0].checked = false;
                    $scope.genPoints = [];
                    console.log($scope.isPoint);
                } else {
                    alert("请先点击地图生成数据点！");
                    $("#isPointGenerate")[0].checked = false;
                    console.log($scope.isPoint);
                }

            } else {
                if (null == routeResult) {
                    alert("请先设定一个出行计划！");
                } else {
                    var t = 0;
                    var line_count = 0;
                    var point_count = 0;
                    console.log(routeResult);
                    var route = routeResult.getPlan(0).getRoute(0);
                    var routePath = routeResult.getPlan(0).getRoute(0).getPath();
                    var routeDatas = [];
                    do {

                        routePath = route.getPath();
                        console.log(routePath);
                        for (var i = 0; i < routePath.length; i++) {
                            routeDatas.push({
                                "context": $("#select-context").val(),
                                "day": $("#select-day").val(),
                                "time": $("#select-time").val(),
                                "index": point_count,
                                "lng": routePath[i].lng,
                                "lat": routePath[i].lat,
                                "timestamp": start_timestamp + point_count * timestamp_interval
                            });
                            point_count++;
                        }
                        //console.log('isPublicRoute=' + isPublicRoute);
                        //console.log('current line nums = ' + routeResult.getPlan(0).getNumLines());
                        if ($scope.isPublicRoute && line_count < routeResult.getPlan(0).getNumLines()) {
                            var routeLine = routeResult.getPlan(0).getLine(line_count).getPath();
                            console.log('current line = ' + routeLine);
                            console.log('current line len=' + routeLine.length);
                            for (var j = 0; j < routeLine.length; j++) {
                                routeDatas.push({
                                    "context": $("#select-context").val(),
                                    "day": $("#select-day").val(),
                                    "time": $("#select-time").val(),
                                    "index": point_count,
                                    "lng": routeLine[j].lng,
                                    "lat": routeLine[j].lat,
                                    "timestamp": start_timestamp + point_count * timestamp_interval
                                });
                                point_count++;
                            }
                            line_count++;
                        }

                        t++;
                        route = routeResult.getPlan(0).getRoute(t);
                    } while (route != null);
                    $scope.isPublicRoute = false;
                    //}
                    //console.log("t=======" + t);
                    postRouteData(routeDatas);
                }
            }
        }

        function get_recent_traceid() {
            $.ajax({
                    url: "http://maptools.avosapps.com/trace-ids",
                    data: JSON.stringify({
                        "limit": 15
                    }),
                    type: "POST",
                    contentType: "text/plain",
                    success: function (result) {
                        idlist = JSON.parse(result);
                        var tl = $("#tracelist");
                        tl.empty();
                        for (var i = 0; i < idlist.length; i++) {
                            tl.append('<li>' + idlist[i] + '</li>')
                        }
                    }
                }
            );
        }

        function get_trace(trace_id) {
            $.ajax({
                    url: "http://maptools.avosapps.com/trace",
                    data: JSON.stringify({
                        "trace_id": trace_id
                    }),
                    type: "POST",
                    contentType: "text/plain",
                    success: function (result) {
                        senz_data = JSON.parse(result);
                        drawpoints(senz_data)
                    },
                    error: function (result) {
                        console.log(result.responseText);
                        var msg = JSON.parse(result.responseText).msg;
                        alert(msg);
                    }
                }
            );
        }

        function click_btn_gettrace() {
            trace_id = $("#trace_id").val();
            get_trace(trace_id);

        }

    }]);

