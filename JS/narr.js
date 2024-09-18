let currentNarrative = []
let narrativeTitle = ""
let currentIdx = 0
let items = []
let narratives = []

const nextButton = document.getElementById("next-button")
const backButton = document.getElementById("back-button")


document.addEventListener("DOMContentLoaded", () => {
	fetch('data/narr.json')
	.then(response => response.json())
	.then(async data => {
        items = data.items
        narratives = data.narratives
        currentIdx = data.meta.defaultStart
        narrativeTitle = data.meta.defaultNarrative
        currentNarrative = data.narratives[narrativeTitle] 
        itemData = items[currentNarrative[currentIdx]]

        await setContent(itemData)
        setDropdownList(currentNarrative, currentIdx)
        if (currentIdx === 0) backButton.disabled = true
        document.getElementById('current-narrative').innerHTML = narrativeTitle
    })
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
};

async function prevItem() {
    if (currentIdx === currentNarrative.length - 1) {
        nextButton.disabled = false
    }
    currentIdx -= 1
    await setContent(items[currentNarrative[currentIdx]])
    if (currentIdx === 0) {
        backButton.disabled = true
    }
};

async function setContent(data) {
    await loadImage(data.img)
    document.querySelectorAll('.current-artwork').forEach((el) => {
        el.innerHTML = data.title
    });
    document.querySelectorAll('.table-data').forEach((el) => {
        el.innerHTML = data[el.id]
    });
};

async function loadImage(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            document.getElementById('artwork-img').setAttribute('src', imagePath);
            resolve();
        };
        img.onerror = () => reject(new Error('Image failed to load'));
    });
};

async function setDropdownList(narrative=currentNarrative) {
    const dropdown = document.getElementById('dropdown-list')
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
    disableDropItem(currentIdx);
}


function disableDropItem(idx) {
    document.querySelector('.disabled')?.classList.remove('disabled')
    const dropdownItem = document.getElementById(`${idx}`)
    dropdownItem.classList.add('disabled')
    }

async function switchNarrative (narrative, id=null) {
    currentNarrative = narratives[narrative];
    if (id) currentIdx = currentNarrative.indexOf(id)
    const currItem = items[currentNarrative[currentIdx]]
   document.getElementById('current-narrative').innerHTML = narrative
   await setContent(currItem)
   if (currentIdx === 0) backButton.disabled = true;
   else {
    backButton.disabled = false;
    if (currentIdx === currentNarrative.lenght - 1) nextButton.disabled = true    
   } 
}

