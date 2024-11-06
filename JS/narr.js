let narratives = []
let items = []

let currentNarrativeArr = []
let narrativeTitle = ""
let currentIdx = 0
let textState = 0
let rotation = 0
let narrImages

const nextButton = document.getElementById("next-button");
const backButton = document.getElementById("back-button");
const altNarrative = document.getElementById("alt-narr");
const artworksList = document.getElementById("artwork-list");
const smallImagecontainer = document.getElementById("side-image");
const mainImage = document.getElementById('artwork-img');
const sideImage = document.getElementById('artwork-img-2');
const textButtons = document.getElementById("button-container");
const lessButton = document.getElementById("less-button");
const moreButton = document.getElementById("more-button");
const text = document.getElementById("info-text");
const table = document.getElementById("info-box");
const arrowSvg = document.querySelector(".scroll-button > svg")
const spinner = document.getElementById('loading-spinner');

const setImage = async () => {mainImage.src = sideImage.src = narrImages[currentIdx].src};
const showLoading = async () => {spinner.classList.remove("hide-loading");}

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetch('data/narr.json').then(response => response.json());
    items = data.items;
    narratives = data.narratives;
    if (window.location.href.includes("?")) {
        const urlObj = new URLSearchParams(window.location.search);
        narrativeTitle = urlObj.has("narr")? urlObj.get("narr").toString() : data.meta.defaultNarrative; 
        currentNarrativeArr = narratives[narrativeTitle]; 
        currentIdx = urlObj.has("id") ? currentNarrativeArr.indexOf(urlObj.get("id").toString()) : 0; 
    }
    else {
        narrativeTitle = data.meta.defaultNarrative
        currentNarrativeArr = narratives[narrativeTitle];
    };
    narrImages = await preloadNarrImages();
    const itemData = items[currentNarrativeArr[currentIdx]];
    await setContent(itemData);
    await Promise.all([
        updateElements('.current-narrative', narrativeTitle), 
        setSidebarList(currentNarrativeArr, currentIdx)
    ]);
    mainImage.parentElement.scrollIntoView();
});


///// UI FUNCTIONS /////

async function setContent(data) {
    buttonsCheck();
    console.log(narrImages)
    await setImage();
    await Promise.all([
        updateElements('.current-artwork', data.title),
        updateElements('.table-data', el => data[el.id]),
        setNarrativeSwitch(data)
    ]);
    text.innerHTML = data.text.basic;
    textState = 0;;
}

async function buttonsCheck () {
    backButton.disabled = currentIdx === 0;
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    lessButton.disabled = true;
    moreButton.disabled = false;
}

// setContent helper funcs
function updateElements(selector, content) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.textContent = typeof content === 'function' ? content(el) : content;
    });
}

async function preloadNarrImages() {
    const imgPromises = currentNarrativeArr.map((id) => {
        const imgUrl = items[id].img
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imgUrl;
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => reject(new Error('Image failed to load'));
        });
    });

    try {
        const loadedImages = await Promise.all(imgPromises);
        console.log("All images preloaded successfully!");
        return loadedImages; // Return the array of loaded Image objects
    } 
    catch (error) {
        console.error(error);
    }
}

async function nextItem() {
    currentIdx += 1;
    showLoading();
    await setContent(items[currentNarrativeArr[currentIdx]]);
    disableCurrSideItem(currentIdx);
}

async function prevItem() {
    currentIdx -= 1;
    showLoading();
    await setContent(items[currentNarrativeArr[currentIdx]]);
    disableCurrSideItem(currentIdx);
}

async function setNarrativeSwitch(item) {
    // resetting alt narrative section
    document.querySelectorAll("#alt-narr div.sub-narr").forEach((i) => {
        i.innerHTML = "";
    });

    const itemNarratives = [...item.includedIn];
    if (narrativeTitle === "Geography") {
        document.querySelector(`#geography button`).disabled = true;
    }
    else {
        const idx = itemNarratives.indexOf(narrativeTitle);
        itemNarratives.splice(idx, 1);
    }
    itemNarratives.forEach((i) => { 
        const button = document.createElement("button");
        button.classList.add("btn");
        button.textContent = i; 
        switch (i) {
            case "Supernatural":
            case "Daily":
                document.querySelector(`#${i.toLowerCase()} button`).disabled = false;
                break;
            case "Playing":
            case "Chilling":
            case "Hunting":
                document.querySelector("#daily div.sub-narr").appendChild(button);
                break;
            case "Folklore":
            case "Superstition":
            case "Religion":
                document.querySelector("#supernatural div.sub-narr").appendChild(button);
                break;
            case "Europe":
            case "Asia":
            case "Africa":
            case "Americas":
                document.querySelector("#geography div.sub-narr").appendChild(button);
                break;
        };
    });
}

