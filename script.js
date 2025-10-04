// https://api.themoviedb.org/3/search/movie?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&query=john%20wick
const NavLink = document.querySelectorAll(".item-link");
const SearchBox = document.querySelector(".searchBox");
const Results = document.querySelector(".results");
const Add = document.querySelector(".add");
const heading = document.querySelector(".AppHeading");
let watchListData = JSON.parse(localStorage.getItem("WatchData"));
let watchListId = [];
let CurrentShowId = [];
let attriute = 1;
let temp = true;//show the first page is of all show only in the screen value getting change while the add more button cliks
let pageNum = 1;
let delay = 1000;
let popupOpen = false;

function searchPlaceHolder() {
    if (attriute == 1) {
        SearchBox.placeholder = "Search Movie...";
    }
    else if (attriute == 2) {
        SearchBox.placeholder = "Search Tv Show...";
    }
    else {
        SearchBox.placeholder = "Search whatchList show...";
    }
}

function loader() {
    let loaderElement = document.createElement("div");
    loaderElement.className = "loader center-grid";

    if(!document.querySelector("div.loader")){
        Results.appendChild(loaderElement);
    }
    else{
        document.querySelector("div.loader").remove();
    }
}

function WatchListEvent(element, show) {
    element.addEventListener("click", (e) => {
        e.stopPropagation();
        let ShowObj = {
            id: show.id,
            poster_path: show.poster_path,
            title: show.hasOwnProperty("title") ? show.title : show.name,
            backdrop_path: show.backdrop_path,
            overview: show.overview,
            release_date: show.hasOwnProperty("release_date") ? show.release_date : show.first_air_date,
            vote_average: show.vote_average,
            type: (attriute == 1) ? "movie" : "tv"
        };

        if (!watchListId.includes(ShowObj.id)) {//adds the show in localstorage
            watchListData.push(ShowObj);
            watchListId.push(ShowObj.id);
        }
        else {//remove the show form localstorage
            watchListId = watchListId.filter((id) => id != ShowObj.id);
            watchListData = watchListData.filter((obj) => obj.id != ShowObj.id);
        }
        console.log(watchListData);
        console.log(watchListId);
        localStorage.setItem("WatchData", JSON.stringify(watchListData));
    });
}

function displayShow(shows) {
    loader();

    if (shows == "") {
        let errMsg = document.createElement("h2");
        errMsg.className = "errMsg";
        errMsg.innerText = "show not found";
        Results.appendChild(errMsg);
        return;
    }

    shows.forEach(show => {
        if (show.poster_path != null && !CurrentShowId.includes(show.id)) {
            if (temp) CurrentShowId.push(show.id); // prevents the show repitation
            let ResultBox = document.createElement("div");
            let ThimbnailImg = document.createElement("img");
            let showinfo = document.createElement("div");
            let showTitle = document.createElement("h4");
            let checkBox = document.createElement("input");

            ResultBox.className = "resultBox";
            ThimbnailImg.className = "thumbImg";
            showinfo.className = "showInfo PosAbs";
            showTitle.className = "MTitle";
            checkBox.className = "watchList";

            checkBox.type = "checkbox";
            ThimbnailImg.src = `https://image.tmdb.org/t/p/original/${show.poster_path}`;
            showTitle.innerText = (show.hasOwnProperty("title")) ? show.title : show.name;
            ThimbnailImg.alt = showTitle.innerText;

            if (watchListId.includes(show.id)) {
                checkBox.checked = true;
            }

            showinfo.addEventListener("click", () => {
                ShowPopup(show);
            });

            WatchListEvent(checkBox, show);

            showinfo.appendChild(checkBox);
            showinfo.appendChild(showTitle);

            ResultBox.appendChild(ThimbnailImg);
            ResultBox.appendChild(showinfo);

            Results.appendChild(ResultBox);
        }
    });
    console.log(CurrentShowId);

    Add.style.display = (attriute < 3 && document.activeElement !== SearchBox) ? "block" : "none";
}

