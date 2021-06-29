let width = $(window).width() > 880 ? 880 : $(window).width()
let height = width * 3 / 4
let pose;
let skeleton
let defaultNosePosition = []
let movement = 0
let movementTime =30//60*30
//video distraction
let prevNose

let classifier;
let imageModelURL = 'js/fatigue2/';
let flippedVideo;
let canvas
let webcam_output

let tiredCount = 0
Notiflix.Report.Init({});
Notiflix.Notify.Init({})
    
function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}
$("#start-monitor").click(function () {
$(".header_section").remove()
    $("#start-monitor").remove()

    Notiflix.Report.Info('Good Posture', 'Before starting, please be in good posture...', 'I am sitting up straight', function () {
        var loc_array = {}
        let start = new Date()
        
        // variable to count the number of undefines (used for ratio of distraction)
        var distracted = 0 // should be up here if it should be reset by the user
        let check_time_length = 300 // 300 representing 5 minutes

        /* webgazer.begin()
        webgazer.setGazeListener(function(data) {
            var now = new Date()

            time_diff = Math.round((now - start) / 1000)
            //console.log(time_diff)

            if (data !== null) {
                var xprediction = data.x; //these x coordinates are relative to the viewport
                var yprediction = data.y; //these y coordinates are relative to the viewport
                loc_array[time_diff] = [xprediction, yprediction]
                //console.log(xprediction, yprediction)
            } else {
                loc_array[time_diff] = [undefined, undefined]
            }
            
            let check_time = time_diff - check_time_length

            if (check_time in loc_array) {
                distracted = 0
                console.log("start")
                for (let i=0; i < check_time_length; i++) {
                    loc_item = loc_array[time_diff-i]
                    if (typeof loc_item == "undefined") {
                        distracted++ // if undefined, user is "distracted in that second"
                    } else if (loc_item[0] < 0 || loc_item[1] < 0) {
                        distracted++ // out of screen
                    } else if (loc_item[0]/$(window).width() > 1 || loc_item/$(window).height() > 1) { // adjusted screen ratios too preference
                        distracted++ // out of screen
                    }
                }
                let ratio_of_distraction = distracted / check_time_length
                console.log(ratio_of_distraction)
                console.log("end")
            }
        }).begin(); */
        canvas = createCanvas(width, height);
        canvas.parent("demo-angel");
        $('#defaultCanvas0').css('display', 'flex')

        $('#defaultCanvas0').css('margin', 'auto')
        $('#defaultCanvas0').css('border', '10px solid #F44A87')

        webcam_output = createCapture(VIDEO);
        webcam_output.size(width, height);
        poseNet = ml5.poseNet(webcam_output, modelReady);

        poseNet.on('pose', function (results) {
            if (results.length > 0) {
                pose = results[0].pose
                skeleton = results[0].skeleton
            }

        });
        webcam_output.hide()
        flippedVideo = ml5.flipImage(webcam_output);
        classifyVideo();
        setInterval(function () {
            if (pose) {
                if (pose["nose"].confidence == prevNose) {
                    movement += 1

                }
                else {
                    if (pose["leftEar"].confidence > 0.2 && pose["rightEar"].confidence > 0.2 && pose["rightEye"].confidence > 0.2 && pose["leftEye"].confidence > 0.2) {
                        if (defaultNosePosition.length < 1) {
                            defaultNosePosition.push(pose["nose"].y);
                        }
                        let arr = [pose["leftEar"], pose["leftEye"], pose["rightEye"], pose["rightEar"]]

                        if (pose["nose"].y - defaultNosePosition[0] > 20 || straight(arr)) {
                            blurScreen();
                        }
                        if (pose["nose"].y - defaultNosePosition[0] < 20 && !straight(arr)) {
                            removeBlur();
                        }




                    }
                }
                prevNose = pose["nose"].confidence

            }

        }, 1000)
        setInterval(checkMovement, movementTime * 1000);
    })

})
function classifyVideo() {
    flippedVideo = ml5.flipImage(webcam_output)
    classifier.classify(flippedVideo, gotResult);
    flippedVideo.remove();

}
function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    if (results[0].label == "Class 1") {

        tiredCount += 1
    }
    if (tiredCount > 10) {
        Notiflix.Notify.Warning("Maybe it's time to head to bed!");
        /* $.notify("Maybe it's time to head to bed!","warn"); */

        tiredCount = 0
    }
    setTimeout(() => {
        classifyVideo();
    }, 500)


}

function modelReady() {
    console.log("model loaded")
}
function draw() {
    if (webcam_output) {
        image(webcam_output, 0, 0, width, height);
        if (pose) {


            for (let j = 0; j < pose.keypoints.length; j++) {
                let keypoint = pose.keypoints[j];
                if (keypoint.score > 0.2) {
                    fill(93, 173, 236);
                    stroke(255);

                    ellipse(keypoint.position.x, keypoint.position.y, 16, 16);
                }
            }
            for (let j = 0; j < skeleton.length; j++) {
                let startPoint = skeleton[j][0];
                let endPoint = skeleton[j][1];

                strokeWeight(2);
                stroke(244, 74, 135);
                line(startPoint.position.x, startPoint.position.y, endPoint.position.x, endPoint.position.y);
            }
        }
    }


}

function checkMovement() {
    if (movement < 0.2 * movementTime) {
        Notiflix.Notify.Info("A kind reminder to rest from the computer becasue you haven't moved much in the past 30 seconds...")
        /* $.notify("A kind reminder to rest from the computer becasue you haven't moved much in the past 30 seconds...","info"); */
    }
    movement = 0
}
function blurScreen() {
    //Notiflix.Notify.Failure("Please correct your posture!");

    document.body.style.filter = 'blur(10px)';
    document.body.style.transition = '0.3s';
}
function removeBlur() {
    document.body.style.filter = 'blur(0px)';
}
function straight(points) {
    let totalDistance = 0
    for (var i = 0; i < points.length - 1; i++) {
        totalDistance += distance(points[i], points[i + 1])

    }
    let shortest = distance(points[0], points[points.length - 1])
    return (totalDistance / shortest) < 1.03

}
function distance(point1, point2) {
    return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2))
}




