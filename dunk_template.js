"use strict";

//Quit Button
const quit_button = document.querySelector('#quit');
quit_button.addEventListener('click', quit);

function quit(event){
    box.addEventListener('click', StartGame); //Starts the game when clicked
    box.addEventListener('click', Tap); //When click, call Tap()
    window.location.href = "index.html";
}

//Defintion of variables 
let Start = 0; //Flag variable that encodes if the game has started or not
let move = null; //Flag variable to move the timer bar
let score = 0; //The score of the game
let time = 30; //Time between baskets
const FrameRate = 1/100; //How many frames per second the animations will run at
let BounceTime = 0; //The time it takes between bounces on the rim

let side = 'right'; //States the side where the basket is at
const ScoreTime = [9999,99999]; //Initialize an array that will be used to determine if a basket counts

const rim = document.querySelector('.rim'); //Gets the element rim
const img = document.querySelector('.Ball'); //Gets the ball element
const box = document.querySelector('.Box'); //Gets the box element
const tube = document.querySelector('.tube'); //Gets the tube behind the rim 

let ball = { //Create dictionary with properties of the ball
    vel: {x: 0, y: 0},  //Initial velocity of ball
    pos: {x: parseInt(img.offsetLeft) + parseInt(img.clientWidth)/2, //Set position coordinates
          y: parseInt(img.offsetTop) + parseInt(img.clientWidth)/2}, 
    rad: parseInt(img.clientWidth)/2, //radius of ball in pixels 
    res: 0.7, //Coefficient of restitution for bounces
};

box.addEventListener('click', StartGame); //Starts the game when clicked
box.addEventListener('click', Tap); //When click, call Tap()

//- - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

function StartGame(){ //Runs when the game starts
    const delay = FrameRate * 1000; //Delay between calls of function Move()

    if (Start == 0){ //Check if the game has begun or not
        Start = 1; //Start the game
        const ballUpdate = setInterval(Move, delay); //Start moving the ball. Calls function Move every "delay" miliseconds
    }
}

function Move(){ //Moves the ball downwards with a gravity effect
    const img = document.querySelector('.Ball'); //Gets the image of ball

    MarginsBox(); //Calls subfunctions to evaluate movements
    Bounce();
    BBBounce();
    Gravity(); 
    Friction();
    RimBounce();
    GameOver();

    const Scored = ScoreBasket();

    ball.pos.x += ball.vel.x * FrameRate; //Update position frmo velocity
    ball.pos.y += ball.vel.y * FrameRate; 

   img.style.top = `${ball.pos.y - ball.rad}px`; //Update y_pos
   img.style.left = `${ball.pos.x - ball.rad}px`; //Update x_pos

   if (Scored == 1){
       BasketMade();
       if (side == 'left'){
           side = 'right';
       }
       else {
           side = 'left';
       }
   }

}

function Gravity(){
    const boxHeight = box.clientHeight;

    const g = 3000; //Value of gravity in percentage of screen 

    ball.vel.y += g*FrameRate; //Get velocity from gravity. FrameRate multiplies by the frequency of animation
}

function Bounce(){
    const boxBottom = box.clientTop + box.clientHeight - ball.rad; //Get the y-coord of the bottom of the box

   if (ball.pos.y >= boxBottom){ //If the ball goes to the bottom of the box, make it bounce up
       ball.vel.y = -ball.vel.y * ball.res;
   }

   if (ball.pos.y > boxBottom){
       ball.pos.y = boxBottom;
   }
   
}

function MarginsBox(){ //Have a constant velocity to the right 
    const boxRight = box.clientLeft + box.clientWidth - ball.rad; //Right coord of box
    const boxLeft = box.clientLeft;
    const boxTop = box.clientTop ;

    if (ball.pos.x >= boxRight){ //If ball is on the edge place it on the other side
        ball.pos.x = boxLeft;
    }
    else if (ball.pos.x <= boxLeft){ 
        ball.pos.x = boxRight;
    }

    if (ball.pos.y <= boxTop){
        img.style.visibility = "hidden";
    }
    else {
        img.style.visibility = "visible";
    }
}

function Friction(){ //Function that simulates friction 
    if (ball.pos.y == box.clientHeight - ball.rad + 2){ //If the ball is on the ground
        if (Math.abs(ball.vel.x) > 5){
            const f = 1500*(ball.vel.x/Math.abs(ball.vel.x));
            ball.vel.x -= f*FrameRate; //Decrease x velocity
        }
    }

}

