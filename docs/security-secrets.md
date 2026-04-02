# Seguridad de secretos

## Regla principal
Nunca subir secretos a GitHub:
- Tokens de APIs (Facebook, Instagram, GitHub)
- `JWT_SECRET`
- Credenciales de DB o servicios externos

## Flujo recomendado en equipo
1. Secretos en archivos `.env` locales (no versionados).
2. Compartir secretos solo por canal privado (por ejemplo Slack privado / gestor de secretos).
3. Mantener en repo solo ejemplos sin secretos reales:
   - `backend/.env.example`
   - `frontend/.env.example`

## Estado actual del repo
- `.gitignore` ignora archivos `.env`.
- Se añadieron archivos de ejemplo `.env.example`.

## Checklist antes de hacer push
- `git status` no debe mostrar `.env`
- Revisar staged files:
  ```bash
  git diff --cached
  ```
- Buscar secretos antes de push:
  ```bash
  git grep -n "token\\|secret\\|password\\|Bearer"
  ```

## Si un secreto ya fue subido
1. Rotar/revocar inmediatamente el secreto comprometido.
2. Removerlo del historial Git (BFG o `git filter-repo`).
3. Forzar push del historial limpio (coordinado con el equipo).
