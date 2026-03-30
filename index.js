

const supabasePublicClient = supabase.createClient("https://uovmgtrbycdcwtqvsbbd.supabase.co", "sb_publishable_UpT-XZ4DVugyyqcXmXhULw_cMX-hchw", {
            db: {
                schema: "public"
            }
        });

      

function ViewChoice() {
  var x = document.getElementById("myDIV");
  var y = document.getElementById("myDIVNOT");
  var z = document.getElementsByClassName("program-button");
  if (x.style.display === "none" && y.style.display === "block") {
    x.style.display = "block";
    y.style.display = "none";
    for (let i = 0; i < z.length; i++) {
      z[i].style.display = "none";
    }

    } else {
      x.style.display = "none";
      y.style.display = "block";
      // Loop through all program buttons and show them
      for (let i = 0; i < z.length; i++) {
        z[i].style.display = "block";

  }
}}


async function UniChoice("this.id") {
    const Back = document.getElementById("myDIVNOT");
    const Choice = document.getElementbyId("this.id").textContent.trim();
    console.log(Choice)
    const getRequestResponse = await supabasePublicClient.from("program_list").select(School[i])
    console.log(getRequestResponse)
    
    let k = 1;
    let body = document.getElementsByClassName("Content")[0];

    for (let k = 0; k < getRequestResponse.data.length; k++) {
      let value = getRequestResponse.data[i][Choice];
      if (value === "NA"){
        continue;
      }
      let button = document.createElement("button");
      button.innerHTML = getRequestResponse.data[k][Choice];
      body.appendChild(button);
      button.setAttribute("onClick", "OutputChoice(this.id)");
      button.classList.add("program-button");
      button.style.display = "block"; 
      button.id = "program-button-" + k;
  
   
  };
}


