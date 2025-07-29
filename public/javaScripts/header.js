let  walletAmount = document.querySelector(".walletAmount");

walletAmount.addEventListener("click",function(){
    localStorage.setItem("wallet",1)
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
            pageLoader.style.cssText = "display:flex";
            document.querySelector(".page").style.display = "none";
            p.innerText = "My Wallet"
            window.location.href = `/${walletAmount.id}`;
})