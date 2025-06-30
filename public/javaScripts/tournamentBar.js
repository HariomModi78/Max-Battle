let option = document.getElementsByClassName("option");

for(let i=0;i<option.length;i++){
    option[i].addEventListener("click",function(){
        document.querySelector(".page").style.display = "none";
        document.getElementById("pageLoader").style.display = "flex";
        setTimeout(function(){
            document.querySelector(".page").style.display = "block";
            document.getElementById("pageLoader").style.display = "none";
        },1000);
        window.location.href = `/tournament/${option[i].id}`
    })
}