async function switchNarrative(narrative) {
    console.log(narrative)
    document.querySelectorAll('.current-narrative').forEach((el) => {
        el.textContent = narrative;
    });
    currentNarrativeArr = narratives[narrative];
    narrativeTitle = narrative;
    currentIdx = 0;
    narrImages = await preloadNarrImages();
    await Promise.all([updateElements('.current-narrative', narrativeTitle), setContent(items[currentNarrativeArr[0]]), setSidebarList()]);
}

async function setSidebarList(narrative = currentNarrativeArr) {
    artworksList.innerHTML = "";
    narrative.forEach((item, i) => {
        const listElement = document.createElement('button');
        listElement.classList.add("btn");
        listElement.id = i;
        listElement.innerHTML = items[item].title;
        artworksList.appendChild(listElement);
    });
    disableCurrSideItem(currentIdx);
}

function disableCurrSideItem(idx) {
    artworksList.querySelector('.disabled')?.classList.remove('disabled');
    document.getElementById(idx).classList.add('disabled');
}

// OBSERVER //

const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        smallImagecontainer.classList.remove('hidden');
        smallImagecontainer.classList.add('visible');
        arrowSvg.setAttribute("transform", `rotate(${rotation})`);
        rotation += 180;
      } else {
        smallImagecontainer.classList.remove('visible');
        smallImagecontainer.classList.add('hidden');
        arrowSvg.setAttribute("transform", `rotate(${rotation})`);
        rotation -= 180;
      }
    });
  };
  
const observer = new IntersectionObserver(observerCallback, {threshold: 0.1});
observer.observe(mainImage);



///// EVENT LISTENERS /////

window.addEventListener("resize", () => {
    const offcanvasClasses = document.querySelector(".offcanvas").classList;
    if (offcanvasClasses.contains("show")) {
    offcanvasClasses.remove("show");
    }
});

window.addEventListener("load", () => {

    mainImage.addEventListener("load", () => {
        spinner.classList.add("hide-loading");
    
    //     spinner.addEventListener("transitionend", () => {
    //         spinner.remove();
    // });
    })
})

// narrative switch

altNarrative.addEventListener("click", async (e) => {
    const button = e.target.closest("button")
    if (button) {
        let narrative;
        if (e.target.innerText === "") {
            console.log(button.title)
            narrative = button.title.split(" ")[0];
        }
        else {
            narrative = button.textContent;
        };
        smallImagecontainer.classList.add('hidden');
        smallImagecontainer.classList.remove('visible');
        await new Promise(requestAnimationFrame);
        mainImage.parentElement.scrollIntoView({behavior : "smooth"});
        await new Promise(resolve => setTimeout(resolve, 600)); 
        await switchNarrative(narrative);
    };
});

// text switching 

textButtons.addEventListener("click", (e) => {
    text.innerHTML = ""
    const button = e.target.closest("button");
    if (button) {
        let textType
        textState += +button.value
        console.log(textState)
        switch (textState) {
            case 1: 
                textType = "extended";
                lessButton.disabled = false;
                moreButton.disabled = false;
                break;
            case 2: 
                textType = "long";
                moreButton.disabled = true;
                document.getElementById('info-text').scrollIntoView()
                break;
            default: 
                textType = "basic";
                lessButton.disabled = true;
        };
        const item = currentNarrativeArr[currentIdx];
        text.innerHTML = items[item]["text"][textType]
    }
});

// timeline refferal

document.getElementById("time").addEventListener("click", () => {
    window.location.href = `timeline.html#${currentNarrativeArr[currentIdx]}`
})

// scroll animations 

sideImage.addEventListener("click", (e) => {
    const card = e.target.closest("#side-image")
    if (card) {
        mainImage.parentElement.scrollIntoView({behavior : "smooth"});
    }
});

document.querySelector(".scroll-button").addEventListener("click", (e) => {
    if (smallImagecontainer.classList.contains("hidden")) {
        table.scrollIntoView();    
    } else {
        mainImage.parentElement.scrollIntoView({behavior : "smooth"});
    }
    e.target.setAttribute("transform", `rotate(${rotation})`);
    });

// Offcanvas buttons
artworksList.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
        currentIdx = +e.target.id;
        disableCurrSideItem(currentIdx);
        await setContent(items[currentNarrativeArr[currentIdx]]);
    }
    console.log(currentIdx)
    console.log(narrativeTitle)
})