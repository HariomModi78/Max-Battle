let confirm = document.querySelector(".confirm");
let joinBonus = document.querySelector(".joiningBonus");
confirm.addEventListener("click",function(){
    joinBonus.style.display = "none";
    fetch(`/confirmBonus/${confirm.id}`,{
        method:"GET"
    })
})
let myOption = document.getElementsByClassName("myOption");
let boardImage = document.getElementsByClassName("boardImage");
for(let i=0;i<boardImage.length;i++){
    boardImage[i].addEventListener("click",function(){
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
window.addEventListener("pageshow", function(event) {
    document.querySelector(".page").style.display = "block";
            footer.style.display = "flex";
            mainHeader.style.display = "flex";
            pageLoader.style.display = "none";
});
let board = document.querySelector(".board");
let slide = document.querySelector(".slide");
let circle = document.getElementsByClassName("circle")

let interval;
let x=100;
circle[0].classList.add("activeImage");
function autoSlide(){
    slide.style.cssText = `transform:translateX(-${x}%)`;
    
    let num = x/100;
    if(num!=0){
        circle[num-1].classList.remove("activeImage");
    }else{
        circle[5].classList.remove("activeImage");   
    }
    circle[num].classList.add("activeImage");
    x = x+100;

    if(x==600){
        x=0;
    }
    

}

interval = setInterval(autoSlide,4000);


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
        setTimeout(function(){
            document.querySelector(".page").style.display = "block";
            footer.style.display = "flex";
            mainHeader.style.display = "flex";
            pageLoader.style.display = "none";
        },3000);
        console.log(tournament[i].classList[1])
    window.location.href = `/tournament/upcoming/${tournament[i].classList[1]}/${tournament[i].id}`
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
        console.log("y = ",y);
    }
    else{
        home.style.cssText = "animation:move1 linear forwards 500ms;"
        wallet.style.cssText = "animation:move1 linear forwards 500ms;"
        leadboard.style.cssText = "animation:move1 linear forwards 500ms;"
        profile.style.cssText = "animation:move1 linear forwards 500ms;"
        footer.style.cssText = "animation:move1 linear forwards 500ms;"
            y =0;
        

    }
})


