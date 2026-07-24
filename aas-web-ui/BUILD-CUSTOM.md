# BUILD-CUSTOM — customized BaSyx Web UI image (AAS Creator feature)

Fork delta vs upstream: 4 source files (see git log) + 2 lines in the
Dockerfile build stage (ARG/ENV VITE_AAS_CREATOR_URL). Everything
else — nginx.conf, entrypoint.sh, runtime env handling — is upstream.

## Build

Build context is this directory (aas-web-ui/), same as upstream:

    cd aas-web-ui

    docker build \
      --platform linux/amd64 \
      --build-arg VITE_AAS_CREATOR_URL=https://<creator-service-url> \
      -t <dockerhub-user>/basyx-web-ui-custom:1.0 \
      .

Notes:
- --platform linux/amd64 is MANDATORY when building on Apple Silicon;
  Cloud Run only runs amd64 images.
- VITE_AAS_CREATOR_URL is inlined into the JS bundle at build time.
  Changing the creator URL later requires a REBUILD, not a restart.
- The pnpm cache mount needs BuildKit (default in current Docker).
  If the build fails on --mount=type=cache, set DOCKER_BUILDKIT=1.
- pnpm install runs with --frozen-lockfile: pnpm-lock.yaml must match
  package.json. This feature adds no dependencies, so if the lockfile
  shows as modified in git, `git restore pnpm-lock.yaml` first.

## Local smoke test

    docker run --rm -p 3000:3000 <dockerhub-user>/basyx-web-ui-custom:1.0

Open http://localhost:3000 and check /aascreator renders. Preview and
Download only work if the creator service is running (make run in the
creator repo); Push requires the deployed creator with /upload.

## Push to Docker Hub

    docker push <dockerhub-user>/basyx-web-ui-custom:1.0
    docker tag  <dockerhub-user>/basyx-web-ui-custom:1.0 <dockerhub-user>/basyx-web-ui-custom:latest
    docker push <dockerhub-user>/basyx-web-ui-custom:latest

## Deploy (Cloud Run)

The existing Web UI Cloud Run service config (port, runtime env vars,
domain mapping for aas.djmekki.com) carries over unchanged — update
only the image reference to the new tag.

## Coupled requirements on the creator service

- Its CORS_ORIGINS must include https://aas.djmekki.com
- POST /api/convert/upload must be deployed (creator commit 11+),
  otherwise the "Push to BaSyx" button (admins only) returns 404;
  Preview and Download work regardless.

## Rebuild flow when the creator URL changes

    cd aas-web-ui
    docker build --platform linux/amd64 \
      --build-arg VITE_AAS_CREATOR_URL=https://<new-url> \
      -t <dockerhub-user>/basyx-web-ui-custom:<new-tag> .
    docker push <dockerhub-user>/basyx-web-ui-custom:<new-tag>
    # then update the Cloud Run service image reference
