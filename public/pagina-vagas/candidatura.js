document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-canditadura");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const resposta = await fetch("/api/email/candidatura", {
        method: "POST",
        body: formData
      });

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.ok) {
        alert(dados.mensagem || "Candidatura enviada com sucesso!");
        form.reset();
      } else {
        alert(
          dados.mensagem ||
            "Ocorreu um erro ao enviar sua candidatura. Tente novamente mais tarde."
        );
      }
    } catch (erro) {
      console.error("Erro ao enviar candidatura:", erro);
      alert(
        "Não foi possível enviar sua candidatura no momento. Verifique sua conexão e tente novamente."
      );
    }
  });
});

