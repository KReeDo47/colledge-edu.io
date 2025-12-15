// DOM элементы
const coursesGrid = document.getElementById('coursesGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const levelFilter = document.getElementById('levelFilter');
const durationFilter = document.getElementById('durationFilter');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const courseModal = document.getElementById('courseModal');
const courseDetail = document.getElementById('courseDetail');
const contactForm = document.getElementById('contactForm');

// Переменные состояния
let currentCourses = [...coursesData];
let filteredCourses = [...coursesData];
let displayedCourses = 8;
let currentCourse = null;

// Функции фильтрации
function filterCourses() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedLevel = levelFilter.value;
    const selectedDuration = durationFilter.value;

    filteredCourses = coursesData.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm) ||
                            course.description.toLowerCase().includes(searchTerm) ||
                            course.instructor.toLowerCase().includes(searchTerm);

        const matchesCategory = !selectedCategory || course.category === selectedCategory;
        const matchesLevel = !selectedLevel || course.level === selectedLevel;

        let matchesDuration = true;
        if (selectedDuration) {
            switch (selectedDuration) {
                case 'short':
                    matchesDuration = course.duration.includes('1-4') || course.duration.includes('6');
                    break;
                case 'medium':
                    matchesDuration = course.duration.includes('1-3') || course.duration.includes('8') || course.duration.includes('10') || course.duration.includes('12');
                    break;
                case 'long':
                    matchesDuration = course.duration.includes('14') || course.duration.includes('16') || course.duration.includes('18');
                    break;
            }
        }

        return matchesSearch && matchesCategory && matchesLevel && matchesDuration;
    });

    displayedCourses = 8;
    renderCourses();
}

function getLevelText(level) {
    switch (level) {
        case 'beginner': return 'Начальный';
        case 'intermediate': return 'Средний';
        case 'advanced': return 'Продвинутый';
        default: return level;
    }
}

function getCategoryText(category) {
    switch (category) {
        case 'programming': return 'Программирование';
        case 'design': return 'Дизайн';
        case 'business': return 'Бизнес';
        case 'languages': return 'Языки';
        case 'science': return 'Наука';
        case 'other': return 'Другое';
        default: return category;
    }
}

