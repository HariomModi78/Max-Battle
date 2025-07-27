let reward = document.getElementsByClassName("reward");
let angle = 20;
let radius = 120; // Adjust radius as needed (in pixels)

for (let i = 0; i < reward.length; i++) {
    // Convert angle to radians
    let rad = angle * (Math.PI / 180);
    let x = radius * Math.cos(rad);
    let y = radius * Math.sin(rad);

    reward[i].style.position = "absolute";
    reward[i].style.left = `calc(50% + ${x}px)`;
    reward[i].style.top = `calc(50% + ${y}px)`;
    
    reward[i].style.transform = `translate(-50%, -50%) rotate(${18}deg)`;
    angle += 45;
}

let spin = document.querySelector(".spin");
let button = document.querySelector(".button");
let audio = new Audio("/audio/spin.mp3");
let coin = new Audio("/audio/coin.mp3");
let duck = new Audio("/audio/duck.mp3");
let bigWin = new Audio("/audio/bigWin.mp3");
let point = document.querySelector(".triangle")
let winning = document.querySelector(".winning");
let loss = document.querySelector(".loss");
let upperPart = document.querySelector(".upperPart");
let winGreet = document.querySelector(".winGreet");
let congratulation = document.querySelector(".congratulation");
async function spinWheel(){
    audio.play();
    button.style.cssText = "display:none";
    let res = await fetch(`/spinResult/${spin.id}`,{
        method:"GET",
        headers:{
            "Content-Type":"application/json"
        }
    })
    let num = await res.json();
    if(!num){
        window.location.reload();
    }
    num = num.num
    console.log(num)
    if(num==0){
        angle = 105;
        setTimeout(function(){
        audio.pause();
        coin.play();
        winning.style.display = "flex";
        upperPart.innerHTML = "💵0.5";
        coin.currentTime = 0;
        audio.currentTime = 0;

    },1000)
    }else if(num ==1){
        angle = 65;
        setTimeout(function(){
        audio.pause();
        duck.play();
        loss.style.display = "flex";
        
        duck.currentTime = 0;
        audio.currentTime = 0;

    },1000)
    }else if(num == 2){
        angle = 155;
        setTimeout(function(){
        audio.pause();
        coin.play();
        winning.style.display = "flex";
        upperPart.innerHTML = "💵1";
        coin.currentTime = 0;
        audio.currentTime = 0;

    },1000)
    }else if(num == 3){
        angle = 245;
        setTimeout(function(){
        audio.pause();
        duck.play();
        loss.style.display = "flex";
        duck.currentTime = 0;
        audio.currentTime = 0;

    },1000)
    }else if(num == 4){
        angle = 200;
        setTimeout(function(){
        audio.pause();
        coin.play();
        winning.style.display = "flex";
        upperPart.innerHTML = "💵2";
        coin.currentTime = 0;
        audio.currentTime = 0;

    },1000)
    }else if(num==5){
        angle = 340;
        setTimeout(function(){
        audio.pause();
        bigWin.play();
        winning.style.display = "flex";
        upperPart.innerHTML = "💵5";
        bigWin.currentTime = 0;
        audio.currentTime = 0;

    },1000)
    }
    angle = angle + 360*2;
    spin.style.cssText = `transform: translate(-50%,-50%) rotate(${angle}deg)`;
    
    setTimeout(function(){
    spin.style.cssText = `transform: translate(-50%,-50%);transition:all 100ms`;
    button.style.cssText = "display:flex"
    loss.style.display = "none";
    winning.style.display = "none";
    window.location.reload();
    },3000)
}
button.addEventListener("click",spinWheel);
point.addEventListener("click",spinWheel);
