
const input = document.getElementsByClassName("input");
const username = document.getElementsByClassName("username");
const button = document.querySelector(".button");
const usersInput = document.querySelector(".users");
const finalButton = document.querySelector(".finalButton");
let users = [];
button.addEventListener("click",function(){
    for(let i=0;i<input.length;i++){
        users.push({
            userId:username[i].id,
            kills:input[i].value
        })
    }
    console.log(users);
    usersInput.value = JSON.stringify(users);
    button.style.cssText = "display:none";
    alert("Check kills properly and press distribute button for final prize distribution")
    finalButton.style.cssText = "display:flex";
})
