let input = document.getElementsByTagName("input");
let label = document.getElementsByTagName("label");
let payAndJoin = document.querySelector(".payAndJoin");
let form = document.querySelector("form");


payAndJoin.addEventListener("click",function(){
    form.submit();
})
let count;
for(let i=0;i<input.length;i++){
    input[i].addEventListener("click",function(){
        if(count || count==0){
             if(input[count].value == ""){
                label[count].classList.remove("clickLabel");
                // input[count].classList.remove("clickInput");
            }else{
                // input[count].classList.remove("clickInput");
            }
        }
        label[i].classList = "clickLabel";
        // input[i].classList = "clickInput";
        count = i;
    })
}

