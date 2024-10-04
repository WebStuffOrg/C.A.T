let narratives = []
let currentNarrativeArr = []
let narrativeTitle = ""
let currentIdx = 0
let items = []
let displayedText = 0

const nextButton = document.getElementById("next-button")
const backButton = document.getElementById("back-button")
const altNarrative = document.getElementById("alt-narr")
const artworksList = document.getElementById("artwork-list")
const mainImage = document.getElementById('artwork-img')
const sideImage = document.getElementById('artwork-img-2')
const spinner = document.getElementById('loading')
const textButtons = document.getElementById("button-container")


function showLoading() {
    spinner.style.display = 'block';
}

function hideLoading() {
    spinner.style.display = 'none';
}


document.addEventListener("DOMContentLoaded", () => {
    showLoading();
	fetch('data/narr.json')
	.then(response => response.json())
	.then(async data => {
        currentIdx = data.meta.defaultStart
        items = data.items
        narratives = data.narratives
        narrativeTitle = data.meta.defaultNarrative
        currentNarrativeArr = narratives[narrativeTitle] 
        if (window.location.href.includes("?")) {
            const urlObj = new URLSearchParams(window.location.search);
            console.log(urlObj)
            itemId = urlObj.get("id").toString()
            itemData = items[itemId]
            if (urlObj.has("narr")) {currentNarrativeArr = narratives[urlObj.get("narr")]}
        }
        else {
            itemData = items[currentNarrativeArr[currentIdx]]    
        }
        
        await setContent(itemData)
        setSidebarList(currentNarrativeArr, currentIdx)
        hideLoading()
        if (currentIdx === 0) backButton.disabled = true
    })
});

altNarrative.addEventListener("click", (e) => {
    const narrative = e.target.innerHTML
    const itemId = currentNarrativeArr[currentIdx]
    switchNarrative(narrative, itemId)
});

textButtons.addEventListener("click", async (e) => {
    if (e.target.tagName=== "BUTTON") {
        let textType = ""
        if (e.target.id == "less-button" && displayedText != 0) {
            displayedText -= 1
        }
        else if (e.target.id == "more-button" && displayedText != 2) {
            displayedText += 1
        };
        switch (displayedText) {
            case displayedText == 1: 
            textType = "long"; 
            break
            case displayedText == 2: 
            textType = "extended"; 
            break
            default: textType = "basic";
        }
        console.log(textType)
        document.getElementById("info-text").innerHTML = items[currentNarrativeArr[currentIdx]].text[textType]
    }
});

async function nextItem() {
    backButton.disabled = currentIdx === 0;
    currentIdx += 1;
    await setContent(items[currentNarrativeArr[currentIdx]]);
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    disableCurrSideItem(currentIdx);
};

async function prevItem() {
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    currentIdx -= 1
    await setContent(items[currentNarrativeArr[currentIdx]])
    backButton.disabled = currentIdx === 0;
    disableCurrSideItem(currentIdx);
};

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
    };
    await loadImage(data.img)
    document.querySelectorAll('.current-artwork').forEach((el) => {
        el.innerHTML = data.title
    });
    document.querySelectorAll('.table-data').forEach((el) => {
        el.innerHTML = data[el.id]
    });
    document.querySelectorAll('.current-narrative').forEach((el) => {
        el.textContent = narrativeTitle
    });  

    setNarrativeSwitch(data)
};

async function setSidebarList(narrative=currentNarrativeArr) {
    artworksList.innerHTML = ""
    narrative.forEach((item, i) => {
        const listElement = document.createElement('li')
        listElement.classList.add("btn")
        listElement.id = i
        listElement.innerHTML = items[item].title
        listElement.onclick = async () => {
            currentIdx = i
            disableCurrSideItem(currentIdx)
            await setContent(items[item])
        }
        artworksList.appendChild(listElement)
    })
    disableCurrSideItem(currentIdx);
};


function disableCurrSideItem(idx) {
    artworksList.querySelector('.disabled')?.classList.remove('disabled')
    const SidebarItem = document.getElementById(idx)
    SidebarItem.classList.add('disabled')
}


async function setNarrativeSwitch (item) {
    altNarrative.innerHTML = ""
    const itemNarratives = [...item.includedIn]
    const idx = itemNarratives.indexOf(narrativeTitle) 
    itemNarratives.splice(idx, 1)
    const fragment = document.createDocumentFragment()
    itemNarratives.forEach((i) => {
        el = document.createElement("button");
        el.textContent = i
        el.classList.add("p-2", "ms-2", "ms-md-0")
        fragment.appendChild(el)
    })
    altNarrative.appendChild(fragment)
};

async function switchNarrative (narrative, id=null) {
    document.querySelectorAll('.current-narrative').forEach((el) => {
        el.textContent = narrative
    });    
    currentNarrativeArr = narratives[narrative];
    narrativeTitle = narrative
    if (id) {
        currentIdx = currentNarrativeArr.indexOf(id)
        setNarrativeSwitch(items[currentNarrativeArr[currentIdx]])
        setSidebarList()
    }
    else {
        currentIdx = 0
        await setContent(currItem)
    }
    if (currentIdx === 0) backButton.disabled = true;
   else {
    backButton.disabled = false;
    if (currentIdx === currentNarrativeArr.length - 1) nextButton.disabled = true    
   } 
}
