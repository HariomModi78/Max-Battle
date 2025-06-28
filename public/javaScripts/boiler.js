window.addEventListener("resize",function(e){
    if(e.target.innerHeight<e.target.innerWidth){
        document.querySelector("body").style.cssText = "display:none";
    }else{
        document.querySelector("body").style.cssText = "display:block";
    }
})
window.addEventListener("load", function() {
    document.getElementById("pageLoader").style.display = "none";
    document.querySelector("main").style.display = "block";
});
