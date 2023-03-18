window.addEventListener("DOMContentLoaded", ()=>{

    let charSelect = document.getElementById("characters");

    let actsDiv = document.getElementById("acts");
    let actSelect = document.getElementById("act-select");

    let scenesDiv = document.getElementById("scenes");
    let sceneSelect = document.getElementById("scene-select");

    let numKeywords = document.getElementById("numkeys-select");

    let form = document.getElementById("keyword-form");
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
                let acts = data["acts"];
                let actOptions = "<option value=''>All</option>";
                for(let i = 0; i < acts.length; i++){
                    actOptions += "<option value=" + acts[i] + ">" + acts[i] + "</option>";
                }
                actSelect.innerHTML = actOptions;
                actsDiv.style.display = "block";
            }).catch(err => {
                console.error(err);
                resetForm();
                outputBox.innerText = "Sorry, something went wrong..."
            });
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
                let scenes = data["scenes"];
                let sceneOptions = "<option value=''>All</option>";
                for(let i = 0; i < scenes.length; i++){
                    sceneOptions += "<option value=" + scenes[i] + ">" + scenes[i] + "</option>";
                }
                sceneSelect.innerHTML = sceneOptions;
                scenesDiv.style.display = "block";
            }).catch(err => {
                console.error(err);
                resetForm();
                outputBox.innerText = "Sorry, something went wrong..."
            });
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
                let keywords = data["keywords"];
                let listHtmlString = ""
                for(let i = 0; i < keywords.length; i++){
                    listHtmlString += (i+1) + ". "+ keywords[i][0] + ", " + keywords[i][1] + "\n";
                }
                outputBox.innerHTML = listHtmlString;
            }).catch(err => {
                console.error(err);
                resetForm();
                outputBox.innerText = "Sorry, something went wrong..."
            });
        }
    })

    function resetForm(){
        form.reset();
        actSelect.innerHTML = "";
        sceneSelect.innerHTML = "";
        actsDiv.style.display = "none";
        scenesDiv.style.display = "none";
    }

})