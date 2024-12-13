const socket = new WebSocket("ws://185.185.69.111:8765");

let accessGranted = false;

// Функция запроса доступа
function requestAccess() {
    const name = prompt('Введите ваше ФИО:');
    if (name) {
        localStorage.setItem('name', name);
        // Wait for the socket to open before sending the request
        socket.addEventListener('open', () => {
            socket.send(JSON.stringify({ type: 'access_request', name }));
        });
    } else {
        // If no name is entered, keep prompting until valid input
        alert('Имя обязательно!');
        requestAccess();
    }
}

// Запрос разрешения при загрузке
document.addEventListener('DOMContentLoaded', requestAccess);

// Обработка сообщений от сервера
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'access_granted') {
        alert('Доступ разрешён! Вы можете приступить к тесту.');
        accessGranted = true;
        document.getElementById('quiz-form').style.display = 'block'; // Show the quiz form
        document.getElementById('timer').style.display = 'block'; // Show the timer
    }
});

// Обработка отправки теста
document.getElementById("quiz-form").addEventListener('submit', (e) => {
    e.preventDefault();
    if (!accessGranted) {
        alert('Доступ не разрешён!');
        return;
    }

    const answers = new FormData(e.target);
    let score = 0;
    for (const [key, value] of answers.entries()) {
        if (value === '2') score++; // Проверка правильных ответов
    }

    socket.send(JSON.stringify({
        type: 'test_results',
        name: localStorage.getItem('name'),
        score
    }));

    alert('Ваши результаты отправлены!');
});