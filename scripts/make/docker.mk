.PHONY: docker-config-init docker-login docker-build docker-build-and-push docker-push docker-image

docker-config-init: ## 初始化 Docker 設定目錄與 buildx 外掛
	@mkdir -p $(DOCKER_CONFIG_PATH)/cli-plugins
	@if [ -e "$(HOME)/.docker/cli-plugins/docker-buildx" ] && [ ! -e "$(subst ~,$(HOME),$(DOCKER_CONFIG_PATH))/cli-plugins/docker-buildx" ] && [ ! -L "$(subst ~,$(HOME),$(DOCKER_CONFIG_PATH))/cli-plugins/docker-buildx" ]; then ln -s "$(HOME)/.docker/cli-plugins/docker-buildx" "$(subst ~,$(HOME),$(DOCKER_CONFIG_PATH))/cli-plugins/docker-buildx"; fi

docker-login: docker-config-init ## 登入 Docker Registry
	@echo -e "$(COLOR_GREEN)登入 Docker 倉庫：$(DOCKER_REGISTRY)$(COLOR_RESET)"
	$(DOCKER) login --username=$(DOCKER_USERNAME) $(DOCKER_REGISTRY)

docker-build: docker-config-init ## 建置本機原生平台 Docker 映像
	@echo -e "$(COLOR_GREEN)建置 Docker 映像：$(DOCKER_IMAGE):$(DOCKER_IMAGE_VERSION)$(COLOR_RESET)"
	$(DOCKER) buildx build --load $(DOCKER_BUILD_ARGS) -f $(DOCKER_FILE_PATH) -t $(DOCKER_IMAGE):$(DOCKER_IMAGE_VERSION) -t $(DOCKER_IMAGE):latest $(DOCKER_BUILD_CONTEXT)

docker-build-and-push: docker-config-init ## 建置並推送多平台 Docker 映像
	@echo -e "$(COLOR_GREEN)建置並推送 Docker 映像：$(DOCKER_IMAGE):$(DOCKER_IMAGE_VERSION)$(COLOR_RESET)"
	$(DOCKER) buildx build --platform $(DOCKER_PLATFORMS) --push $(DOCKER_BUILD_ARGS) -f $(DOCKER_FILE_PATH) -t $(DOCKER_IMAGE):$(DOCKER_IMAGE_VERSION) -t $(DOCKER_IMAGE):latest $(DOCKER_BUILD_CONTEXT)

docker-push: ## 推送本機 Docker 映像的版本與 latest 標籤
	@echo -e "$(COLOR_GREEN)推送 Docker 映像：$(DOCKER_IMAGE):$(DOCKER_IMAGE_VERSION)$(COLOR_RESET)"
	$(DOCKER) push $(DOCKER_IMAGE):$(DOCKER_IMAGE_VERSION)
	@echo -e "$(COLOR_GREEN)推送 Docker 映像：$(DOCKER_IMAGE):latest$(COLOR_RESET)"
	$(DOCKER) push $(DOCKER_IMAGE):latest

docker-image: ## 顯示映像名稱與版本標籤
	@echo $(DOCKER_IMAGE):$(DOCKER_IMAGE_VERSION)
