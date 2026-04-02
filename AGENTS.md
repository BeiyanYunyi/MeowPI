# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the application code. Use `src/pages/` for route-level Vue single-file components, `src/components/` for reusable UI, `src/data/` for inventory/questionnaire datasets and related types, and `src/utils/` for shared helpers. Entry files live at `src/App.vue` and `src/dev.ts`. Root config files include [`vite.config.ts`](/Users/beiyanyunyi/projects/MeowPI/vite.config.ts), [`uno.config.ts`](/Users/beiyanyunyi/projects/MeowPI/uno.config.ts), and [`eslint.config.js`](/Users/beiyanyunyi/projects/MeowPI/eslint.config.js).

## Import Alias

Use `#/` to import from `src/` for cleaner paths. For example, `import Selector from '#/components/Selector.vue'`. This is configured in `tsconfig.json` and `vite.config.ts`.

## Build, Test, and Development Commands

Use `pnpm` for all local work.

- `pnpm install`: install dependencies from `pnpm-lock.yaml`.
- `pnpm dev`: start the Vite development server for the UI.
- `pnpm build`: produce a production build and run `vue-tsc --noEmit`.
- `pnpm preview`: serve the built app locally for a quick smoke test.
- `pnpm lint`: run ESLint across the repository.

## Coding Style & Naming Conventions

Formatting is defined in [`.prettierrc.toml`](/Users/beiyanyunyi/projects/MeowPI/.prettierrc.toml): 2-space indentation, semicolons, single quotes, trailing commas, and 100-column wrapping. ESLint uses `@antfu/eslint-config` with Vue support, so fix lint issues before opening a PR.

Prefer Vue SFCs for UI and TypeScript modules for data/utilities. Name Vue components in `PascalCase` (`Selector.vue`), utility files in `camelCase` (`createContext.ts`), and keep data modules descriptive (`question.ts`, `scales.ts`).

## Testing Guidelines

Automated tests now live under the top-level `tests/` directory using `*.test.ts` naming. Even with test coverage in place, treat `pnpm build` as the required smoke test before submitting changes. Document the checks you ran in your PR.
