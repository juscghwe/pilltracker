FROM node:24-bookworm

# Install basic development tools
RUN apt update && apt install -y \
    sqlite3 \
    less \
    man-db \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Set default working directory inside the container
WORKDIR /workspace