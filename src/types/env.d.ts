interface ImportMetaEnv {
  readonly VITE_ACTIVE_PROVIDER?: string;
  readonly VITE_BUILD_TIME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}