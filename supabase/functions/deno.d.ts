declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
  }

  const env: Env;

  function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: {
      port?: number;
      hostname?: string;
      signal?: AbortSignal;
    }
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  // Minimal type shim for editor/TS
  export const createClient: (...args: any[]) => any;
}
