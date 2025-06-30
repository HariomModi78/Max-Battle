let footerBox = document.getElementsByClassName("footerBox");
let pageLoader = document.getElementById("pageLoader");
let mainHeader = document.querySelector(".header");

for(let i=0;i<footerBox.length;i++){
    footerBox[i].addEventListener("click",function(e){
        window.location.href = `/${e.target.id}`
    })
}

for(let i=0;i<footerBox.length;i++){
    footerBox[i].addEventListener("click", function() {
        document.querySelector(".page").style.display = "none";
        pageLoader.style.display = "block";
        console.log(footerBox[i].classList[1])
        if(footerBox[i].classList[1]=="wallet"){
            mainHeader.style.display = "none";

            let header = document.createElement("div");
            header.classList = "header";
            let back = document.createElement("div");
            back.classList = "logo";
            let img = document.createElement("img");
            img.src = "https://cdn-icons-png.flaticon.com/128/3114/3114883.png";
            
            let greet = document.createElement("div");
            greet.classList = "greet";
            let p = document.createElement("p");
            p.classList = "big";
            let notification = document.createElement("div");
            notification.classList = "notification";
            header.appendChild(back);
            back.appendChild(img);
            header.appendChild(greet);
            greet.appendChild(p);
            header.appendChild(notification); 
            pageLoader.appendChild(header);
            p.innerText = "My Wallet"
        }
        
        

    
     setTimeout(function(){
            document.querySelector(".page").style.display = "block";
            mainHeader.style.display = "flex";
            pageLoader.style.display = "none";
        },1500);
});
}