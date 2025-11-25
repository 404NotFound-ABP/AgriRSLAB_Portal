
(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Você precisa estar logado.");
        window.location.href = "/admin/login.html";
        return;
    }

    // Configura o botão de logout assim que o DOM estiver pronto
    window.addEventListener('DOMContentLoaded', () => {
        const logoutForm = document.getElementById('logoutForm');
        if (logoutForm) {
            logoutForm.addEventListener('submit', (e) => {
                e.preventDefault(); // Impede o envio do form para /logout
                localStorage.removeItem("token");
                window.location.href = "/admin/login.html";
            });
        }
    });
})();