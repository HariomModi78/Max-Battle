
const input = document.getElementsByClassName("input");
const username = document.getElementsByClassName("username");
const button = document.querySelector(".button");
const usersInput = document.querySelector(".users");
const finalButton = document.querySelector(".finalButton");
let users = [];
finalButton.addEventListener("click",function(){
    for(let i=0;i<input.length;i++){
        users.push({
            userId:username[i].id,
            kills:input[i].value
        })
    }
    console.log(users);
    usersInput.value = JSON.stringify(users);
})
