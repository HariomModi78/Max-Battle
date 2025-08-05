window.addEventListener("resize",function(e){
    if(e.target.innerHeight<e.target.innerWidth){
        document.querySelector("body").style.cssText = "display:none";
    }else{
        document.querySelector("body").style.cssText = "display:block";
    }
})

let disconnect = document.querySelector(".disconnect");

window.addEventListener("online",function(){
    disconnect.style.display = "none";
})
window.addEventListener("offline",function(){
    disconnect.style.display = "flex";
})

