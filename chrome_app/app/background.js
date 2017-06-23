
/* Put your own server address here */
function App(){
  this.saveVideoURL = "https://youtubehistory-theaviddeveloper.rhcloud.com/pillfinder/api/v1.0/youtube";
  this.getVideosURL = "https://youtubehistory-theaviddeveloper.rhcloud.com/pillfinder/api/v1.0/youtubehistory";
}
var app = new App();

/** We create an event listener on all of the anchor tags.
We force a full page load by doing a window.location
This will ensure that our app is ran
**/

var anchors = document.getElementsByTagName("a");
for (var i = 0; i < anchors.length ; i++) {
  anchors[i].addEventListener("click",
  function (event) {
    event.preventDefault();
    window.location = this.href;
  },
  false);
}


//we run the saveVideo
saveVideo(document.location.href, app.saveVideoURL, app.getVideosURL);

function saveVideo(currentURL, saveVideoURL, getVideosURL){
  var url = severAddress;

  var l = getLocation(currentURL);
  var pathname = l.pathname;

  if(pathname === "/watch"){
    var params = urlParams("v", currentURL);
    var data = JSON.stringify({url: currentURL, video: params});

    postJSON(url, data);
  }else{

    // get all of the videos on the page and put them in an array
    var anchorTag = document.getElementsByTagName("a");
    var videoArray = [];
    //var url = window.location.href;

    // if you do an inspect element on any video you will see that the anchor tag and image
    // contain the same URL. We only want one video so we make sure that we only add one video ID
    for(var i = 0; i < anchorTag.length; i++){
      if(anchorTag[i].pathname === "/watch"){
        var title = '';
        if(document.getElementById('eow-title')){
          title = document.getElementById('eow-title');
        }
        var obj = { url: anchorTag[i].href, videoID: urlParams("v", anchorTag[i].href), videoTitle: title };
        // add one video ID
        if(!containsObj(obj, videoArray)){
          videoArray.push(obj);
        }
      }
    }
    var url = getVideosURL;
    var obj = JSON.stringify({videos: videoArray});
    postJSON(url, obj, markVideoWatch);

  }

}




function markVideoWatch(arry){
  console.log(arry);
  var tempArry = [];
  arry.forEach(function(v){
    tempArry.push(v.videoID)
  });

  //we mark the all of the videos as watched on the page
  var myVar = document.getElementsByTagName("a");
  for(var i = 0; i < myVar.length; i++){
    if(myVar[i].pathname === "/watch"){
      var videoID = urlParams("v", myVar[i].href);
      if(tempArry.indexOf(videoID)){
        var span = myVar[i].getElementsByTagName("span")[0];
        if(span){
          span.style.cssText = "opacity: 0.2;";

          var temp = document.createElement("span");
          temp.innerHTML = "Watched";
          temp.style.cssText = "z-index: 9999999; width: 100%; color: black;position: relative;    bottom: 32px; left: 137px;font-size: 14px;";
          myVar[i].appendChild(temp);
        }

      }
    }
  }
}


function getLocation(href) {
  var l = document.createElement("a");
  l.href = href;
  return l;
}


function  urlParams( name, url ) {
  if (!url) url = location.href;
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  return results == null ? null : results[1];
}

/* function used to see if an item is in an object */
function containsObj(obj, list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].url === obj.url) {
      return true;
    }
  }
  return false;
}

/* postJSON same thing as $.post but I don't need jQuery to do this */
function postJSON(url, params, callback){
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("post", url, true);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      console.log(status);
      if (status == 200) {
        callback(xhr.response);
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send(params);
  });
}
