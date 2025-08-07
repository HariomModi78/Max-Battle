window.addEventListener("pageshow", function(event) {
    document.querySelector(".page").style.display = "block";
            footer.style.display = "flex";
            mainHeader.style.display = "flex";
            pageLoader.style.display = "none"; 

    

            
});

let dailySpin = document.querySelector(".dailySpin");
dailySpin.addEventListener("click",function(){

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
            p.innerText = "Daily Spin";
            pageLoader.style.display = "flex";
    window.location.href = `/spin/${dailySpin.id}`;
})
let confirm = document.querySelector(".confirm");
let confirm1 = document.querySelector(".confirm1");

let joinBonus = document.querySelector(".joiningBonus");
confirm.addEventListener("click",function(){
    joinBonus.style.display = "none";
    fetch(`/confirmBonus/${confirm.id}`,{
        method:"GET"
    })
})
confirm1.addEventListener("click",function(){
    joinBonus.style.display = "none";
})
let myOption = document.getElementsByClassName("myOption");
let boardImage = document.getElementsByClassName("boardImage");
for(let i=0;i<boardImage.length;i++){
    boardImage[i].addEventListener("click",function(){
        if(boardImage[i].id != "#tournamentBox"){
            pageLoader.style.display = "block"
        document.querySelector(".page").style.display = "none";
        footer.style.display = "none";
        mainHeader.style.display = "none";
        }
        
        window.location.href = `${boardImage[i].id}`
    })
}
for(let i=0;i<myOption.length;i++){
    myOption[i].addEventListener("click",function(e){
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
            console.log(myOption[i].classList[1])
        if(myOption[i].classList[1] == "ongoing"){
            p.innerText = "My Ongoing";
        }else if(myOption[i].classList[1] == "upcoming"){
            p.innerText = "My upcoming";
        }else{
            p.innerText = "My Completed";
        }
        pageLoader.style.display = "flex";
        window.location.href = `/${myOption[i].id}`
    })
    
}

let slide = document.querySelector(".slide");
let circle = document.getElementsByClassName("circle");
let images = document.querySelectorAll(".boardImage");
let totalSlides = images.length;

let x = 0;
let interval;

function updateSlide(index) {
    x = index * 100;
    slide.style.transform = `translateX(-${x}%)`;

    for (let i = 0; i < totalSlides; i++) {
        circle[i].classList.remove("activeImage");
    }
    circle[index].classList.add("activeImage");
}

function autoSlide() {
    let currentIndex = x / 100;
    let nextIndex = (currentIndex + 1) % totalSlides;
    updateSlide(nextIndex);
}

interval = setInterval(autoSlide, 4000);

// Circle click
for (let i = 0; i < circle.length; i++) {
    circle[i].addEventListener("click", () => {
        clearInterval(interval);
        updateSlide(i);
        interval = setInterval(autoSlide, 4000);
    });
}

// Image click (based on ID as link)
images.forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
        let target = img.id;
        if (target) {
            if (target.startsWith("http")) {
                window.open(target, "_blank");
            } else {
                window.location.href = target;
            }
        }
    });
});

// ✅ Swipe / Drag Support
let startX = 0;
let endX = 0;

// Touch (mobile)
slide.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
});
slide.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
});

// Mouse (desktop drag)
slide.addEventListener("mousedown", (e) => {
    startX = e.clientX;
});
slide.addEventListener("mouseup", (e) => {
    endX = e.clientX;
    handleSwipe();
});

function handleSwipe() {
    let deltaX = endX - startX;

    if (Math.abs(deltaX) < 50) return; // Ignore small movement

    clearInterval(interval);
    let currentIndex = x / 100;

    if (deltaX > 0) {
        // Swipe right (previous)
        let prev = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlide(prev);
    } else {
        // Swipe left (next)
        let next = (currentIndex + 1) % totalSlides;
        updateSlide(next);
    }

    interval = setInterval(autoSlide, 4000);
}

// Init
updateSlide(0);




let home = document.querySelector(".home");
let wallet = document.querySelector(".wallet");
let leadboard = document.querySelector(".leadboard");
let profile = document.querySelector(".profile");
let footer = document.querySelector(".footer");
let tournament = document.getElementsByClassName("tournament");

for(let i=0;i<tournament.length;i++)
tournament[i].addEventListener("click",function(){
    document.querySelector(".page").style.display = "none";
    mainHeader.style.display = "none";
    footer.style.display = "none";

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
            console.log(tournament[i].classList[1]);
        if(tournament[i].classList[1].split("/")[0] == "fullmap"){
            p.innerText = "FULL MAP";
        }else{
            p.innerText = "CLASH SQUAD";
        }
        pageLoader.style.display = "flex";
    window.location.href = `/tournament/upcoming/${tournament[i].classList[1]}/${tournament[i].id}`
})
window.addEventListener("pageshow",function(){
    document.querySelector(".page").style.display = "block";
            footer.style.display = "flex";
            mainHeader.style.display = "flex";
            pageLoader.style.display = "none";
})
let y = 0;
window.addEventListener("scroll",function(event){
    if(window.scrollY>0 && window.scrollY>y){
        home.style.cssText = "animation:move linear forwards 500ms;"
        wallet.style.cssText = "animation:move linear forwards 500ms;"
        leadboard.style.cssText = "animation:move linear forwards 500ms;"
        profile.style.cssText = "animation:move linear forwards 500ms;"
        footer.style.cssText = "animation:move linear forwards 500ms;"
        y = window.scrollY;
        dailySpin.style.display = "none";
        console.log("y = ",y);

    }
    else{
        home.style.cssText = "animation:move1 linear forwards 500ms;"
        wallet.style.cssText = "animation:move1 linear forwards 500ms;"
        leadboard.style.cssText = "animation:move1 linear forwards 500ms;"
        profile.style.cssText = "animation:move1 linear forwards 500ms;"
        footer.style.cssText = "animation:move1 linear forwards 500ms;"
            y =0;
        dailySpin.style.display = "block";
        

    }
})


