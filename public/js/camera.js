let width = $(window).width() > 880 ? 880 : $(window).width()
let height = width * 3 / 4
let pose;
let skeleton
let defaultNosePosition = []
let movement = 0
let prevNose
function setup() {
    //before starting, please be in good posture

    canvas = createCanvas(width, height);
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

}

function modelReady() {
    console.log("model loaded")
}
function draw() {
    image(webcam_output, 0, 0, width, height);
    if (pose) {

        if (pose["nose"] && pose["leftEar"] && pose["rightEar"] && pose["rightEye"] && pose["leftEye"]) {
            if (defaultNosePosition.length < 1) {
                defaultNosePosition.push(pose["nose"].y);
            }
            //Compare default position with current position. If the difference more than 15, it means a person doesn't keep good posture and program calls the function that blurs screen.
            if (pose["nose"].y - defaultNosePosition[0] > 30) {
                blurScreen();
            }
            //If the difference less than 15, it means a person is sitting with correct posture.
            if (pose["nose"].y - defaultNosePosition[0] < 30) {
                removeBlur();
            }
            let arr = [pose["leftEar"],pose["leftEye"],pose["rightEye"],pose["rightEar"]]
            if(straight(arr)){
                blurScreen()
            }
            if(!straight(arr)){
                removeBlur()
                //tonight eat class and review ai
                //every thirty minutes, remind to excercise if position hasn't changed much
            }
            if(pose["nose"]){
                if(prevNose){

                    movement+=distance(pose["nose"],prevNose)
                    prevNose=pose["nose"]
                    
                    
                }
                else{
                    prevNose=pose["nose"]
                }
                
            }
            

        }


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
    
    //if in straight line or if nose moved down
}
setInterval(checkMovement, 1000*60*30);
function checkMovement(){
    if(movement<1000*60*30){
        alert("Please go outside to excercise or move around a bit..")
    }//sane and healthy while working from home
}//if on screen go outside

function blurScreen() {
    document.body.style.filter = 'blur(10px)';
    document.body.style.transition = '0.9s';
}
function removeBlur() {
    document.body.style.filter = 'blur(0px)';
}
//if not straight
function straight(points) {
    let totalDistance = 0
    for (var i = 0; i < points.length - 1; i++) {
        totalDistance += distance(points[i], points[i + 1])

    }
    let shortest = distance(points[0], points[points.length - 1])
    return (totalDistance / shortest) < 1.15

}
function distance(point1, point2) {
    return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2))
}