let narratives = []
let currentNarrative = []
let narrativeTitle = ""
let currentIdx = 0
let items = []

const nextButton = document.getElementById("next-button")
const backButton = document.getElementById("back-button")
const altNarrative = document.getElementById("alt-narr")
const artworksList = document.getElementById("artwork-list")
const mainImage = document.getElementById('artwork-img')
const sideImage = document.getElementById('artwork-img-2')

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}


document.addEventListener("DOMContentLoaded", () => {
    showLoading();
	fetch('data/narr.json')
	.then(response => response.json())
	.then(async data => {
        currentIdx = data.meta.defaultStart
        narrativeTitle = data.meta.defaultNarrative
        items = data.items
        narratives = data.narratives
        currentNarrative = narratives[narrativeTitle] 
        itemData = items[currentNarrative[currentIdx]]

        await setContent(itemData)
        setSidebarList(currentNarrative, currentIdx)
        hideLoading()
        if (currentIdx === 0) backButton.disabled = true
    })
});

altNarrative.addEventListener("click", (e) => {
    const narrative = e.target.innerHTML
    const itemId = currentNarrative[currentIdx]
    switchNarrative(narrative, itemId)
});

async function nextItem() {
    backButton.disabled = currentIdx === 0;
    currentIdx += 1;
    await setContent(items[currentNarrative[currentIdx]]);
    nextButton.disabled = currentIdx === currentNarrative.length - 1;
    disableCurrSideItem(currentIdx);
};

async function prevItem() {
    nextButton.disabled = currentIdx === currentNarrative.length - 1;
    currentIdx -= 1
    await setContent(items[currentNarrative[currentIdx]])
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

async function setSidebarList(narrative=currentNarrative) {
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
    currentNarrative = narratives[narrative];
    narrativeTitle = narrative
    if (id) {
        currentIdx = currentNarrative.indexOf(id)
        setNarrativeSwitch(items[currentNarrative[currentIdx]])
        setSidebarList()
    }
    else {
        currentIdx = 0
        await setContent(currItem)
    }
    if (currentIdx === 0) backButton.disabled = true;
   else {
    backButton.disabled = false;
    if (currentIdx === currentNarrative.length - 1) nextButton.disabled = true    
   } 
}