function Tap(event){ //Increase y velocity of ball
        ball.vel.y = -1000;
        
        if (side == 'left'){
            ball.vel.x = -300;
        }
        else {
            ball.vel.x = 300;
        }
}

function BBBounce(){ //Function to evaluate bounce from the backboard
    const bottom = document.querySelector('#bottom');//Select element of the backboard
    const leftBall = ball.pos.x - ball.rad; //Get coordinate of edge of the ball
    const rightBall = ball.pos.x + ball.rad;

    const BB_Bottom = { //Gets the coordinates of the backboard
        x: {left: bottom.offsetLeft + bottom.clientWidth, right: bottom.offsetLeft},
        y: {top: bottom.offsetTop-bottom.clientHeight, bottom: bottom.offsetTop + bottom.clientHeight}
    };


    if (side =='left'){
        if ((leftBall <= BB_Bottom.x.left) && (ball.pos.y <= BB_Bottom.y.bottom) && (ball.pos.y >= BB_Bottom.y.top)){
            ball.vel.x = -ball.vel.x * ball.res; //If the ball hits the backboard, decrease velocity.
        }
    }
    else {
        if ((rightBall >= BB_Bottom.x.right) && (ball.pos.y <= BB_Bottom.y.bottom) && (ball.pos.y >= BB_Bottom.y.top)){
            ball.vel.x = -ball.vel.x * ball.res; //If the ball hits the backboard, decrease velocity.
        }
    }
    
}

function RimBounce(){ 
    const leftBall = ball.pos.x - ball.rad; //Gets left position of the ball 
    const rightBall = ball.pos.x + ball.rad; //Gets right posiiton of the ball
    const d = new Date(); //We define a time to limit the amount of bounces off the rim
    const time = d.getTime();

    const rimCoord = { //Gets x and y coordinates of the edge of rim
        x: {left: [4.3*tube.clientWidth, 5.5*tube.clientWidth], 
           right: [box.clientWidth - 5.5*tube.clientWidth, box.clientWidth - 4.3*tube.clientWidth]},
        y: [tube.offsetTop - 15, tube.offsetTop + 10]
    } 
    
    /*if (score == 1){
        const test = document.createElement('p');
        document.querySelector('.Box').appendChild(test);
        
        test.style.position = 'absolute';
        test.style.top = `${rimCoord.y[0]}px`;
        test.style.left = `${rimCoord.x.left[0]}px`;
        test.style.height = `${rimCoord.y[1]-rimCoord.y[0]}px`;
        test.style.width = `${rimCoord.x.left[1]-rimCoord.x.left[0]}px`;
        test.style.background = 'red';        
    }*/
    

    if (side == 'left'){
        if (time - BounceTime > 100){
            if((ball.pos.x <= rimCoord.x.left[1]) && (ball.pos.x >= rimCoord.x.left[0])){ //Check if the ball hits the rim 
                if((ball.pos.y <= rimCoord.y[1]) && (ball.pos.y >= rimCoord.y[0])){
                   ball.vel.x = -ball.vel.x*0.5;
                   ball.vel.y = -ball.vel.y*0.5;
                   BounceTime = time;
                }
            }
        }
    }

    else {
        if (time - BounceTime > 100){
            if((ball.pos.x <= rimCoord.x.right[1]) && (ball.pos.x >= rimCoord.x.right[0])){ //Check if the ball hits the rim 
                if((ball.pos.y <= rimCoord.y[1]) && (ball.pos.y >= rimCoord.y[0])){
                   ball.vel.x = -ball.vel.x*0.5;
                   ball.vel.y = -ball.vel.y*0.5;
                   BounceTime = time;
                }
            }
        }
    }
}

