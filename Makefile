CURRENT_MAKEFILE := $(lastword $(MAKEFILE_LIST))
ROOT_DIR := $(realpath $(dir $(abspath $(CURRENT_MAKEFILE))))

include $(ROOT_DIR)/scripts/make/variables.mk

.DEFAULT_GOAL := help

DOCKER_IMAGE_NAME ?= bytestash
DOCKER_IMAGE_DATE ?= $(shell date +'%y.%m.%d')
DOCKER_IMAGE_VERSION ?= $(DOCKER_IMAGE_DATE)-$(shell git rev-parse --abbrev-ref HEAD | sed 's/[/]/-/g')-$(shell git rev-parse --short HEAD)
REGISTRY ?= wiz

ifeq ($(REGISTRY),wiz)
DOCKER_REGISTRY := registry.wiz.mo
DOCKER_NAMESPACE := wiz-tools
DOCKER_USERNAME ?= $(WIZ_REGISTRY_USER)
DOCKER_CONFIG_PATH ?= ~/.docker/$(DOCKER_REGISTRY)_$(DOCKER_USERNAME)
DOCKER_PLATFORMS ?= linux/amd64
DOCKER_IMAGE := $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/$(DOCKER_IMAGE_NAME)
else ifeq ($(REGISTRY),dockerhub)
DOCKER_REGISTRY := docker.io
DOCKER_NAMESPACE := wizmacaucom
DOCKER_USERNAME ?= wizmacaucom
DOCKER_CONFIG_PATH ?= ~/.docker/docker.io_$(DOCKER_USERNAME)
DOCKER_PLATFORMS ?= linux/amd64,linux/arm64
DOCKER_IMAGE := $(DOCKER_NAMESPACE)/$(DOCKER_IMAGE_NAME)
else
$(error REGISTRY must be wiz or dockerhub)
endif

DOCKER_BUILD_CONTEXT ?= $(ROOT_DIR)
DOCKER_FILE_PATH ?= $(ROOT_DIR)/Dockerfile
DOCKER_BUILD_ARGS ?=
DOCKER := docker --config $(DOCKER_CONFIG_PATH)

# --config drops the current context, so pin DOCKER_HOST to the active
# context's endpoint or docker falls back to /var/run/docker.sock.
DOCKER_HOST ?= $(shell docker context inspect --format '{{.Endpoints.docker.Host}}' 2>/dev/null)
export DOCKER_HOST

.PHONY: help

##@ General
help: ## 顯示可用目標與目前映像設定
	@printf "$(COLOR_BOLD)%s$(COLOR_RESET)\n" "Docker 映像設定"
	@printf "$(COLOR_GREEN)%-24s$(COLOR_RESET) %s\n" "REGISTRY" "$(REGISTRY)"
	@printf "$(COLOR_GREEN)%-24s$(COLOR_RESET) %s\n" "DOCKER_IMAGE" "$(DOCKER_IMAGE)"
	@printf "$(COLOR_GREEN)%-24s$(COLOR_RESET) %s\n" "DOCKER_IMAGE_VERSION" "$(DOCKER_IMAGE_VERSION)"
	@printf "$(COLOR_GREEN)%-24s$(COLOR_RESET) %s\n\n" "DOCKER_PLATFORMS" "$(DOCKER_PLATFORMS)"
	@awk 'BEGIN {FS = ":.*##"; printf "使用方式：\n  make \033[36m<目標>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2} /^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5)}' $(MAKEFILE_LIST)

##@ Docker
include $(ROOT_DIR)/scripts/make/docker.mk
