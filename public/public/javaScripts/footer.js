let footerBox = document.getElementsByClassName("footerBox");

for(let i=0;i<footerBox.length;i++){
    footerBox[i].addEventListener("click",function(e){
        window.location.href = `/${e.target.id}`
    })
}

