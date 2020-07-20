var response = "";
var bausteps = [];
var bauexcps  = [];
var bauprogs  = [];
var baucpus=[];
var bauexectime=[];
var baustart='';
var bauend='';
var baucpu_chart = [];
var bauexcp_chart = [];
var bausteps_chart = [];


var prjsteps = [];
var prjexcps  = [];
var prjrogs  = [];
var prjcpus=[];
var prjexectime=[];
var prjstart='';
var prjend='';
var prjcpu_chart = [];
var prjexcp_chart = [];

var missingstepsbau = [];
var missingstepsprj = [];

var excpcharttype = "";
var cpucharttype = "";

async function pythonlink(bau,prj){
  initialize();
  let rs = await eel.mainprocess(bau,prj)();
  response = rs;

  if (response == '00' || response == '-4' || response == '-5'){
    let temp = await eel.getSteps("bau")();
    bausteps = temp;
    let temp1 = await eel.getExcps("bau")();
    bauexcps = temp1;
    let temp2 = await eel.getProgs("bau")();
    bauprogs = temp2;
    let temp3 = await eel.getCpus("bau")();
    baucpus = temp3;
    let temp4 = await eel.getExecTimes("bau")();
    bauexectime = temp4;

    let temp5 = await eel.getCpuChart("bau")();
    baucpu_chart = temp5;
    let temp6 = await eel.getExcpChart("bau")();
    bauexcp_chart = temp6;


    let temp7 = await eel.getSteps("prj")();
    prjsteps = temp7;
    let temp8 = await eel.getExcps("prj")();
    prjexcps = temp8;
    let temp9 = await eel.getProgs("prj")();
    prjprogs = temp9;
    let temp10 = await eel.getCpus("prj")();
    prjcpus = temp10;
    let temp11 = await eel.getExecTimes("prj")();
    prjexectime = temp11;
    let temp12 = await eel.getCpuChart("prj")();
    prjcpu_chart = temp12;
    let temp13 = await eel.getExcpChart("prj")();
    prjexcp_chart = temp13;

    let temp14 = await eel.getStepChart()();
    bausteps_chart = temp14;

    let temp15 = await eel.comparestepsbau()();
    missingstepsbau = temp15;

    let temp16 = await eel.comparestepsprj()();
    missingstepsprj = temp16;

    display();

    if (response == '-4'){
      $('#message').html('<div class="alert alert-warning fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>PRJ steps > BAU steps.</div>');
      $("#resultsdiv").show();
      $(".loading-icon").addClass("hide");
      $(".button").attr("disabled", false);
      $(".btn-txt").text("ANALYSE JOBLOGS");
    }
    if (response == '-5'){
      $('#message').html('<div class="alert alert-warning fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>PRJ steps < BAU steps</div>');
      $("#resultsdiv").show();
      $(".loading-icon").addClass("hide");
      $(".button").attr("disabled", false);
      $(".btn-txt").text("ANALYSE JOBLOGS");
    }

  }
  else if (response == '-1') {
    $('#message').html('<div class="alert alert-danger fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>Input files may be empty. Please reset and check.</div>');
    $("#resultsdiv").hide();
    $(".loading-icon").addClass("hide");
    $(".button").attr("disabled", false);
    $(".btn-txt").text("ANALYSE JOBLOGS");
  }
  else if (response == '-2') {
    $('#message').html('<div class="alert alert-danger fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>No job steps found in BAU.<br>Please check input file.</div>');
    $("#resultsdiv").hide();
    $(".loading-icon").addClass("hide");
    $(".button").attr("disabled", false);
    $(".btn-txt").text("ANALYSE JOBLOGS");
  }
  else if (response == '-3') {
    $('#message').html('<div class="alert alert-danger fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>No job steps found in PRJ.<br>Please check input.</div>');
    $("#resultsdiv").hide();
    $(".loading-icon").addClass("hide");
    $(".button").attr("disabled", false);
    $(".btn-txt").text("ANALYSE JOBLOGS");
  }
  else {
    $('#message').html('<div class="alert alert-danger fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>Error processing file in Python.<br> Please contact Arjun.</div>');
    $("#resultsdiv").hide();
    $(".loading-icon").addClass("hide");
    $(".button").attr("disabled", false);
    $(".btn-txt").text("ANALYSE JOBLOGS");
  }

}

