let mobileMenu = document.querySelector(".mobileMenu");
let sideBar = document.querySelector(".sideBar");

let flag = false;
mobileMenu.addEventListener("click",function(){
    if(flag==false){
        sideBar.classList = "mobileSideBar";
        sideBar.style.cssText = "display:flex";
        flag = true;
    }else{
        console.log("Working");
        sideBar.style.cssText = "display:none";
        flag = false;
    }
})

let events = document.getElementsByClassName("event");
let option = document.getElementsByClassName("option");

for(let i=0;i<events.length;i++){
    events[i].addEventListener("click",function(){
        events[i].classList.add("eventjs");
        window.addEventListener("pageshow",function(){
    events[i].classList.remove("eventjs");
})
        window.location.href = `/${events[i].id}`;
    })
}

for(let i=0;i<option.length;i++){
    option[i].addEventListener("click",function(){
        window.location.href = `/${option[i].id}`;
    })
}


