window.addEventListener("resize",function(e){
    if(e.target.innerHeight<e.target.innerWidth){
        document.querySelector("body").style.cssText = "display:none";
    }else{
        document.querySelector("body").style.cssText = "display:block";
    }
})


