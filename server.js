const WebSocket = require('ws');
const http = require('http');

// Создание HTTP-сервера
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("WebSocket сервер работает!");
});

// Создание WebSocket-сервера
const wss = new WebSocket.Server({ server });

let adminSocket = null;
let pendingUsers = [];

// Обработка подключения
wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Администратор подключается
        if (data.type === 'admin') {
            adminSocket = ws;
            console.log('Админ подключен');
            if (pendingUsers.length > 0) {
                adminSocket.send(JSON.stringify({ type: 'pending_users', users: pendingUsers }));
            }
        }

        // Пользователь запрашивает доступ
        if (data.type === 'access_request') {
            pendingUsers.push({ name: data.name, socket: ws });
            console.log(`Запрос доступа от ${data.name}`);
            if (adminSocket) {
                adminSocket.send(JSON.stringify({ type: 'access_request', name: data.name }));
            }
        }

        // Администратор даёт доступ
        if (data.type === 'access_granted') {
            const user = pendingUsers.find((user) => user.name === data.name);
            if (user) {
                user.socket.send(JSON.stringify({ type: 'access_granted' }));
                pendingUsers = pendingUsers.filter((u) => u.name !== data.name);
            }
        }

        // Отправка результатов теста администратору
        if (data.type === 'test_results' && adminSocket) {
            adminSocket.send(JSON.stringify({
                type: 'test_results',
                name: data.name,
                score: data.score
            }));
        }
    });
});

// Запуск сервера
server.listen(8765, () => {
    console.log('Сервер запущен на ws://185.185.69.111:8765');
});