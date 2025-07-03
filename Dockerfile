FROM nodesource/nsolid:latest

LABEL maintainer "Benjamin Nguyen <ben85629@gmail.com>"
WORKDIR /app
# Install our dependencies (libfontconfig for phantomjs)
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y --no-install-recommends \
  bzip2 \
  ca-certificates \
  curl \
  git \
  libfontconfig \
  ttf-wqy-microhei \
  ttf-wqy-zenhei \ 
  software-properties-common \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget \
  && rm -rf /var/lib/apt/lists/*

# this is faster via npm run build-docker
COPY package.json ./package.json
RUN npm install --devDependencies \
  && npm cache verify
# Copy source over and create configs dir

# Make user and create necessary directories
ENV UID=1000
ENV GID=1000

RUN addgroup -g $GID user && \
  adduser -D -u $UID -G user user &&

RUN mkdir -p /configs /data
COPY ./public ./public
RUN chown -R user:user public /data
USER user

EXPOSE 8080
ENV NODE_ENV=production

CMD ["npm", "start"]
