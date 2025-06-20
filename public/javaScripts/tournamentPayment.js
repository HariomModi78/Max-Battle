let edit = document.querySelector(".edit");
let close1 = document.querySelector(".close");
let label = document.querySelector("label");
let input = document.querySelector(".input");
let playerNameJs = document.querySelector(".playerNameJs");

edit.addEventListener("click",function(){
    playerNameJs.style.cssText = "display:block"
})
close1.addEventListener("click",function(){
    playerNameJs.style.cssText = "display:none"
})
input.addEventListener("click",function(){
    label.classList = "labelClick"
})
window.addEventListener("click",function(e){
    if(input.value.length==0 && e.target.className != "input"){
        label.classList = "lableUnclick";
        console.log("workgtin")
    }
        console.log("not")

})