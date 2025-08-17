let register = document.querySelector(".link1");
let login = document.querySelector(".link2");
let loader = document.querySelector(".loader");
register.addEventListener("click",function(){
    document.querySelector("main").style.display = "none";
    loader.style.display = "block";
    window.location.href = "/register";
})
login.addEventListener("click",function(){
    document.querySelector("main").style.display = "none";
    loader.style.display = "block";
    window.location.href = "/login";
})
window.addEventListener("pageshow", function(event) {
    if (event.persisted) {
        document.querySelector("main").style.display = "block";
        loader.style.display = "none";
    }
});

let board = document.querySelector(".board");
let slide = document.querySelector(".slide");
let circle = document.getElementsByClassName("rectangle")

let interval;
let x=100;
circle[0].classList.add("activeImage");
function autoSlide(){
    slide.style.cssText = `transform:translateX(-${x}%)`;
    
    let num = x/100;
    if(num!=0){
        circle[num-1].classList.remove("activeImage");
    }else{
        circle[3].classList.remove("activeImage");   
    }
    circle[num].classList.add("activeImage");
    x = x+100;

    if(x==400){
        x=0;
    }
    

}

interval = setInterval(autoSlide,4000);