async function timeDuration(id,type) {
    let url = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9`);
    if(!url.ok) throw new Error("Time Duration is not found");
    let data = await url.json();
    return data.runtime;
}

async function ShowPopup(show) {
    let popElement = document.createElement("div");
    let type = "";
    let runtime;
    
    popElement.className = "ShowPopup";

    if(show.type){
        type = show.type;
    }
    else{
        type = (attriute == 1) ? "movie" : "tv";
    }

    let data = await getYouTubeLink(`https://api.themoviedb.org/3/${type}/${show.id}/videos?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9`);
    if(type == "movie") runtime = await timeDuration(show.id,type);

    try{
        setTimeout(() => {
            popElement.innerHTML = `
                <button class="backBtn PosAbs">←</button>
                <input class="popupcheck" type="checkbox">
                <div class="imgBox">
                    <img src="https://image.tmdb.org/t/p/original${show.backdrop_path}" alt="" class="ImgPop">
                </div>
                <div class="PopText">
                    <h1 class="Showtitle">${(show.hasOwnProperty("title")) ? show.title : show.name}</h1>
                    <iframe 
                        src="https://www.youtube.com/embed/${data}" 
                        class="youVedio"
                        allow="autoplay; encrypted-media" allowfullscreen>
                    </iframe>
                    <p class="des">${show.overview}</p>
                    <p class="info">
                        <span>Realease Date : ${show.hasOwnProperty("release_date") ? show.release_date : show.first_air_date}</span> |
                        <span>Avrage Ratting : ${show.vote_average} / 10</span>
                    </p>
                </div>
            `;
        
            if(!popupOpen){
                document.querySelector(".main").appendChild(popElement);
                if(type == "movie"){
                    document.querySelector(".info").innerHTML += ` | <span>Time Duration : ${runtime}</span>`;
                }
                popupOpen = true;
            };
            WatchListEvent(document.querySelector(".popupcheck"), show);   
        
            if (watchListId.includes(show.id)) {
                document.querySelector(".popupcheck").checked = true;
            }
        
            document.querySelector(".backBtn").addEventListener("click", () => {
                console.log("back btn is clicked");
                setTimeout(() => popElement.remove(),delay/6);
                popupOpen = false;
            });
        },delay/4);
    }
    catch(err){
        console.log(err)
    }; 
}

async function getYouTubeLink(url) {
    let maindata = await fetch(url);
    let data = await maindata.json();
    let trailer;

    if(data.results.length == 1){
        trailer = data.results[0];
    }
    else{
        trailer = data.results.findLast(TR => 
            TR.site === "YouTube" && 
            TR.type === "Trailer" && 
            TR.official === true && 
            (   
                TR.name.toLowerCase().includes("official trailer") || 
                TR.name.toLowerCase().includes("series trailer") || 
                TR.name.toLowerCase().includes("launch trailer") || 
                TR.name.toLowerCase().includes("success trailer") ||
                TR.name.toLowerCase().includes("trailer")  
            )
        );
    }

    return trailer ? trailer.key : null;
}

async function SearchLoadshow(url) {
    const maindata = await fetch(url);
    const data = await maindata.json();
    loader();
    setTimeout(() => {
        displayShow(data.results);
    }, delay);
}

async function LoadShow(url) {
    const shows = await fetch(url);
    const data = await shows.json();
    loader();
    setTimeout(() => {
        displayShow(data.results);
    }, delay);
}

window.addEventListener("load", () => {
    LoadShow(`https://api.themoviedb.org/3/movie/popular?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&page=${pageNum}`);
    Add.style.display = "none";

    if (!localStorage.getItem("WatchData")) {
        localStorage.setItem("WatchData", JSON.stringify([]));
    }

    if (watchListData != []) {
        watchListId = watchListData.map((obj) => {
            return obj.id;
        });
    }
});

SearchBox.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        CurrentShowId = [];
        Results.innerHTML = "";
        Add.style.display = "none";
        let TempShow = [];
        
        if (attriute == 1) {
            SearchLoadshow(`https://api.themoviedb.org/3/search/movie?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&query=${e.target.value}`);
        }
        else if (attriute == 2) {
            SearchLoadshow(`https://api.themoviedb.org/3/search/tv?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&query=${e.target.value}`);
        }
        else {
            watchListData.forEach((WatchShow) => {
                if (WatchShow.title.toLowerCase().includes(e.target.value.toLowerCase())) {
                    console.log(WatchShow.title);
                    TempShow.push(WatchShow);
                }
            });
            
            loader();
            setTimeout(() => displayShow(TempShow), delay);
        }
    }
});

NavLink.forEach((link) => {
    link.addEventListener("click", (e) => {
        pageNum = 1;
        Results.innerHTML = "";
        CurrentShowId = [];
        temp = true;
        
        NavLink.forEach(lb => {
            lb.classList.remove("active");
        });
        e.target.classList.add("active");
        Add.style.display = "none";

        attriute = e.target.getAttribute("data-num");
        searchPlaceHolder();
        SearchBox.value = "";
        console.log(attriute);

        if (attriute == 1) {
            LoadShow(`https://api.themoviedb.org/3/movie/popular?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&page=${pageNum}`);
        }
        else if (attriute == 2) {
            LoadShow(`https://api.themoviedb.org/3/tv/popular?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&page=${pageNum}`);
        }
        else {
            loader();
            setTimeout(() => displayShow(watchListData), delay);
        }
    });
});

Add.addEventListener("click", () => {
    // console.log("add btn is clicked");
    // console.log(pageNum);
    if (attriute == 1) {
        LoadShow(`https://api.themoviedb.org/3/movie/top_rated?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&page=${pageNum}`);
    }
    else if (attriute == 2) {
        LoadShow(`https://api.themoviedb.org/3/tv/top_rated?api_key=e07429ff1ac4352ccfaf1cd8f99d1ef9&page=${pageNum}`);
    }
    temp = false;
    pageNum++;
});

heading.addEventListener("click", () => {
    console.log("name is clicked");
    location.reload();
});