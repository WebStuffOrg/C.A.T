let narratives = []
let currentNarrativeArr = []
let narrativeTitle = ""
let currentIdx = 0
let items = []
let textState = 0

const nextButton = document.getElementById("next-button")
const backButton = document.getElementById("back-button")
const altNarrative = document.getElementById("alt-narr")
const artworksList = document.getElementById("artwork-list")
const mainImage = document.getElementById('artwork-img')
const sideImage = document.getElementById('artwork-img-2')
const spinner = document.getElementById('loading')
const textButtons = document.getElementById("button-container")
const lessButton = document.getElementById("less-button")
const moreButton = document.getElementById("more-button")
const text = document.getElementById("info-text")
const imageContainer = document.getElementById("image-wrapper")

function showLoading() {
    spinner.style.display = 'block';
}

function hideLoading() {
    spinner.style.display = 'none';
}

// EVENT LISTENERS //

document.addEventListener("DOMContentLoaded", () => {
    showLoading();
    fetch('data/narr.json')
    .then(response => response.json())
    .then(async data => {
        imageContainer.scrollIntoView()
        items = data.items
        narratives = data.narratives
        narrativeTitle = data.meta.defaultNarrative
        let itemId
        if (window.location.href.includes("?")) {

            const urlObj = new URLSearchParams(window.location.search);
            itemId = urlObj.get("id").toString();
            if (urlObj.has("narr")) narrativeTitle = urlObj.get("narr").toString();
            currentIdx = narratives[narrativeTitle].indexOf(itemId);
        } 
        else {
            itemId = narratives[narrativeTitle][currentIdx];
        }
        const itemData = items[itemId];
        currentNarrativeArr = narratives[narrativeTitle];
        await setContent(itemData);  
        await setSidebarList(currentNarrativeArr, currentIdx);
        hideLoading()
    });
});

altNarrative.addEventListener("click", (e) => {
    const narrative = e.target.innerHTML
    const itemId = currentNarrativeArr[currentIdx]
    switchNarrative(narrative, itemId)
});

textButtons.addEventListener("click", (e) => {
    const el = e.target
    if (el.tagName === "BUTTON") {
        let textType
        textState += parseInt(el.value)
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
                break;
            default: 
                textType = "basic";
                lessButton.disabled = true;
        }
        const item = currentNarrativeArr[currentIdx]
        text.innerHTML = items[item]["text"][textType]
    }
});

sideImage.addEventListener("click", () => {
    imageContainer.scrollIntoView()
})

// UI FUNCTIONS //

async function nextItem() {
    backButton.disabled = currentIdx === 0;
    currentIdx += 1;
    await setContent(items[currentNarrativeArr[currentIdx]]);
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    disableCurrSideItem(currentIdx);
}

async function prevItem() {
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    currentIdx -= 1
    await setContent(items[currentNarrativeArr[currentIdx]])
    backButton.disabled = currentIdx === 0;
    disableCurrSideItem(currentIdx);
}

async function setContent(data) {
    async function loadImage(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imagePath;
            img.onload = () => {
                mainImage.setAttribute('src', imagePath);
                sideImage.setAttribute('src', imagePath);
                resolve();
            };
            img.onerror = () => reject(new Error('Image failed to load'));
        });
    }

    await loadImage(data.img);
    document.querySelectorAll('.current-artwork').forEach((el) => {
        el.innerHTML = data.title;
    });
    document.querySelectorAll('.table-data').forEach((el) => {
        el.innerHTML = data[el.id];
    });
    document.querySelectorAll('.current-narrative').forEach((el) => {
        el.textContent = narrativeTitle;
    });
    setNarrativeSwitch(data);
    backButton.disabled = currentIdx === 0;
    lessButton.disabled = true;
}

async function setSidebarList(narrative = currentNarrativeArr) {
    artworksList.innerHTML = "";
    narrative.forEach((item, i) => {
        const listElement = document.createElement('li');
        listElement.classList.add("btn");
        listElement.id = i;
        listElement.innerHTML = items[item].title;
        listElement.onclick = async () => {
            currentIdx = i;
            disableCurrSideItem(currentIdx);
            await setContent(items[item]);
        };
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
    altNarrative.innerHTML = "";
    const itemNarratives = [...item.includedIn];
    const idx = itemNarratives.indexOf(narrativeTitle);
    itemNarratives.splice(idx, 1);
    const fragment = document.createDocumentFragment();
    itemNarratives.forEach((i) => {
        el = document.createElement("button");
        el.textContent = i;
        el.classList.add("p-2", "ms-2", "ms-md-0");
        fragment.appendChild(el);
    });
    altNarrative.appendChild(fragment);
}

async function switchNarrative(narrative, id = null) {
    document.querySelectorAll('.current-narrative').forEach((el) => {
        el.textContent = narrative;
    });
    currentNarrativeArr = narratives[narrative];
    narrativeTitle = narrative;
    if (id) {
        currentIdx = currentNarrativeArr.indexOf(id);
        setNarrativeSwitch(items[currentNarrativeArr[currentIdx]]);
        setSidebarList();
    } else {
        currentIdx = 0;
        await setContent(currItem);
    }
    if (currentIdx === 0) backButton.disabled = true;
    else backButton.disabled = false;
    if (currentIdx === currentNarrativeArr.length - 1) nextButton.disabled = true;
}
