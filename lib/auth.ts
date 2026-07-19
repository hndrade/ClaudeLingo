import {
  type User,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const CHAVE_EMAIL_PENDENTE = "claudelingo:emailParaLink";

let primeiroEstado: Promise<User | null> | null = null;

// Resolve assim que o SDK confirma o estado inicial de login (sempre emite uma
// vez, com usuário ou null). Evita telas piscando entre "carregando" e "logado"
// a cada nova página, sem exigir que cada componente reimplemente essa espera.
export function usuarioAtual(): Promise<User | null> {
  if (!primeiroEstado) {
    primeiroEstado = new Promise((resolve) => {
      const cancelar = onAuthStateChanged(auth, (usuario) => {
        cancelar();
        resolve(usuario);
      });
    });
  }
  return primeiroEstado;
}

export function observarUsuario(callback: (usuario: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function entrarComGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

export async function enviarLinkMagico(email: string): Promise<void> {
  const urlRetorno = window.location.origin + window.location.pathname;
  await sendSignInLinkToEmail(auth, email, { url: urlRetorno, handleCodeInApp: true });
  window.localStorage.setItem(CHAVE_EMAIL_PENDENTE, email);
}

// Chamar ao montar a página de login: se a URL atual é um link mágico, conclui
// o login. Retorna true se um login foi concluído agora.
export async function completarLoginComLinkSeAplicavel(): Promise<boolean> {
  const url = window.location.href;
  if (!isSignInWithEmailLink(auth, url)) return false;
  let email = window.localStorage.getItem(CHAVE_EMAIL_PENDENTE);
  if (!email) {
    email = window.prompt("Confirme o e-mail usado para pedir o link de acesso:");
  }
  if (!email) return false;
  await signInWithEmailLink(auth, email, url);
  window.localStorage.removeItem(CHAVE_EMAIL_PENDENTE);
  return true;
}

export async function sair(): Promise<void> {
  await signOut(auth);
}
