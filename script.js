
    (() => {
 let quiz = [];
window.onload = () => {
  document.querySelector(".center-container").style.display = 'block';
};

  // Elements
  const startScreen = document.getElementById("start-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");
  const adminLoginScreen = document.getElementById("admin-login");
  const adminPanelScreen = document.getElementById("admin-panel");
  const startBtn = document.getElementById("start-btn");
  const adminLoginBtn = document.getElementById("admin-login-btn");
  const nextBtn = document.getElementById("next-btn");

   const timerContainer = document.getElementById('timerDisplay');
   const warningSound = document.getElementById('warningSound');
  const progressBar = document.getElementById("progress");
  const quizContent = document.getElementById("quiz-content");
  const resultSummary = document.getElementById("result-summary");
  const downloadResultBtn = document.getElementById("download-result-btn");
  const newUserBtn = document.getElementById("new-user-btn");
  const studentNameInput = document.getElementById("student-name");
  const studentClassInput = document.getElementById("student-class");
  const startError = document.getElementById("start-error");
  const adminPassInput = document.getElementById("admin-pass");
  const adminLoginSubmitBtn = document.getElementById("admin-login-submit-btn");
  const adminLoginCancelBtn = document.getElementById("admin-login-cancel-btn");
  const adminLoginError = document.getElementById("admin-login-error");
  const downloadAllBtn = document.getElementById("download-all-btn");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const adminLogoutBtn = document.getElementById("admin-logout-btn");
  const adminResultsContainer = document.getElementById("admin-results-container");
const toggleBtn = document.getElementById("theme-toggle");
 const timerDisplay = document.getElementById('timerDisplay');
  
    const timerSound = document.getElementById('timerSound');
      const body = document.body;


      // Initial setup      
      const QUIZ_TIME = 3000; // total time in seconds for the quiz

  
      // Set initial theme based on system preference
      // State variables
      let currentQuestionIndex = 0;
      let selectedAnswers = [];
      let timer = QUIZ_TIME;
      let timerInterval = null;
      let studentInfo = null;
      const adminPassword = "admin123"; // change this for admin password
       // Sounds for feedback
  const correctSound = new Audio("./sounds/success.wav");
  const wrongSound = new Audio("./sounds/wrong.mp3");

  


      // Utility functions
      function getQuizFileForClass(studentClass) {
        const classToQuizMap = {
          "Computer Studies": "questions_computer.json",
          "Computer Studies 2021": "ssce-past(2021).json",
          "Computer Studies 2022": "ssce-past(2022).json",
          "Computer Studies 2023": "ssce-past(2023).json",
          "Computer Studies 2024": "ssce-past(2024).json",
          "Computer Studies (Another)": "ssce-past(another).json",
          "Computer Studies (Difficult)": "ssce-past(difficult-compiled).json",
        };
        
        return classToQuizMap[studentClass] || "questions_computer.json"; // Default fallback
      }

      function loadQuiz(filename) {
          return fetch(filename)  // Add return here
            .then(res => {
              if (!res.ok) throw new Error(`Failed to load ${filename}`);
              return res.json();
            })
            .then(data => {
              quiz = data;
            })
            .catch(err => {
              startError.textContent = `Error loading quiz file: ${err.message}`;
              console.error(err);
            });
        }

      function saveResult(result) {
        let results = JSON.parse(localStorage.getItem("quizResults") || "[]");
        results.push(result);
        localStorage.setItem("quizResults", JSON.stringify(results));
      }

      function getAllResults() {
        return JSON.parse(localStorage.getItem("quizResults") || "[]");
      }

      function clearAllResults() {
        if (confirm("Are you sure you want to clear ALL quiz results?")) {
          localStorage.removeItem("quizResults");
          alert("All results cleared.");
          adminResultsContainer.innerHTML = "";
        }
      }

      function userExists(name, cls) {
        const results = getAllResults();
        return results.some(r => r.name.toLowerCase() === name.toLowerCase() && r.class.toLowerCase() === cls.toLowerCase());
      }

      function formatDateTime(date) {
        return date.toLocaleString();
      }

      // UI functions
      function showScreen(screen) {
        [startScreen, quizScreen, resultScreen, adminLoginScreen, adminPanelScreen].forEach(s => s.style.display = "none");
        screen.style.display = "block";
      }

      // Render a question with options
      function renderQuestion(index) {
        const q = quiz[index];
        quizContent.innerHTML = `
      <div class="question">Q${index + 1}. ${q.question}</div>
      <div class="options">
        ${q.options.map(opt => `<button type="button" class="option-btn">${opt}</button>`).join("")}
      </div>
    `;
        // Disable next button until an option is selected
        nextBtn.disabled = true;

        // Highlight previously selected answer (if any)
        const optionButtons = quizContent.querySelectorAll(".option-btn");
        optionButtons.forEach((btn, idx) => {
          btn.addEventListener("click", () => {
            selectedAnswers[index] = btn.textContent;
            optionButtons.forEach(b => b.disabled = true);
            // Mark correct/wrong on selection
            optionButtons.forEach(b => {
              if (b.textContent === q.answer) b.classList.add("correct");
              else if (b.textContent === selectedAnswers[index]) b.classList.add("wrong");
                  // Play sounds
    if(b.textContent === q.answer) {
      correctSound.play();
    } else if (b.textContent === selectedAnswers[index]){

      wrongSound.play();
    }
            });
        
            nextBtn.disabled = false;
          });

          // If previously answered, disable buttons and show correct/wrong
          if (selectedAnswers[index]) {
            optionButtons.forEach(b => {
              b.disabled = true;
              if (b.textContent === q.answer) b.classList.add("You selected the correct answer!");
              else if (b.textContent === selectedAnswers[index]) b.classList.add("Oops! That was the wrong answer. ❌");
            });
            nextBtn.disabled = false;
          }
        });

        // Update progress bar
        const progressPercent = ((index) / quiz.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
      }

      // Show result summary after quiz
      function showResult() {
        let correctCount = 0;
        let html = `
                <p class="info"><strong>Name:</strong> ${studentInfo.name}</p>
                <p class="info"><strong>Class:</strong> ${studentInfo.class}</p>
                <p class="info"><strong>Date:</strong> ${formatDateTime(new Date())}</p>
                <p class="info"><strong>Score:</strong>
                 `;

        selectedAnswers.forEach((ans, i) => {
          if (ans === quiz[i].answer) correctCount++;
        });
        html += `${correctCount} / ${quiz.length}`;

        quiz.forEach((q, i) => {
          const userAns = selectedAnswers[i];
          const correct = userAns === q.answer;
          html += `
        <div class="result-question">
          <strong>Q${i + 1}.</strong><strong> ${q.question}</strong>
          <div class="result-answer" ${correct ? 'correct' : 'wrong'}">
            ${correct ? '<i class="fa fa-check correct-icon"></i>' : '<i class="fa fa-times wrong-icon"></i>'}
            Your answer: ${userAns || 'No answer'}
          </div>
          <div>Correct answer:${q.answer}</div>
        <div class="explanation" style="font-style:italic;">Explanation:${q.explanation || ''}</div>
        </div>
      `;
        });

        resultSummary.innerHTML = html;
      }

   

      // Admin: Render all results in container
      function renderAdminResults() {
        const results = getAllResults();
        if (results.length === 0) {
          adminResultsContainer.innerHTML = "<p>No quiz results found.</p>";
          return;
        }
        let html = `<table border="1" >
         
            <colgroup>
      <col style="width: 20%;">
      <col style="width: 20%;">
      <col style="width: 40%;">
      <col style="width: 20%;">
    </colgroup>
      <thead><tr>
        <th>Name</th>
        <th>Class</th>
        <th>Date</th>
        <th>Score</th>
      </tr></thead><tbody>`;
        results.forEach(r => {
          const correctCount = r.answers.reduce((acc, a, i) => acc + (a === quiz[i].answer ? 1 : 0), 0);
          html += `<tr>
        <td>${r.name}</td>
        <td>${r.class}</td>
        <td>${r.date}</td>
        <td>${correctCount} / ${quiz.length}</td>
      </tr>`;
        });
        html += "</tbody></table>";
        adminResultsContainer.innerHTML = html;
      }

      // Download one result as PDF 


const downloadResultPDF = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const studentName = studentInfo.name || "Student";
  const studentClass = studentInfo.class || "Class";
  const resultText = resultSummary.innerText || resultSummary.textContent || "No result found.";
  const lines = [
    `Quiz Result Summary`,

    ...resultText.split('\n')
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  let y = 20;
  lines.forEach(line => {
    doc.text(line, 2, y);
      
    y += 7;
    if (y > 250) { 
      doc.addPage();
      y = 5;
    }
  });

  doc.save(`${studentName}_${studentClass}_result.pdf`);
};
 
  


  async function downloadAllResultsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const results = getAllResults(); // Fetch from localStorage or wherever you store it
    if (!results.length) return alert("No results to download.");

    const totalStudents = results.length;
    const totalQuestions = quiz.length;
    const totalScores = results.map(r =>
      r.answers.filter((a, i) => a === quiz[i].answer).length
    );
    const averageScore = (
      totalScores.reduce((a, b) => a + b, 0) / totalStudents
    ).toFixed(2);

    // ➤ COVER PAGE
    let y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Quiz Result Report", 70, y); y += 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Students: ${totalStudents}`, 20, y); y += 10;
    doc.text(`Total Questions: ${totalQuestions}`, 20, y); y += 10;
    doc.text(`Average Score: ${averageScore}`, 20, y); y += 20;

     doc.setTextColor(180);
        doc.text("-----------------------------------------------------------------------------------", 10, y); y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

    // ➤ GROUP BY CLASS
    const grouped = {};
    results.forEach(r => {
      if (!grouped[r.class]) grouped[r.class] = [];
      grouped[r.class].push(r);
    });

    for (const className in grouped) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 128);
      doc.setFontSize(14);
      doc.text(`Class: ${className}`, 10, y); y += 10;

      const students = grouped[className];
      students.sort((a, b) => {
        const scoreA = a.answers.filter((ans, i) => ans === quiz[i].answer).length;
        const scoreB = b.answers.filter((ans, i) => ans === quiz[i].answer).length;
        return scoreB - scoreA; // Sort by score
      });

      for (let r of students) {
        const score = r.answers.filter((a, i) => a === quiz[i].answer).length;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);

        const info = [
          `Name: ${r.name}`,
          `Class: ${r.class}`,
          `Date: ${r.date}`,
          `Score: ${score}/${totalQuestions}`,
          ''
        ];
        info.forEach(line => {
          doc.text(line, 10, y);
          y += 6;
        });

        r.answers.forEach((ans, i) => {
          const q = quiz[i];
          const correct = ans === q.answer;

          doc.setTextColor(0, 0, 0);
          doc.text(`Q${i + 1}. ${q.question}`, 10, y); y += 5;

          doc.setTextColor(correct ? 0 : 255, correct ? 128 : 0);
          doc.text(`${correct ? "✔️" : "❌"} Your answer: ${ans || 'No answer'}`, 10, y); y += 5;

          doc.setTextColor(0, 0, 255);
          doc.text(`Correct answer: ${q.answer}`, 10, y); y += 5;

          doc.setTextColor(100);
          doc.text(`Explanation: ${q.explanation || 'N/A'}`, 10, y); y += 7;

          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });

        doc.setTextColor(180);
        doc.text("--------------------------------------------------", 10, y); y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }
    }

    doc.save("All_Students_Results_Report.pdf");
  }

      // Event handlers
      startBtn.onclick = async () => {  // Make it async
          const name = studentNameInput.value.trim();
          const cls = studentClassInput.value.trim();
        
          if (!name || !cls) {
            startError.textContent = "Please enter your name and class.";
            return;
          }
        
          if (userExists(name, cls)) {
            startError.textContent = "User already took the quiz. Only one attempt allowed.";
            return;
          }
        
          const quizFile = getQuizFileForClass(cls);
          
          startError.textContent = "";
          studentInfo = { name, class: cls };
          currentQuestionIndex = 0;
          selectedAnswers = [];
          timer = QUIZ_TIME;
        
          showScreen(quizScreen);
          
          // Wait for quiz to load before rendering
          await loadQuiz(quizFile);  // Add await
          
          if (quiz.length === 0) {
            startError.textContent = "Failed to load questions. Please try again.";
            showScreen(startScreen);
            return;
          }
        
          renderQuestion(currentQuestionIndex);
          updateTimer();
          timerInterval = setInterval(() => {
            timer--;
            updateTimer();
            if (timer === 5) {
              const finalBeep = new Audio("https://www.soundjay.com/button/sounds/beep-09.mp3");
              finalBeep.play();
            }
            if (timer <= 0) {
              clearInterval(timerInterval);
              alert(" ⏰ Time is up! The quiz will now end.");
              finishQuiz();
            }
          }, 1000);
        };
  
  
      

      function updateTimer() {
        timerDisplay.textContent = timer;

       // Change color based on time
      if (timer <= 10) {
        timerDisplay.classList.remove("warning");
        timerDisplay.classList.add("danger");
      } else if (timer <= 30) {
        timerDisplay.classList.remove("danger");
        timerDisplay.classList.add("warning");
         // Play tick sound
         timerSound.currentTime = 0;
        timerSound.play();
      } else {
        timerDisplay.classList.remove("warning", "danger");
      }


      }

      nextBtn.onclick = () => {
        if (currentQuestionIndex < quiz.length - 1) {
          currentQuestionIndex++;
          renderQuestion(currentQuestionIndex);
        } else {
          finishQuiz();
        }
      };

      function finishQuiz() {
        clearInterval(timerInterval);
        // alert("✅ Quiz finished or time is up!");
        timer = QUIZ_TIME;
      timerDisplay.textContent = timer;
      timerDisplay.classList.remove("warning", "danger");
        saveResult({
          name: studentInfo.name,
          class: studentInfo.class,
          date: formatDateTime(new Date()),
          answers: selectedAnswers
        });
        showScreen(resultScreen);
        showResult();
      }


      newUserBtn.onclick = () => {
        studentNameInput.value = "";
        studentClassInput.value = "";
        selectedAnswers = [];
        currentQuestionIndex = 0;
        timer = QUIZ_TIME;
        studentInfo = null;
        startError.textContent = "";
        showScreen(startScreen);
      };

      // Admin login flow
      adminLoginBtn.onclick = () => {
        adminPassInput.value = "";
        adminLoginError.textContent = "";
        showScreen(adminLoginScreen);
      };

      adminLoginSubmitBtn.onclick = () => {
        const pass = adminPassInput.value;
        if (pass === adminPassword) {
          adminLoginError.textContent = "";
          showScreen(adminPanelScreen);
          renderAdminResults();
        } else {
          adminLoginError.textContent = "Incorrect password.";
        }
      };

      adminLoginCancelBtn.onclick = () => {
        showScreen(startScreen);
      };

      adminLogoutBtn.onclick = () => {
        showScreen(startScreen);
      };

 downloadResultBtn.onclick = () => {
        downloadResultPDF();
      };  
      
      downloadAllBtn.onclick = () => {
        downloadAllResultsPDF();
      }; 
    
      clearAllBtn.onclick = () => {
        clearAllResults();
        renderAdminResults();
      };

      // Initialize
      showScreen(startScreen);
      
toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  toggleBtn.textContent = body.classList.contains("dark") ? "🌙" : "🌞";
});
})();