function ScoreBasket(){
    //Creates an object that represents a line on the rim, with coordinates in x and y-axes
    const D = new Date();

    const membrane = { //Gets the coordinates of the trigger for Scoring a basket
         x: {left : [tube.clientWidth*2, tube.clientWidth*2 + rim.clientWidth], 
            right: [box.clientWidth - tube.clientWidth*2 - rim.clientWidth, box.clientWidth - tube.clientWidth*2]},
         y: [tube.offsetTop - 15, tube.offsetTop - 5]
    };

    const ballTop = ball.pos.y - ball.rad; //Gets position of top and bottom of the ball
    const ballBot = ball.pos.y + ball.rad;
     
    if (ball.vel.y > 0){ //We check if the bottom or top of the ball is going in 
        if (side == 'left'){
            if (ballBot < membrane.y[1] && (ballBot > membrane.y[0]) && (ball.pos.x > membrane.x.left[0]) && (ball.pos.x < membrane.x.left[1]))
            {
                ScoreTime[0] = D.getTime(); //Record the time the bottom of the ball crosses the membrane

            }
            else if ((ballTop < membrane.y[1] && (ballTop > membrane.y[0]) && (ball.pos.x > membrane.x.left[0]) && (ball.pos.x < membrane.x.left[1])))
            {

                ScoreTime[1] = D.getTime(); //Record the time the top of the ball crosses the membrane
            
                if (ScoreTime[1] - ScoreTime[0] < 1000){
                    return 1;
                }
            }
        }
        else {
            if (ballBot < membrane.y[1] && (ballBot > membrane.y[0]) && (ball.pos.x > membrane.x.right[0]) && (ball.pos.x < membrane.x.right[1]))
            {
                ScoreTime[0] = D.getTime(); //Record the time the bottom of the ball crosses the membrane
            }
            else if ((ballTop < membrane.y[1] && (ballTop > membrane.y[0]) && (ball.pos.x > membrane.x.right[0]) && (ball.pos.x < membrane.x.right[1])))
            {
                ScoreTime[1] = D.getTime(); //Record the time the top of the ball crosses the membrane
            
                if (ScoreTime[1] - ScoreTime[0] < 1000){
                    return 1;
                }
            }
        }

    return 0;
    }

    


}

function BasketMade (event){ /* Function that is called when the player scores a basket.*/
    box.addEventListener('click', Tap);

    const blackBar = document.getElementById('BlackBar');
    blackBar.style.width = '0px';

    const timerBar = document.querySelector('.Timer');
    timerBar.style.backgroundColor = "cyan";
    TimeGet();
    console.log(time);
    clearInterval(move); //Stop animation when the bar is all black
    move = null;

    if (move == null) {
        move = setInterval(TimeDecrease, time); //Reset time and start decreasing it
    }

    MoveBasket();//Switch the side of the hoop

    CountScore();//Updates the current score
        
}

function MoveBasket(){ //Switches the basket of side after scoring
    const basket = document.querySelectorAll('.hoop');

    if (basket[0].classList.contains('left')){ //Change the hoop to the right
        for(let k=0; k<4; k++){
            basket[k].classList.remove('left');
            basket[k].classList.add('right');
        }
    }
    else {
        for(let k=0; k<4; k++){ //Change the hoop to the left
            basket[k].classList.remove('right');
            basket[k].classList.add('left');
        }
    }
}

function CountScore(){
    /*if (streak == 0){ //Verify how many points must be added
        score += 1;
    }
    else if (streak == 1){
        score += 2; 
    }
    else if (streak == 2){
        score += 4;
    }
    else {
        score += 8;
    }*/

    score++; //Increase the streak value

    const scoreText = document.querySelector('.Score'); //Update the scorebpard
    scoreText.textContent = score;


}

function TimeDecrease() { //Decreases the bar that shows the remaining time left

    const timerBar = document.querySelector('.Timer'); //Select box of timer bar
    const maxWidth = parseInt(timerBar.clientWidth); //Width of the whole rectangle

    const blackBar = document.getElementById('BlackBar'); //Select the black part of the timer bar
    const width = blackBar.clientWidth; //Width of the black part of the bar

    if (width >= maxWidth/2){ //Change color to red as time is finishing
        timerBar.style.backgroundColor = "red";
    }

    if (width >= maxWidth){
        clearInterval(move); //Stop animation when the bar is all black
        move = null;
    }
    else {
        blackBar.style.width = `${1+width}px`;  //Decrease size of timer bar
    }
}

function TimeGet(){ //Defines the time for a specific turn
    if (time < 10){
        time = 9;
    }
    else{
        time -= 1;
    }
}

function GameOver(){
    const timerBar = document.querySelector('.Timer'); //Select box of timer bar
    const blackBar = document.getElementById('BlackBar'); //Select the black part of the timer bar

    if (blackBar.clientWidth >= timerBar.clientWidth){
        box.removeEventListener('click', Tap);

        if ((ball.pos.y >= box.clientHeight*0.8) && (ball.vel.y > 0)){
            const gameOver = document.createElement('h1');
            box.appendChild(gameOver);

            gameOver.textContent = "GAME OVER"
            gameOver.classList.add('GameOver');
        }

    }
}

   
