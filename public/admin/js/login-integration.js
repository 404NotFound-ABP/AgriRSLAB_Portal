document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const mail = document.getElementById("mail").value;
  const senha = document.getElementById("senha").value;
  const msgElement = document.getElementById("msg");

  msgElement.innerText = "Autenticando...";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao fazer login");
    }

    // SALVAR O TOKEN
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    msgElement.innerText = "Login realizado! Redirecionando...";
    msgElement.style.color = "green";

    // Redireciona para a dashboard
    setTimeout(() => {
<<<<<<< HEAD
        window.location.href = "/admin/artigos-admin.html"; // Ajuste para sua página inicial do admin
=======
        window.location.href = "/admin/artigos-admin.html"; // Seletor para a página inicial do admin
>>>>>>> 6df3454a050d31f970cccc2bd1bc604c16cd96ad
    }, 1000);

  } catch (err) {
    msgElement.innerText = err.message;
    msgElement.style.color = "red";
  }
});