let tablaLeastEngaged = document.getElementById("tablaLeastEngaged");
let tablaMostEngaged = document.getElementById("tablaMostEngaged");
const senatorsTable = document.getElementById("senatorsTable");
const totalMembers = document.getElementById("totalMembers");
const stateSelect = document.getElementById("stateSelect");
const houseTable = document.getElementById("houseTable");
const partidos = document.getElementsByName("party");
const readMore = document.getElementById("readMore");
let selectedState = "showAll";
let partidosElegidos = [];
let statistics= {}
let members = null;
let table = "";

if (houseTable || document.title.includes("House Members Attendance") || document.title.includes("House Members Party Loyalty")) {
  fecheoDatos("house")
} else if (senatorsTable || document.title.includes("Senate Members Party Loyalty") || document.title.includes("Senate Members Attendance")){
  fecheoDatos("senate")
}else if (readMore) {
  myScript() 
}

function fecheoDatos(memberType){
fetch(`https://api.propublica.org/congress/v1/113/${memberType}/members.json`, {
  headers: {
    "X-API-Key": "8K7j0tytqrHhWAAqAVYxMvd3lvt1Z8sOXfkv2i69"
  }
})
.then(resp =>resp.json())
.then(data =>myScript(data))
.catch(error => console.log(error))
}

