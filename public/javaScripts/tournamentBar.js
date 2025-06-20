let option = document.getElementsByClassName("option");

for(let i=0;i<option.length;i++){
    option[i].addEventListener("click",function(){
        window.location.href = `/tournament/${option[i].id}/fullMap`
    })
}