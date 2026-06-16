#!/bin/sh

set -e

cmd_container () {
  # https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
  tag_version="v1-$(date +%Y%m%d)-${GITHUB_RUN_NUMBER}"

  echo $QUAY_PASSWORD | docker login quay.io -u $QUAY_USERNAME --password-stdin

  full_tag="quay.io/librasteve/grammar-editor:${tag_version}"
  docker build -t $full_tag .
  latest_tag="quay.io/librasteve/grammar-editor:latest"
  docker tag $full_tag $latest_tag
  docker push $full_tag
  docker push $latest_tag

  worker_full_tag="quay.io/librasteve/grammar-worker:${tag_version}"
  docker build -f Dockerfile.worker -t $worker_full_tag .
  worker_latest_tag="quay.io/librasteve/grammar-worker:latest"
  docker tag $worker_full_tag $worker_latest_tag
  docker push $worker_full_tag
  docker push $worker_latest_tag
}

if [ -z $1 ]; then
  cmd_container
fi

CMD=$1
shift
case $CMD in
  container)
    cmd_$CMD $@
    ;;
  *)
    echo "unknown command $CMD"
    exit 1
    ;;
esac
