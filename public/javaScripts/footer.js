let footerBox = document.getElementsByClassName("footerBox");
let pageLoader = document.getElementById("pageLoader");
let mainHeader = document.querySelector(".header");

for (let i = 0; i < footerBox.length; i++) {
    footerBox[i].addEventListener("click", function() {
        let targetId = this.getAttribute("id") || this.id;
        let page = document.querySelector(".page");
        if (page) page.style.display = "none";
        if (pageLoader) pageLoader.style.display = "block";

        if (this.classList.contains("wallet")) {
            localStorage.setItem("wallet", 1);
            if (mainHeader) mainHeader.style.display = "none";

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
            if (pageLoader) {
                pageLoader.appendChild(header);
                p.innerText = "My Wallet";
            }
        } else if (this.classList.contains("notification")) {
            localStorage.setItem("wallet", 1);
            if (mainHeader) mainHeader.style.display = "none";
            let notifNumber = document.querySelector(".notificationNumber");
            if (notifNumber) {
                notifNumber.style.display = "none";
            }
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
            if (pageLoader) {
                pageLoader.appendChild(header);
                p.innerText = "Notification";
            }
        } else if (localStorage.getItem("wallet")) {
            localStorage.removeItem("wallet");
            if (mainHeader) mainHeader.style.display = "none";

            let header = document.createElement("div");
            header.classList = "header";
            let back = document.createElement("div");
            back.classList = "logo";
            let img = document.createElement("img");
            img.classList = "icon";
            img.src = "/images/logo.webp";

            let support = document.createElement("div");
            support.classList = "support";
            let img1 = document.createElement("img");
            img1.src = "/images/support.webp";
            let greet = document.createElement("div");
            greet.classList = "greet";
            let p1 = document.createElement("p");
            p1.innerText = "Welcome Back,";
            let p = document.createElement("p");
            p.classList = "big";
            p.innerText = "Max Battle";
            let walletAmount = document.createElement("div");
            walletAmount.classList = "walletAmount";
            let img2 = document.createElement("img");
            img2.classList = "verySmallCoin";
            img2.src = "https://cdn-icons-png.flaticon.com/128/9382/9382295.png";
            back.appendChild(img);
            header.appendChild(back);
            support.appendChild(img1);
            header.appendChild(support);
            header.appendChild(greet);
            greet.appendChild(p1);
            greet.appendChild(p);
            walletAmount.appendChild(img2);
            header.appendChild(walletAmount);
            if (pageLoader) pageLoader.appendChild(header);
        }

        if (targetId) {
            window.location.href = `/${targetId}`;
        }
    });
}

window.addEventListener("pageshow", function(event) {
    let page = document.querySelector(".page");
    if (page) page.style.display = "block";
    if (mainHeader) mainHeader.style.display = "flex";
    if (pageLoader) pageLoader.style.display = "none";
});
