declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (resp: { credential?: string }) => void;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Identity script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Identity script failed to load."));
    document.head.appendChild(script);
  });
}

export async function requestGoogleIdToken(clientId: string) {
  await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    let done = false;
    const finish = (value?: string, error?: Error) => {
      if (done) return;
      done = true;
      if (error) reject(error);
      else if (value) resolve(value);
      else reject(new Error("Google login cancelled."));
    };

    try {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        callback: (response) => {
          if (response.credential) {
            finish(response.credential);
            return;
          }
          finish(undefined, new Error("Google login failed."));
        },
      });
      window.google?.accounts.id.prompt();
      window.setTimeout(() => finish(undefined, new Error("Google login timed out. Please try again.")), 20000);
    } catch (error) {
      finish(undefined, error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export {};
