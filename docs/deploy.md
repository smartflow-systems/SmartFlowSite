# Deploys (GitHub Pages)

- Every push to `dev` & `main` runs CI. If CI is green on **main**, we build and deploy a static site to **GitHub Pages**.
- Change build command/output directory:
  ```bash
  tools/deploy-config.sh 'npm run build' dist