function initialize(){
   response = "";
   bausteps = [];
   bauexcps  = [];
   bauprogs  = [];
   baucpus=[];
   bauexectime=[];
   baustart='';
   bauend='';

   prjsteps = [];
   prjexcps  = [];
   prjrogs  = [];
   prjcpus=[];
   prjexectime=[];
   prjstart='';
   prjend='';
}

function display(){

  addBauTable();
  addPrjTable();

  $(".loading-icon").addClass("hide");
  $(".button").attr("disabled", false);
  $(".btn-txt").text("ANALYSE JOBLOGS");
  $('#message').html('<div class="alert alert-info fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>Analysis completed.</div>');
  window.location.href='#comparison';
  $("#resultsdiv").show();
  showMissing();

  setTimeout(function(){
    showCPUComparison("line");
    showEXCPComparison("line");
  }, 500);


}

function showMissing() {
  var msginfo1 = '';
  var msginfo2 = '';
  for (var i = 0; i < missingstepsbau.length ; i++) {
      msginfo1 += missingstepsbau[i] + "<br>";
  };

  for (var i=0; i < missingstepsprj.length ; i++){
      msginfo2 += missingstepsprj[i] + "<br>";
  };

  if (missingstepsbau.length > 0){
    $('#missing1').html('<div class="alert alert-warning fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>' + msginfo1 + '</div>');
  };

  if (missingstepsprj.length > 0){
    $('#missing2').html('<div class="alert alert-info fade in"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button>' + msginfo2 + '</div>');
  };
}

Chart.defaults.global.animationSteps = 50;
Chart.defaults.global.tooltipYPadding = 16;
Chart.defaults.global.tooltipCornerRadius = 0;
Chart.defaults.global.tooltipTitleFontStyle = "normal";
Chart.defaults.global.tooltipFillColor = "rgba(0,160,0,0.8)";
Chart.defaults.global.animationEasing = "easeOutBounce";
Chart.defaults.global.responsive = true;
Chart.defaults.global.scaleLineColor = "black";
Chart.defaults.global.scaleFontSize = 16;

function showCPUComparison(typei){
  cpucharttype = typei;
  window.cpuchart =  new Chart(document.getElementById("cpu-chart"), {
      responsive: true,
      type: cpucharttype,
      data: {
        labels: bausteps_chart,
        datasets: [{
            data: baucpu_chart,
            label: "BAU",
            borderColor: "#3e95cd",
            backgroundColor: "#3e95cd",
            fill: false
          }, {
            data: prjcpu_chart,
            label: "PRJ",
            borderColor: "#8e5ea2",
            backgroundColor: "#8e5ea2",
            fill: false
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'CPU/IO COMPARISON'
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'CPU/IO Count'
            },
            ticks: {
                  beginAtZero: true
            }
          }]
        }
      }
    });
  }

function showEXCPComparison(typei){
  excpcharttype = typei;
  window.excpchart = new Chart(document.getElementById("excp-chart"), {
    responsive: true,
    type: excpcharttype,
    data: {
      labels: bausteps_chart,
      datasets: [{
          data: bauexcp_chart,
          label: "BAU",
          borderColor: "#3e95cd",
          backgroundColor: "#3e95cd",
          fill: false
        }, {
          data: prjexcp_chart,
          label: "PRJ",
          borderColor: "#8e5ea2",
          backgroundColor: "#8e5ea2",
          fill: false
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'EXCP COMPARISON'
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'EXCP Count'
          },
          ticks: {
                beginAtZero: true
          }
        }]
      }
    }
  });
}


