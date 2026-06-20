# Dockerfile: Use Corepack for Yarn v4

## Goal
Update Dockerfile to use Corepack (built into Node.js 20) instead of relying on system yarn, enabling Yarn v4.17.0 as specified in `packageManager`.

> **注意**：`src/services/Dockerfile` 後續已刪除，後端不再需要獨立的 Docker 部署配置。

## Tasks
- [x] Remove `npm i -g npm` from build stage
- [x] Add `corepack enable && corepack install` in build stage
- [x] Add `corepack enable && corepack install` in runtime stage
- [x] Update yarn cache mount path for compat

## Result
Dockerfile updated successfully.
