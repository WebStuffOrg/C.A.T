let currentNarrative = []
let currentIdx = 0
let currentArtwork = currentNarrative[currentIdx]


document.addEventListener("DOMContentLoaded", () => {
	fetch('data/narr.json')
	.then(response => response.json())
	.then(data => {
        defaultNarrative = data.meta.defaultNarrative
        currentIdx = data.meta.defaultStart
        currentNarrative = data['narratives'][defaultNarrative]['all']
		currentArtwork = currentNarrative[currentIdx]

        setContent(currentArtwork)
	})
});

function nextArtwork(e) {
    if (currentIdx === 0) {
        document.getElementById('prev-button').disabled = false
    }
    currentIdx += 1
    if (currentIdx === currentNarrative.length - 1) {
        e.disabled = true
    };
    setContent(currentArtwork)
};

function prevArtwork(e) {
    if (currentIdx === currentNarrative.length - 1) {
        document.getElementById('next-button').disabled = false
    }
    currentIdx -= 1
    if (currentIdx === 0) {
        e.disabled = true
    }
    setContent(currentArtwork)
};

function setContent(id) {
    ;
};
function setDropdownList(currentNarrative) {
    ;
}

function switchNarrative (narr) {
   ;
}

