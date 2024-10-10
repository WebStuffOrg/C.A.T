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
const smallImagecontainer = document.getElementById("side-image");
const mainImage = document.getElementById('artwork-img')
const sideImage = document.getElementById('artwork-img-2')
const spinner = document.getElementById('loading')
const textButtons = document.getElementById("button-container")
const lessButton = document.getElementById("less-button")
const moreButton = document.getElementById("more-button")
const text = document.getElementById("info-text")
const imageContainer = document.getElementById("image-wrapper")

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
      // Image is out of view, apply the sticky class
      smallImagecontainer.classList.remove('hidden');
      smallImagecontainer.classList.add('visible');
    } else {
      // Image is in view, remove the sticky class
      smallImagecontainer.classList.remove('visible');
      smallImagecontainer.classList.add('hidden');
    }
  });
};

const observer = new IntersectionObserver(observerCallback);

// Start observing the image container
observer.observe(mainImage);

window.addEventListener("resize", () => {
  const offcanvasClasses = document.querySelector(".offcanvas").classList
  if (offcanvasClasses.contains("show") ) {
    offcanvasClasses.remove("show")
  }
})

// EVENT LISTENERS //

document.addEventListener("DOMContentLoaded", async () => {
    await showLoading();
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
        await hideLoading()
    });
});

// narrative switch

altNarrative.addEventListener("click", async (e) => {
    const narrative = e.target.innerHTML
    smallImagecontainer.classList.replace("visible", "hidden")
    await switchNarrative(narrative)
    imageContainer.scrollIntoView()
});

// text switching 

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
    };
});

// scrollup animation 

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
};

async function prevItem() {
    nextButton.disabled = currentIdx === currentNarrativeArr.length - 1;
    currentIdx -= 1
    await setContent(items[currentNarrativeArr[currentIdx]])
    backButton.disabled = currentIdx === 0;
    disableCurrSideItem(currentIdx);
};

async function setContent(data) {
    const imageLoadPromise = loadImage(data.img);
    
    // Update text content concurrently
    const updateTextPromise = Promise.all([
        updateElements('.current-artwork', data.title),
        updateElements('.table-data', el => data[el.id]),
        updateElements('.current-narrative', narrativeTitle),
        setNarrativeSwitch(data)
    ]);

    // Wait for both image loading and text updates to complete
    await Promise.all([imageLoadPromise, updateTextPromise]);
    text.innerHTML = data.text.basic
    textState = 0
    backButton.disabled = currentIdx === 0;
    lessButton.disabled = true;
};

function updateElements(selector, content) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.textContent = typeof content === 'function' ? content(el) : content;
    });
};

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
};

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
};

function disableCurrSideItem(idx) {
    artworksList.querySelector('.disabled')?.classList.remove('disabled');
    const SidebarItem = document.getElementById(idx);
    SidebarItem.classList.add('disabled');
};

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
};

async function switchNarrative(narrative) {
    document.querySelectorAll('.current-narrative').forEach((el) => {
        el.textContent = narrative;
    });
    currentNarrativeArr = narratives[narrative];
    narrativeTitle = narrative;
    currentIdx = 0;
    await setContent(items[currentNarrativeArr[0]]);
    await setSidebarList();
    backButton.disabled = true;
    nextButton.disabled = false;
};
