let narratives = []
let items = []

let currentNarrativeArr = []
let narrativeTitle = ""
let currentIdx = 0
let textState = 0
let rotation = 0

const nextButton = document.getElementById("next-button");
const backButton = document.getElementById("back-button");
const altNarrative = document.getElementById("alt-narr");
const artworksList = document.getElementById("artwork-list");
const smallImagecontainer = document.getElementById("side-image");
const mainImage = document.getElementById('artwork-img');
const sideImage = document.getElementById('artwork-img-2');
const spinner = document.querySelector('.loading-spinner');
const textButtons = document.getElementById("button-container");
const lessButton = document.getElementById("less-button");
const moreButton = document.getElementById("more-button");
const text = document.getElementById("info-text");
const imageContainer = document.getElementById("image-wrapper");
const table = document.getElementById("info-box");
const arrowSvg = document.querySelector(".scroll-button > svg")

async function showLoading() {
    spinner.style.display = 'block';
}

async function hideLoading() {
    spinner.style.display = 'none';
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

const observer = new IntersectionObserver(observerCallback);
observer.observe(mainImage);

window.addEventListener("resize", () => {
  const offcanvasClasses = document.querySelector(".offcanvas").classList;
  if (offcanvasClasses.contains("show")) {
    offcanvasClasses.remove("show");
  }
});

///// EVENT LISTENERS /////

document.addEventListener("DOMContentLoaded", async () => {
    await showLoading();
    fetch('data/narr.json')
    .then(response => response.json())
    .then(async data => {
        items = data.items;
        narratives = data.narratives;
        narrativeTitle = data.meta.defaultNarrative;
        let itemId;
        if (window.location.href.includes("?")) {
            const urlObj = new URLSearchParams(window.location.search);
            if (urlObj.has("narr")) {
                narrativeTitle = urlObj.get("narr").toString(); 
            }
            currentNarrativeArr = narratives[narrativeTitle]; 
            if (urlObj.has("id")) {
                itemId = urlObj.get("id").toString(); 
                currentIdx = currentNarrativeArr.indexOf(itemId); 
            } else {
                currentIdx = 0; 
            }
        } else {
            currentNarrativeArr = narratives[narrativeTitle];
            currentIdx = 0;
        }
        const itemData = items[currentNarrativeArr[currentIdx]];
        await setContent(itemData);
        await setSidebarList(currentNarrativeArr, currentIdx);
        await hideLoading();
        imageContainer.scrollIntoView();
    });
});

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
        imageContainer.scrollIntoView({ behavior: 'smooth' });
        await new Promise(resolve => setTimeout(resolve, 600));
        await switchNarrative(narrative);
    };
});

// text switching 

textButtons.addEventListener("click", (e) => {
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
        text.innerHTML = items[item]["text"][textType];
    }
});

// timeline refferal

document.getElementById("timeline-button").addEventListener("click", () => {
    document.getElementById("timeline-href").href = `timeline.html#${currentNarrativeArr[currentIdx]}`
})

// scroll animations 

sideImage.addEventListener("click", () => {
    imageContainer.scrollIntoView();
});

document.querySelector(".scroll-button").addEventListener("click", (e) => {
    if (smallImagecontainer.classList.contains("hidden")) {
        table.scrollIntoView();    
    } else {
        imageContainer.scrollIntoView();
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


///// UI FUNCTIONS /////

async function nextItem() {
    backButton.disabled = currentIdx === 0;
    currentIdx += 1;
    await setContent(items[currentNarrativeArr[currentIdx]]);
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    disableCurrSideItem(currentIdx);
}

async function prevItem() {
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    currentIdx -= 1;
    await setContent(items[currentNarrativeArr[currentIdx]]);
    backButton.disabled = currentIdx === 0;
    disableCurrSideItem(currentIdx);
}

async function setContent(data) {
    const imageLoadPromise = loadImage(data.img);
    const updateTextPromise = Promise.all([
        updateElements('.current-artwork', data.title),
        updateElements('.table-data', el => data[el.id]),
        updateElements('.current-narrative', narrativeTitle),
        setNarrativeSwitch(data)
    ]);
    await Promise.all([imageLoadPromise, updateTextPromise]);
    text.innerHTML = data.text.basic;
    textState = 0;
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

function loadImage(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            mainImage.src = imagePath;
            sideImage.src = imagePath;
            resolve();
        };
        img.onerror = () => reject(new Error('Image failed to load'));
    });
}

//////////////

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
    const SidebarItem = document.getElementById(idx);
    SidebarItem.classList.add('disabled');
}

async function setNarrativeSwitch(item) {
    // resetting alt narrative section
    document.querySelectorAll("#alt-narr div.sub-narr").forEach((i) => {
        i.innerHTML = "";
    });
    document.querySelector("#daily button").disabled = true;
    document.querySelector("#supernatural button").disabled = true;
    document.querySelector("#geography button").disabled = false;

    const itemNarratives = [...item.includedIn];
    if (narrativeTitle != "Geography" && narrativeTitle != "Timeline") {
        const idx = itemNarratives.indexOf(narrativeTitle);
        itemNarratives.splice(idx, 1);
    }
    else {
        document.querySelector(`#${narrativeTitle.toLowerCase()} button`).disabled = true;
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
    document.querySelectorAll('.current-narrative').forEach((el) => {
        el.textContent = narrative;
    });
    currentNarrativeArr = narratives[narrative];
    narrativeTitle = narrative;
    currentIdx = 0;
    await setContent(items[currentNarrativeArr[0]]);
    await setSidebarList();
}
