"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completarLoginComLinkSeAplicavel, entrarComGoogle, enviarLinkMagico, observarUsuario } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Se a URL atual é o link mágico que o usuário recebeu por e-mail, conclui
    // o login aqui mesmo antes de checar se já existe uma sessão.
    completarLoginComLinkSeAplicavel().catch(() => setErro("Não deu para confirmar o link. Peça um novo."));
    const cancelar = observarUsuario((usuario) => {
      if (usuario) router.replace("/");
    });
    return cancelar;
  }, [router]);

  async function comGoogle() {
    if (entrando) return;
    setEntrando(true);
    setErro(null);
    try {
      await entrarComGoogle();
    } catch {
      setErro("Não deu para entrar com Google agora. Tente de novo.");
    } finally {
      setEntrando(false);
    }
  }

  async function comLinkMagico() {
    if (entrando || !email.includes("@")) return;
    setEntrando(true);
    setErro(null);
    try {
      await enviarLinkMagico(email);
      setLinkEnviado(true);
    } catch {
      setErro("Não deu para enviar o link agora. Tente de novo.");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-bold text-acento">ClaudeLingo</h1>
      <p className="mt-1 text-sm text-tinta/70">IA aplicada, do zero ao prompt de alto impacto.</p>

      <button
        type="button"
        disabled={entrando}
        onClick={comGoogle}
        className="mt-8 w-full rounded-xl bg-acento py-3 font-semibold text-white disabled:opacity-40"
      >
        Entrar com Google
      </button>

      <div className="mt-6">
        {linkEnviado ? (
          <p className="rounded-xl border border-tinta/15 bg-cartao px-4 py-3 text-sm text-tinta">
            Link enviado para <strong>{email}</strong>. Abra seu e-mail e toque no link para entrar; a sessão
            sincroniza seu progresso em qualquer aparelho.
          </p>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta/60">
              Ou entre por link mágico, sem senha
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="min-w-0 flex-1 rounded-xl border border-tinta/15 bg-cartao px-4 py-3 text-tinta placeholder:text-tinta/40"
              />
              <button
                type="button"
                disabled={entrando || !email.includes("@")}
                onClick={comLinkMagico}
                className="rounded-xl bg-acento px-5 py-3 font-semibold text-white disabled:opacity-40"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </div>

      {erro && <p className="mt-4 text-sm text-erro">{erro}</p>}

      <p className="mt-6 text-xs text-tinta/50">
        Seu progresso fica salvo na sua conta e sincroniza entre computador e celular.
      </p>
    </main>
  );
}
