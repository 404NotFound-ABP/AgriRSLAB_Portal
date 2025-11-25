document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".envio-de-email-contato");
  const btnSubmit = document.getElementById("btn-contato-submit");
  const msgContainer = document.getElementById("contato-message");

  if (!form || !btnSubmit || !msgContainer) {
    return;
  }

   function showMessage(message, type) {
    msgContainer.textContent = message;
    msgContainer.className = `form-message ${type}`;
    msgContainer.style.display = 'block';
    // Oculta a mensagem após 5 segundos
    setTimeout(() => { msgContainer.style.display = 'none'; }, 5000); 
  }

    const customAlert = (message, isError = false) => {
    showMessage(message, isError ? 'error' : 'success');
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = form.querySelector("#nome")?.value?.trim() || "";
    const email = form.querySelector("#email")?.value?.trim() || "";
    const assunto = form.querySelector("#assunto")?.value?.trim() || "";
    const comentario = form.querySelector("#comentario")?.value?.trim() || "";

    msgContainer.style.display = 'none';

    if (!nome || !email || !comentario) {
      alert("Por favor, preencha nome, e-mail e mensagem.");
      return;
    }

     btnSubmit.classList.add('loading');

    try {
      const resposta = await fetch("/api/email/contato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome,
          email,
          assunto,
          comentario
        })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.ok) {
        alert(dados.mensagem || "Mensagem enviada com sucesso!");
        form.reset();
      } else {
        alert(
          dados.mensagem ||
            "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde."
        );
      }
    } catch (erro) {
      console.error("Erro ao enviar formulário de contato:", erro);
      alert(
        "Não foi possível enviar sua mensagem no momento. Verifique sua conexão e tente novamente."
      );
    }finally {
      btnSubmit.classList.remove('loading');
    }
  });
});

