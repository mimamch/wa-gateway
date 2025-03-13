#!/bin/sh
set -x
# membuat image dngn format ghcr.io, namespace mfth12, repositori karsajobs-ui dan tag latest
docker build -t ghcr.io/mfth12/wa-gateway2-stie:latest .
# minikube image build -t ghcr.io/mfth12/simpeg-stie-backend:latest .
# menampilkan daftar images yang ada di lokal
docker images
# login ke ghcr.io (GitHub Container Registry)
echo $CR_PAT | docker login ghcr.io -u mfth12 --password-stdin
# mengunggah image ke ghcr.io
docker push ghcr.io/mfth12/wa-gateway2-stie:latest