function renderCourses() {
    const coursesToShow = filteredCourses.slice(0, displayedCourses);

    coursesGrid.innerHTML = coursesToShow.map(course => `
        <div class="course-card" onclick="openCourseModal(${course.id})">
            <div class="course-image">
                ${course.image}
            </div>
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <span class="course-level">${getLevelText(course.level)}</span>
                    <span class="course-duration">${course.duration}</span>
                </div>
                <div class="course-footer">
                    <span class="course-instructor">${course.instructor}</span>
                    <div class="course-rating">
                        <span>⭐ ${course.rating}</span>
                        <span>(${course.students} чел.)</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    loadMoreBtn.style.display = displayedCourses >= filteredCourses.length ? 'none' : 'block';
}

function loadMoreCourses() {
    displayedCourses += 8;
    renderCourses();
}

// Модальное окно курса
function openCourseModal(courseId) {
    currentCourse = coursesData.find(course => course.id === courseId);
    if (!currentCourse) return;

    const syllabusHtml = currentCourse.syllabus.map(item => `
        <div class="syllabus-item">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
        </div>
    `).join('');

    courseDetail.innerHTML = `
        <div class="course-detail-header">
            <h2 class="course-detail-title">${currentCourse.title}</h2>
            <div class="course-detail-meta">
                <span><i class="fas fa-user"></i> ${currentCourse.instructor}</span>
                <span><i class="fas fa-clock"></i> ${currentCourse.duration}</span>
                <span><i class="fas fa-signal"></i> ${getLevelText(currentCourse.level)}</span>
                <span><i class="fas fa-star"></i> ${currentCourse.rating}</span>
            </div>
            <p class="course-detail-description">${currentCourse.description}</p>
        </div>
        <div class="course-detail-content">
            <div class="course-info">
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <h4>${currentCourse.students}</h4>
                    <p>Студентов</p>
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <h4>${currentCourse.duration}</h4>
                    <p>Длительность</p>
                </div>
                <div class="info-item">
                    <i class="fas fa-graduation-cap"></i>
                    <h4>${getCategoryText(currentCourse.category)}</h4>
                    <p>Категория</p>
                </div>
                <div class="info-item">
                    <i class="fas fa-language"></i>
                    <h4>Русский</h4>
                    <p>Язык</p>
                </div>
            </div>

            <div class="course-syllabus">
                <h3 class="syllabus-title">Программа курса</h3>
                ${syllabusHtml}
            </div>

            <div class="course-actions">
                <button class="btn btn-primary" onclick="startCourse(${currentCourse.id})">
                    <i class="fas fa-play"></i> Начать курс
                </button>
                <button class="btn btn-secondary" onclick="closeCourseModal()">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        </div>
    `;

    courseModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
    courseModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Система прохождения курсов
function startCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    // Сохраняем прогресс в localStorage
    const progress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    if (!progress[courseId]) {
        progress[courseId] = {
            currentLesson: 0,
            completedLessons: [],
            started: true
        };
        localStorage.setItem('courseProgress', JSON.stringify(progress));
    }

    showCoursePlayer(course);
}

function showCoursePlayer(course) {
    const progress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    const courseProgress = progress[course.id] || { currentLesson: 0, completedLessons: [] };
    const currentLessonIndex = courseProgress.currentLesson;
    const currentLesson = course.lessons[currentLessonIndex];

    courseDetail.innerHTML = `
        <div class="course-player">
            <div class="player-header">
                <h2>${course.title}</h2>
                <div class="progress-info">
                    <span>Урок ${currentLessonIndex + 1} из ${course.lessons.length}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((currentLessonIndex + 1) / course.lessons.length) * 100}%"></div>
                    </div>
                </div>
            </div>

            <div class="lesson-content">
                <div class="lesson-header">
                    <h3>${currentLesson.title}</h3>
                    <div class="lesson-meta">
                        <span><i class="fas fa-clock"></i> ${currentLesson.duration}</span>
                        <span><i class="fas fa-${currentLesson.type === 'video' ? 'play-circle' : 'code'}"></i> ${currentLesson.type === 'video' ? 'Видео' : 'Интерактив'}</span>
                    </div>
                </div>

            <div class="lesson-body">
                <div class="lesson-content-wrapper">
                    ${renderLessonContent(currentLesson)}
                </div>
            </div>

                <div class="lesson-navigation">
                    <button class="btn btn-secondary" ${currentLessonIndex === 0 ? 'disabled' : ''} onclick="previousLesson(${course.id})">
                        <i class="fas fa-arrow-left"></i> Предыдущий
                    </button>
                    <button class="btn btn-primary" onclick="completeLesson(${course.id})">
                        <i class="fas fa-check"></i> ${currentLessonIndex === course.lessons.length - 1 ? 'Завершить курс' : 'Следующий урок'}
                    </button>
                </div>
            </div>

            <div class="lessons-list">
                <h4>Уроки курса</h4>
                <div class="lessons-items">
                    ${course.lessons.map((lesson, index) => `
                        <div class="lesson-item ${index === currentLessonIndex ? 'active' : ''} ${courseProgress.completedLessons.includes(index) ? 'completed' : ''}" onclick="goToLesson(${course.id}, ${index})">
                            <div class="lesson-status">
                                ${courseProgress.completedLessons.includes(index) ?
                                    '<i class="fas fa-check-circle"></i>' :
                                    '<i class="far fa-circle"></i>'}
                            </div>
                            <div class="lesson-info">
                                <h5>${lesson.title}</h5>
                                <span>${lesson.duration}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="player-actions">
                <button class="btn btn-secondary" onclick="closeCoursePlayer()">
                    <i class="fas fa-times"></i> Выйти из курса
                </button>
            </div>
        </div>
    `;
}

function previousLesson(courseId) {
    const progress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    if (progress[courseId] && progress[courseId].currentLesson > 0) {
        progress[courseId].currentLesson--;
        localStorage.setItem('courseProgress', JSON.stringify(progress));
        const course = coursesData.find(c => c.id === courseId);
        showCoursePlayer(course);
    }
}

function completeLesson(courseId) {
    const progress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    const course = coursesData.find(c => c.id === courseId);

    if (!progress[courseId]) {
        progress[courseId] = { currentLesson: 0, completedLessons: [] };
    }

    const currentLessonIndex = progress[courseId].currentLesson;

    // Отмечаем урок как завершенный
    if (!progress[courseId].completedLessons.includes(currentLessonIndex)) {
        progress[courseId].completedLessons.push(currentLessonIndex);
    }

    // Переходим к следующему уроку или завершаем курс
    if (currentLessonIndex < course.lessons.length - 1) {
        progress[courseId].currentLesson = currentLessonIndex + 1;
        localStorage.setItem('courseProgress', JSON.stringify(progress));
        showCoursePlayer(course);
    } else {
        // Курс завершен
        progress[courseId].completed = true;
        localStorage.setItem('courseProgress', JSON.stringify(progress));
        showCourseCompletion(course);
    }
}

function goToLesson(courseId, lessonIndex) {
    const progress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    if (!progress[courseId]) {
        progress[courseId] = { currentLesson: 0, completedLessons: [] };
    }
    progress[courseId].currentLesson = lessonIndex;
    localStorage.setItem('courseProgress', JSON.stringify(progress));
    const course = coursesData.find(c => c.id === courseId);
    showCoursePlayer(course);
}

function showCourseCompletion(course) {
    courseDetail.innerHTML = `
        <div class="course-completion">
            <div class="completion-header">
                <div class="completion-icon">
                    <i class="fas fa-trophy fa-4x"></i>
                </div>
                <h2>Поздравляем!</h2>
                <p>Вы успешно завершили курс "${course.title}"</p>
            </div>

            <div class="completion-stats">
                <div class="stat-item">
                    <span class="stat-number">${course.lessons.length}</span>
                    <span class="stat-label">уроков пройдено</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${course.duration}</span>
                    <span class="stat-label">времени затрачено</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">100%</span>
                    <span class="stat-label">завершено</span>
                </div>
            </div>

            <div class="completion-actions">
                <button class="btn btn-primary" onclick="downloadCertificate(${course.id})">
                    <i class="fas fa-download"></i> Скачать сертификат
                </button>
                <button class="btn btn-secondary" onclick="closeCoursePlayer()">
                    <i class="fas fa-home"></i> Вернуться к курсам
                </button>
            </div>
        </div>
    `;
}

function downloadCertificate(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    alert(`Сертификат о завершении курса "${course.title}" будет доступен для скачивания в ближайшее время.`);
}

function closeCoursePlayer() {
    openCourseModal(currentCourse.id);
}

// Функция для отображения контента урока
function renderLessonContent(lesson) {
    if (!lesson.content || typeof lesson.content === 'string') {
        // Старый формат контента (простой текст)
        return `
            <div class="lesson-video-placeholder">
                <div class="video-icon">
                    <i class="fas fa-${lesson.type === 'video' ? 'play' : 'code'} fa-3x"></i>
                </div>
                <p>${lesson.content}</p>
                <p><em>Это демо-версия. В реальном приложении здесь будет ${lesson.type === 'video' ? 'видео-плеер' : 'интерактивное задание'}.</em></p>
            </div>
        `;
    }

    // Новый формат контента с видео, теорией, кодом, заданиями и тестами
    let html = '';

    // Видео
    if (lesson.content.video) {
        html += renderVideoPlayer(lesson.content.video);
    }

    // Теория
    if (lesson.content.theory) {
        html += `
            <div class="lesson-theory">
                <h3>Теоретический материал</h3>
                <div class="theory-content">
                    ${lesson.content.theory}
                </div>
            </div>
        `;
    }

    // Примеры кода
    if (lesson.content.code) {
        html += `
            <div class="lesson-code">
                <h3>Примеры кода</h3>
                <div class="code-block">
                    <pre><code>${escapeHtml(lesson.content.code)}</code></pre>
                    <button class="copy-btn" onclick="copyToClipboard(this.previousElementSibling.textContent)">
                        <i class="fas fa-copy"></i> Копировать
                    </button>
                </div>
            </div>
        `;
    }

    // Практическое задание
    if (lesson.content.task) {
        html += `
            <div class="lesson-task">
                <h3>Практическое задание</h3>
                <div class="task-content">
                    <p>${lesson.content.task}</p>
                    <div class="code-editor">
                        <textarea id="codeInput" placeholder="Напишите ваш код здесь..."></textarea>
                        <div class="editor-actions">
                            <button class="btn btn-secondary" onclick="runCode()">Запустить код</button>
                            <button class="btn btn-secondary" onclick="clearCode()">Очистить</button>
                        </div>
                        <div id="codeOutput" class="code-output"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Тест для проверки знаний
    if (lesson.content.quiz && lesson.content.quiz.length > 0) {
        html += `
            <div class="lesson-quiz">
                <h3>Проверка знаний</h3>
                <div class="quiz-content">
                    ${renderQuiz(lesson.content.quiz)}
                </div>
            </div>
        `;
    }

    return html;
}

// Функция для отображения теста
function renderQuiz(quiz) {
    return quiz.map((question, index) => `
        <div class="quiz-question" data-correct="${question.correct}">
            <h4>${index + 1}. ${question.question}</h4>
            <div class="quiz-options">
                ${question.options.map((option, optionIndex) => `
                    <label class="quiz-option">
                        <input type="radio" name="quiz-${index}" value="${optionIndex}">
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <div class="quiz-actions">
            <button class="btn btn-primary" onclick="checkQuiz()">Проверить ответы</button>
            <div id="quizResult" class="quiz-result"></div>
        </div>
    `;
}

// Функция для проверки теста
function checkQuiz() {
    const questions = document.querySelectorAll('.quiz-question');
    let correctAnswers = 0;
    let totalQuestions = questions.length;

    questions.forEach(question => {
        const correctAnswer = parseInt(question.dataset.correct);
        const selectedOption = question.querySelector('input:checked');

        if (selectedOption) {
            const selectedValue = parseInt(selectedOption.value);
            if (selectedValue === correctAnswer) {
                correctAnswers++;
                selectedOption.closest('.quiz-option').classList.add('correct');
            } else {
                selectedOption.closest('.quiz-option').classList.add('incorrect');
                // Показать правильный ответ
                const correctOption = question.querySelector(`input[value="${correctAnswer}"]`);
                correctOption.closest('.quiz-option').classList.add('correct');
            }
        }
    });

    const resultDiv = document.getElementById('quizResult');
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    let resultClass = 'incorrect';
    let resultText = '';

    if (percentage >= 80) {
        resultClass = 'excellent';
        resultText = `Отлично! ${correctAnswers}/${totalQuestions} правильных ответов (${percentage}%)`;
    } else if (percentage >= 60) {
        resultClass = 'good';
        resultText = `Хорошо! ${correctAnswers}/${totalQuestions} правильных ответов (${percentage}%)`;
    } else {
        resultText = `Нужно подучить материал. ${correctAnswers}/${totalQuestions} правильных ответов (${percentage}%)`;
    }

    resultDiv.className = `quiz-result ${resultClass}`;
    resultDiv.textContent = resultText;
}

// Функция для копирования кода в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Показать временное уведомление
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'Код скопирован!';
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    });
}

// Функция для отображения видеоплеера
function renderVideoPlayer(video) {
    if (!video || !video.id) return '';

    let videoHtml = '';

    switch (video.type) {
        case 'youtube':
            videoHtml = `
                <div class="video-container">
                    <iframe
                        src="https://www.youtube.com/embed/${video.id}"
                        title="${video.title || 'Видео урок'}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            `;
            break;

        case 'vimeo':
            videoHtml = `
                <div class="video-container">
                    <iframe
                        src="https://player.vimeo.com/video/${video.id}"
                        title="${video.title || 'Видео урок'}"
                        frameborder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            `;
            break;

        case 'local':
            videoHtml = `
                <div class="video-container">
                    <video controls>
                        <source src="${video.src}" type="video/mp4">
                        <source src="${video.src}" type="video/webm">
                        Ваш браузер не поддерживает видео.
                    </video>
                </div>
            `;
            break;

        default:
            videoHtml = `
                <div class="video-placeholder">
                    <div class="video-icon">
                        <i class="fas fa-play-circle fa-4x"></i>
                    </div>
                    <p>${video.title || 'Видео урок'}</p>
                    <p><em>Видео недоступно в демо-версии</em></p>
                </div>
            `;
    }

    return `
        <div class="lesson-video">
            <h3>Видео материал</h3>
            ${videoHtml}
        </div>
    `;
}

// Функция для экранирования HTML символов
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Функция для запуска кода (симуляция)
function runCode() {
    const codeInput = document.getElementById('codeInput');
    const codeOutput = document.getElementById('codeOutput');

    if (!codeInput || !codeOutput) return;

    const code = codeInput.value.trim();

    if (!code) {
        codeOutput.innerHTML = '<span style="color: #ff6b6b;">Введите код для выполнения</span>';
        return;
    }

    // Симуляция выполнения Python кода
    let output = '';

    try {
        // Простая симуляция некоторых Python команд
        if (code.includes('print(')) {
            const printMatch = code.match(/print\((.*?)\)/);
            if (printMatch) {
                let content = printMatch[1];
                // Убираем кавычки
                content = content.replace(/["']/g, '');
                output = content;
            }
        } else if (code.includes('=')) {
            output = 'Код выполнен успешно (переменная создана)';
        } else {
            output = 'Код выполнен успешно';
        }
    } catch (error) {
        output = 'Ошибка в коде: ' + error.message;
    }

    codeOutput.innerHTML = `<pre>${output}</pre>`;
}

// Функция для очистки кода
function clearCode() {
    const codeInput = document.getElementById('codeInput');
    const codeOutput = document.getElementById('codeOutput');

    if (codeInput) codeInput.value = '';
    if (codeOutput) codeOutput.innerHTML = '';
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    renderCourses();

    // Фильтры
    searchInput.addEventListener('input', filterCourses);
    categoryFilter.addEventListener('change', filterCourses);
    levelFilter.addEventListener('change', filterCourses);
    durationFilter.addEventListener('change', filterCourses);

    // Загрузка дополнительных курсов
    loadMoreBtn.addEventListener('click', loadMoreCourses);

    // Модальное окно
    document.querySelector('.close').addEventListener('click', closeCourseModal);
    window.addEventListener('click', function(event) {
        if (event.target === courseModal) {
            closeCourseModal();
        }
    });

    // Форма контактов
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        alert(`Спасибо за ваше сообщение, ${data.name}! Мы свяжемся с вами в ближайшее время.`);

        contactForm.reset();
    });

    // Плавная прокрутка для навигации
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