//clear steps table in event of refresh or resubmission
function cleartable(table){
  const tableObject = document.getElementById(table);
  const rowCount = tableObject.tBodies[0].rows.length;
  if (rowCount > 0){
    for (var i=0; i<=rowCount; i++){
      tableObject.deleteRow(0);
    }
  }
}

//add steps details by appending rows
function addBauTable(){
  cleartable("bautable");
  $('#bauhead').append("<tr><th>STEP</th><th>PROGRAM</th><th>CPU</th><th>EXCP</th><th>TIME</th></tr>");
  for (var i = 0; i < bausteps.length ; i++) {
            newrow = '<tr><th>' + bausteps[i] + '</th><td>' + bauprogs[i] + '</td><td>' + baucpus[i] + '</td><td>' + bauexcps[i] + '</td><td>' + bauexectime[i] + '</td></tr>';
            $('#bau_tbody').append(newrow)
        }

}


function addPrjTable(){
  cleartable("prjtable");
  $('#prjhead').append("<tr><th>STEP</th><th>PROGRAM</th><th>CPU</th><th>EXCP</th><th>TIME</th></tr>");
  for (var i = 0; i < prjsteps.length ; i++) {
            newrow = '<tr><th>' + prjsteps[i] + '</th><td>' + prjprogs[i] + '</td><td>' + prjcpus[i] + '</td><td>' + prjexcps[i] + '</td><td>' + prjexectime[i] + '</td></tr>';
            $('#prj_tbody').append(newrow)

        }

}

var inView = false;

function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemTop <= docViewBottom) && (elemBottom >= docViewTop));
}

$(window).scroll(function() {
    if (isScrolledIntoView('#excp-chart')) {
        if (inView) { return; }
        inView = true;
        excpchart.destroy();
        showEXCPComparison(excpcharttype);
    } else {
        inView = false;
    }
});

$(window).scroll(function() {
    if (isScrolledIntoView('#cpu-chart')) {
        if (inView) { return; }
        inView = true;
        cpuchart.destroy();
        showCPUComparison(cpucharttype);
    } else {
        inView = false;
    }
});

var bauFileInput =[""];
var prjFileInput =[""];
Dropzone.options.bauUpload = {
    paramName: "baufile",
    maxFiles: 1,
    acceptedFiles: ".txt",
    autoProcessQueue: false,
    init: function() {
      this.on("addedfile", function(file) {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(progressEvent){
          // Entire file
      //    console.log(this.result);

          // By lines
          var lines = this.result.split('\n');
          for(var line = 0; line < lines.length; line++){
        //    console.log(lines[line]);
            bauFileInput.push(lines[line]);
          }
        };
        reader.readAsText(file);

          var removeButton = Dropzone.createElement("<button>Remove file</button>");

          var _this = this;

          // Listen to the click event
          removeButton.addEventListener("click", function(e) {
            // Make sure the button click doesn't submit the form:
            e.preventDefault();
            e.stopPropagation();

            // Remove the file preview.
            _this.removeFile(file);
            bauFileInput=[""];
          });
          file.previewElement.appendChild(removeButton);
          });

    }
};
Dropzone.options.prjUpload = {
    paramName: "prjfile",
    maxFiles: 1,
    acceptedFiles: ".txt",
    autoProcessQueue: false,
    init: function() {
      this.on("addedfile", function(file) {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(progressEvent){
          // Entire file
      //    console.log(this.result);

          // By lines
          var lines = this.result.split('\n');
          for(var line = 0; line < lines.length; line++){
          //  console.log(lines[line]);
            prjFileInput.push(lines[line]);
          }
        };
        reader.readAsText(file);

          var removeButton = Dropzone.createElement("<button>Remove file</button>");

          var _this = this;

          // Listen to the click event
          removeButton.addEventListener("click", function(e) {
            // Make sure the button click doesn't submit the form:
            e.preventDefault();
            e.stopPropagation();

            // Remove the file preview.
            _this.removeFile(file);
            prjFileInput=[""];
            // If you want to the delete the file on the server as well,
            // you can do the AJAX request here.
          });
          file.previewElement.appendChild(removeButton);
        });
    }
};