function myScript(data){

  if(houseTable) {
    table = houseTable
    members = data.results[0].members;
    tablasMiembros()
  }else if (senatorsTable) {
    table = senatorsTable
    members = data.results[0].members;
    tablasMiembros()
  }else if (readMore) { 
    botonReadMore()  
  }else if (tablaLeastEngaged || tablaMostLoyal ) {
    members = data.results[0].members;
    statisticsCalcule()   
    tablaChica()  
    imprimirTablaEstadisticas()   
  }

function botonReadMore(){    
      readMore.innerHTML= `
      <a class="btn text-decoration-underline p- 0 m-0 text-primary" data-bs-toggle="collapse" href="#collapse" role="button" aria-controls="collapse">Read More</a>`;
      let buttonClass = readMore.classList;
      readMore.addEventListener("click",(change)=>{
        let result = buttonClass.toggle("c");     
        if (buttonClass.value =="c") {
          readMore.innerHTML = `
        <a class="btn text-decoration-underline m-2 text-primary" data-bs-toggle="collapse" href="#collapse" role="button"   aria-controls="collapse" value="1">Read Less</a>`;
        } else {
          readMore.innerHTML= `
      <a class="btn text-decoration-underline m-2 text-primary" data-bs-toggle="collapse" href="#collapse" role="button" aria-controls="collapse">Read More</a>`;
        }
  })  
}

function tablasMiembros() {  

function dibujarTablaMiembros(array,table) {
  table.innerHTML = "";
  array.forEach((member) => {
    const fullname = `${member.last_name}, ${member.first_name} ${
      member.middle_name || ""}`;
    table.innerHTML += `
          <tr>
            <td> <a href="${member.url}" class="fw-bold"> ${fullname}</a></td>
            <td>${member.party}</td>
            <td>${member.state}</td>
            <td>${member.seniority}</td>
            <td>${member.votes_with_party_pct.toFixed(2)} %</td>
          </tr>`;
  });
}

function filtrarForm() {
let estados = [];
let estadosRepetidos = members.map((miembro) => miembro.state);

for (let i = 0; i < estadosRepetidos.length; i++) {
  if (!estados.includes(estadosRepetidos[i])) {
    estados.push(estadosRepetidos[i]);
  }}
estados.sort();

estados.forEach((state) => {
  stateSelect.innerHTML += `
        <option value= ${state}>${state}</option> `;
      });

stateSelect.addEventListener("change", (event) => {
  selectedState = stateSelect.value;
  const filtradosState = members.filter(function (member) {
      return (member.state == stateSelect.value || selectedState == "showAll") &&(partidosElegidos.length == 0 || partidosElegidos.indexOf(member.party) != -1 )
    });
    dibujarTablaMiembros(filtradosState, table);
  }
);

for (let i = 0; i < partidos.length; i++) {
  partidos[i].addEventListener("change", function () {
    partidosElegidos = [];
    for (let index = 0; index < partidos.length; index++) {
      if (partidos[index].checked) {
        partidosElegidos.push(partidos[index].value);
      }}
    const partidosFiltrados = members.filter(function (member) {
      return ( 
        (partidosElegidos.length == 0 || partidosElegidos.indexOf(member.party) != -1) &&(member.state == selectedState || selectedState == "showAll")
      );
    });
    dibujarTablaMiembros(partidosFiltrados,table);
  });
}
}
dibujarTablaMiembros(members,table);
filtrarForm()
}

function statisticsCalcule(){
      statistics={} 
      democrats = []
      republicans = []
      independents = []

      for (let i = 0; i < members.length; i++) {
        if ("D" === members[i].party) {
          democrats.push(members[i])    
        } else if ("R" === members[i].party) {
          republicans.push(members[i])     
        } else {
          independents.push(members[i])     
        } 
      }         
      statistics.democrats = democrats.length
      statistics.republicans = republicans.length
      statistics.independents = independents.length
      statistics.totalMembers = members.length

      vwpDemocrats = 0
      vwpRepublicans = 0
      vwpIndependents = 0
      vwpTotal = 0

      for (let i = 0; i < democrats.length; i++) {
        vwpDemocrats = democrats[i].votes_with_party_pct + vwpDemocrats
      }
      statistics.vwpDemocrats = vwpDemocrats / democrats.length

      for (let i = 0; i < republicans.length; i++) {
        vwpRepublicans = republicans[i].votes_with_party_pct + vwpRepublicans
      }
      statistics.vwpRepublicans = vwpRepublicans / republicans.length

      for (let i = 0; i < independents.length; i++) {
        vwpIndependents = independents[i].votes_with_party_pct + vwpIndependents
      }
      statistics.vwpIndependents = vwpIndependents / independents.length

      for (let i = 0; i < members.length; i++) {
        vwpTotal = members[i].votes_with_party_pct + vwpTotal
      }
      statistics.vwpTotal = vwpTotal / members.length

      if (vwpIndependents > 0) {
        statistics.vwpIndependents = statistics.vwpIndependents.toFixed(2)
      } else {
        statistics.vwpIndependents = 0
      }

  statistics.withoutCeroVotes = members.filter((member) => member.total_votes)
  statistics.leastEngaged = statistics.withoutCeroVotes.sort((a,b) =>  (b.missed_votes_pct) -(a.missed_votes_pct)).slice(0,Math.round(members.length * 0.10));
  statistics.mostEngaged = statistics.withoutCeroVotes.sort((a,b) =>  (a.missed_votes_pct)- (b.missed_votes_pct)).slice(0,Math.round(members.length * 0.10));  
  statistics.leastLoyal = statistics.withoutCeroVotes.sort((a,b) => a.votes_with_party_pct -b.votes_with_party_pct ).slice(0,Math.round(members.length * 0.10));
  statistics.mostLoyal = statistics.withoutCeroVotes.sort((a,b) =>  b.votes_with_party_pct - a.votes_with_party_pct).slice(0,Math.round(members.length * 0.10));
}

function tablaChica() {
    totalMembers.innerHTML = 
    `<tr>
        <td>Democrats</td>
        <td>${statistics.democrats}</td>
        <td>${statistics.vwpDemocrats.toFixed(2)} %</td>
      </tr>
      <tr>
        <td>Republicans</td>
        <td>${statistics.republicans}</td>
        <td>${statistics.vwpRepublicans.toFixed(2)} %</td>
      </tr>
      <tr>
        <td>Independents</td>
        <td>${statistics.independents}</td>
        <td>${statistics.vwpIndependents || "0.00"} %</td>
      </tr>
      <tr>
        <td>Total</td>
        <td>${statistics.totalMembers}</td>
        <td>${statistics.vwpTotal.toFixed(2)} %</td>
      </tr>`;      
};

function imprimirTablaEstadisticas(){
        function tablaEstadisticas(array,tabla,dato1,dato2) {
                  array.forEach((member) => {
                  const fullname = `${member.last_name}, ${member.first_name} ${
                    member.middle_name || ""}`;
                  tabla.innerHTML += 
                  `<tr>
                      <td class="fw-bold"> <a href="${member.url}"target="_blank" > ${fullname}</a></td>
                      <td>${(((member[dato1]) * (member[dato2])) / 100).toFixed(0)}</td>
                      <td>${member[dato1]} %</td>
                    </tr>`;
                });
        }        
        if (tablaLeastEngaged) {
          tablaEstadisticas(statistics.leastEngaged, tablaLeastEngaged,"missed_votes_pct", "total_votes" )
          tablaEstadisticas(statistics.mostEngaged, tablaMostEngaged,"missed_votes_pct", "total_votes") 
        }else {
          tablaEstadisticas(statistics.mostLoyal, tablaMostLoyal, "votes_with_party_pct", "total_votes")
          tablaEstadisticas(statistics.leastLoyal, tablaLeastLoyal,"votes_with_party_pct", "total_votes")
        }}
}
