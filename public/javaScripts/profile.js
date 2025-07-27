let option = document.getElementsByClassName("option");
let footer = document.querySelector(".footer");
for(let i=0;i<option.length;i++){
    option[i].addEventListener("click",function(){
        document.querySelector(".page").style.display = "none";
        footer.style.display = "none";
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
            console.log(option[i].classList[1])
        if(option[i].classList[1] == "profile"){
            p.innerText = "My Profile";
        }else if(option[i].classList[1] == "wallet"){
            p.innerText = "My Wallet";
        }else if(option[i].classList[1] == "faq"){
            p.innerText = "FAQ";
        }
        pageLoader.style.display = "flex";
        setTimeout(function(){
            document.querySelector(".page").style.display = "block";
            footer.style.display = "flex";
            mainHeader.style.display = "flex";
            pageLoader.style.display = "none";
        },3000);
        window.location.href = `/${option[i].id}`;
    })
}