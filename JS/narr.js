let narratives = []
let currentNarrative = []
let narrativeTitle = ""
let currentIdx = 0
let items = []

const nextButton = document.getElementById("next-button")
const backButton = document.getElementById("back-button")
const altNarrative = document.getElementById("alt-narr")
const dropdown = document.getElementById('dropdown-list')

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
        document.getElementById("current-narrative").textContent = narrativeTitle
        setDropdownList(currentNarrative, currentIdx)
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
    if (currentIdx === 0) {
        backButton.disabled = false
    }
    currentIdx += 1
    await setContent(items[currentNarrative[currentIdx]])
    if (currentIdx === currentNarrative.length - 1) {
        nextButton.disabled = true
    };
    disableCurrDropItem(currentIdx);
};

async function prevItem() {
    if (currentIdx === currentNarrative.length - 1) {
        nextButton.disabled = false
    }
    currentIdx -= 1
    await setContent(items[currentNarrative[currentIdx]])
    if (currentIdx === 0) {
        backButton.disabled = true
    };
    disableCurrDropItem(currentIdx);
};

async function setContent(data) {
    async function loadImage(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imagePath;
            img.onload = () => {
                document.getElementById('artwork-img').setAttribute('src', imagePath);
                resolve();
                document.getElementById('artwork-img-2').setAttribute('src', imagePath);
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
    setNarrativeSwitch(data)
};

async function setDropdownList(narrative=currentNarrative) {
    dropdown.innerHTML = ""
    narrative.forEach((item, i) => {
        const listElement = document.createElement('li')
        listElement.classList.add('dropdown-item')
        listElement.id = i
        listElement.innerHTML = i+1 + ". " + items[item].title
        listElement.onclick = async () => {
            currentIdx = i
            await setContent(items[item])
        }
        dropdown.appendChild(listElement)
    })
    disableCurrDropItem(currentIdx);
};


function disableCurrDropItem(idx) {
    document.querySelector('.disabled')?.classList.remove('disabled')
    const dropdownItem = document.getElementById(idx)
    dropdownItem.classList.add('disabled')
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
    document.getElementById("current-narrative").textContent = narrativeTitle
    currentNarrative = narratives[narrative];
    narrativeTitle = narrative
    if (id) {
        currentIdx = currentNarrative.indexOf(id)
        setNarrativeSwitch(items[currentNarrative[currentIdx]])
        setDropdownList()
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

