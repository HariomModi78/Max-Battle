let myOption = document.getElementsByClassName("myOption");
for(let i=0;i<myOption.length;i++){
    myOption[i].addEventListener("click",function(){
        window.location.href = `/${myOption[i].id}`
    })
}
let board = document.querySelector(".board");
let slide = document.querySelector(".slide");
let circle = document.getElementsByClassName("circle")

let interval;
let x=100;
circle[0].classList.add("activeImage");
function autoSlide(){
    slide.style.cssText = `transform:translateX(-${x}%)`;
    
    let num = x/100;
    if(num!=0){
        circle[num-1].classList.remove("activeImage");
    }else{
        circle[5].classList.remove("activeImage");   
    }
    circle[num].classList.add("activeImage");
    x = x+100;

    if(x==600){
        x=0;
    }
    

}

interval = setInterval(autoSlide,4000);


let home = document.querySelector(".home");
let earn = document.querySelector(".earn");
let wallet = document.querySelector(".wallet");
let leadboard = document.querySelector(".leadboard");
let profile = document.querySelector(".profile");
let tournament = document.getElementsByClassName("tournament");

for(let i=0;i<tournament.length;i++)
tournament[i].addEventListener("click",function(){
    window.location.href = `/tournament/upcomming/${tournament[i].id}`
})

let y = 0;
window.addEventListener("scroll",function(event){
    if(window.scrollY>0 && window.scrollY>y){
        home.style.cssText = "animation:move linear forwards 500ms;"
        earn.style.cssText = "animation:move linear forwards 500ms;"
        wallet.style.cssText = "animation:move linear forwards 500ms;"
        leadboard.style.cssText = "animation:move linear forwards 500ms;"
        profile.style.cssText = "animation:move linear forwards 500ms;"
        y = window.scrollY;
        console.log("y = ",y);
    }
    else{
        home.style.cssText = "animation:move1 linear forwards 500ms;"
        earn.style.cssText = "animation:move1 linear forwards 500ms;"
        wallet.style.cssText = "animation:move1 linear forwards 500ms;"
        leadboard.style.cssText = "animation:move1 linear forwards 500ms;"
        profile.style.cssText = "animation:move1 linear forwards 500ms;"
            y =0;
        

    }
})
