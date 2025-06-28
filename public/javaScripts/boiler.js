window.addEventListener("resize",function(e){
    if(e.target.innerHeight<e.target.innerWidth){
        document.querySelector("body").style.cssText = "display:none";
    }else{
        document.querySelector("body").style.cssText = "display:block";
    }
})
console.log(footerBox);
for(let i=0;i<footerBox.length;i++){
    footerBox[i].addEventListener("click", function() {
    document.querySelector("main").style.display = "none";
    document.getElementById("pageLoader").style.display = "flex";
});
}
window.addEventListener("load", function() {
    document.getElementById("pageLoader").style.display = "none";
    document.querySelector("main").style.display = "block";
});
