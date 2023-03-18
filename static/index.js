window.addEventListener("DOMContentLoaded", ()=>{

    let charSelect = document.getElementById("characters");

    let actsDiv = document.getElementById("acts");
    let actSelect = document.getElementById("act-select");

    let scenesDiv = document.getElementById("scenes");
    let sceneSelect = document.getElementById("scene-select");

    let numKeywords = document.getElementById("numkeys-select");

    let formBtn = document.getElementById("form-btn");

    let outputBox = document.getElementById("output-box");

    charSelect.addEventListener('change', async ()=>{
        sceneSelect.innerHTML = "";
        actSelect.innerHTML = "";

        actsDiv.style.display = "none";
        scenesDiv.style.display = "none";
        formBtn.style.display = "none";

        if(charSelect.value != ""){
            await fetch(`/getcharact/${charSelect.value}`)
            .then(response => response.json())
            .then(data => {
                let actOptions = "<option value=''>All</option>";
                for(let i = 0; i < data.length; i++){
                    actOptions += "<option value=" + data[i] + ">" + data[i] + "</option>";
                }
                actSelect.innerHTML = actOptions;
            });

            actsDiv.style.display = "block";
        }
        formBtn.style.display = "block";
    });

    actSelect.addEventListener('change', async ()=>{
        sceneSelect.innerHTML = "";
        scenesDiv.style.display = "none";
        formBtn.style.display = "none";

        if(actSelect.value != ""){
            await fetch(`/getcharscene/${charSelect.value}&${actSelect.value}`)
            .then(response => response.json())
            .then(data => {
                let sceneOptions = "<option value=''>All</option>";
                for(let i = 0; i < data.length; i++){
                    sceneOptions += "<option value=" + data[i] + ">" + data[i] + "</option>";
                }
                sceneSelect.innerHTML = sceneOptions;
            });
            scenesDiv.style.display = "block";
        }
        formBtn.style.display = "block";
    });

    formBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        let character = charSelect.value? charSelect.value:"None";
        let act = actSelect.value? actSelect.value:"None";
        let scene = sceneSelect.value? sceneSelect.value:"None";
        let numKeys = numKeywords.value; 

        if(character == "None" || numKeys < 1){
            errText = ""
            if(character == "None"){
                errText = "Please select a character. \r \n"
            }
            if(numKeys < 1){
                errText += "Please make sure number of top keywords you'd like to see is above 1.\n" +
                                    "(If your number is greater than the amount of keywords, all keywords will be given)";
            }
            outputBox.innerHTML = errText;
        }else{
            outputBox.innerText = "Getting Keywords ..."
            await fetch(`/getkeywords/${character}&${act}&${scene}&${numKeys}`)
            .then(response => response.json())
            .then(data => {
                let listHtmlString = ""
                for(let i = 0; i < data.length; i++){
                    listHtmlString += (i+1) + ". "+ data[i][0] + ", " + data[i][1] + "\n";
                }
                outputBox.innerHTML = listHtmlString;
            }).catch(err => {
                outputBox.innerText = "Sorry, something went wrong..."
            });
        }
    })


})