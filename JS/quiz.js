const quizData = [
    {
        question: "Which is this item originated from",
        image: "images/narr/img-4.png",
        options: ["Japan", "China", "Italy", "Egypt"],
        correctAnswer: 1
    },
    {
        question: "Which narrative is incorret about this item？",
        image: "images/narr/img-8.jpg",
        options: ["Religion", "Superstition", "Hunting", "Europe"],
        correctAnswer: 0
    },
    {
        question: "What materials and techniques were used to create 'The Cat' religious card?",
        image: "images/narr/img-7.jpg",
        options: [
            "Lithograph and gold foiling",
            "Watercolor and woodcut",
            "Engraving and gilding",
            "Hand-coloured lithograph with letterpress and gilt embossing"
        ],
        correctAnswer: 3
    },
    {
        question: "In which year did Andy Warhol and his mother create '25 Cats Name Sam and One Blue Pussy'?",
        image: "images/narr/img-17.jpg",
        options: [
            "1952",
            "1953",
            "1954",
            "1955"
        ],
        correctAnswer: 2
    },
    {
        question: "What materials were used to create the Cat from a Ball Toss Game?",
        image: "images/narr/img-2.jpg",
        options: [
            "Wood and metal only",
            "Painted canvas with leather, wood, and metal",
            "Plastic and canvas",
            "Leather and plastic"
        ],
        correctAnswer: 1
    }
];

let currentQuestion = 0;
let score = 0;
let isAnswered = false;

const questionContainer = document.getElementById('question-container');
const resultsContainer = document.getElementById('results-container');
const questionNumber = document.getElementById('question-number');
const questionImage = document.querySelector('#question-image img');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const scoreValue = document.getElementById('scoreValue');
const feedback = document.getElementById('feedback');
const retryButton = document.getElementById('retry-button');

function initQuiz() {
    currentQuestion = 0;
    score = 0;
    isAnswered = false;
    showQuestion();
    
    resultsContainer.style.display = 'none';
    questionContainer.style.display = 'block';
}

function showQuestion() {
    const question = quizData[currentQuestion];
    isAnswered = false;
    
    questionNumber.textContent = `Question ${currentQuestion + 1}/${quizData.length}`;
    
    questionText.textContent = question.question;
    questionImage.src = question.image;
    questionImage.alt = `Question ${currentQuestion + 1} Image`;
    
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selectedIndex) {
    if (isAnswered) return; 
    
    isAnswered = true;
    const question = quizData[currentQuestion];
    const buttons = optionsContainer.getElementsByClassName('option-button');
    
    Array.from(buttons).forEach(button => {
        button.disabled = true;
    });
    
    if (selectedIndex === question.correctAnswer) {
        buttons[selectedIndex].classList.add('correct');
        score++;
    } else {
        buttons[selectedIndex].classList.add('incorrect');
        buttons[question.correctAnswer].classList.add('correct');
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1000);
}

function showResults() {
    questionContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    scoreValue.textContent = `${score}/${quizData.length}`;
    
    if (score === quizData.length) {
        feedback.textContent = 'Excellent! You got all questions correct!';
        feedback.className = 'alert alert-success';
    } else if (score >= quizData.length * 0.8) {
        feedback.textContent = 'Great job! Keep it up!';
        feedback.className = 'alert alert-success';
    } else if (score >= quizData.length * 0.6) {
        feedback.textContent = 'Good effort! Room for improvement!';
        feedback.className = 'alert alert-warning';
    } else {
        feedback.textContent = 'Keep trying! You\'ll do better next time!';
        feedback.className = 'alert alert-danger';
    }
}

retryButton.addEventListener('click', () => {
    initQuiz();
});

document.addEventListener('DOMContentLoaded', () => {
    initQuiz();
});