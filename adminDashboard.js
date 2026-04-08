import { db } from './src/pages/utils/firebaseConfig.js';

function loadDashboard() {
    const loadingScreen = document.getElementById("loadingScreen");
    const playerName = document.getElementById('playerName');
    const tableBody = document.getElementById('tableBody');
    const totalPlayers = document.getElementById('totalPlayers');
    const totalAdmins = document.getElementById('totalAdmins');
    const totalUsers = document.getElementById('totalUsers');

    const gameRef = db.ref('webGame');

    gameRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        let playersCount = 0;
        let adminsCount = 0;
        let usersCount = 0;
        let tableHtml = '';

        Object.keys(data).forEach(playerID => {
            const user = data[playerID];
            playersCount++;

            const isAdmin = user.adminMode === true;
            if (isAdmin) adminsCount++; else usersCount++;

            const lastActive = user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A';

            tableHtml += `
                <tr>
                    <td>${lastActive}</td>
                    <td>${playerID}</td>
                    <td>${user.email || '---'}</td>
                    <td>${user.name || '---'}</td>
                    <td>${user.gender}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="${isAdmin ? 'role-admin' : 'role-user'}">
                        ${isAdmin ? '[ADMIN]' : '[PLAYER]'}
                    </td>
                </tr>
            `;
        });

        playerName.innerText = user.name || "User";
        totalPlayers.innerText = playersCount;
        totalAdmins.innerText = adminsCount;
        totalUsers.innerText = usersCount;
        tableBody.innerHTML = tableHtml;
    });
}
document.addEventListener('DOMContentLoaded', loadDashboard);