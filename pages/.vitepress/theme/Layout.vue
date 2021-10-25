<template>
  <el-container class="page">
    <el-header>
      <el-row class="header">
        <h1>Flick It</h1>
        <div class="spacer"></div>
        <a
          class="github-icon"
          href="https://github.com/cmgriffing/flick-it"
          rel="noopener"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            /></svg
        ></a>
        <el-button
          @click="
            () => {
              if (tour) {
                tour.start();
              }
            }
          "
        >
          Help
        </el-button>
      </el-row>
    </el-header>
    <el-container>
      <el-aside id="config-step" class="config-section">
        <div id="channel-name-step">
          <!-- timeout per game -->
          <el-label>
            <div>
              Twitch channel name
            </div>
            <el-input
              label="Twitch channel name"
              v-model="channelName"
              @change="channelName = $event"
            />
          </el-label>
        </div>
        <div id="other-config-step">
          <div>
            <!-- timeout per game -->
            <el-label>
              <div>
                Game Length
              </div>
              <el-input-number
                label="Game Length"
                v-model="gameTimeoutSeconds"
                :min="1"
                :max="180"
                @change="gameTimeoutSeconds = parseInt($event)"
              />
            </el-label>
          </div>
          <div>
            <!-- entries per user -->
            <el-label>
              <div>
                Entries per user
              </div>
              <el-input-number
                label="Entries Per User"
                v-model="entriesPerUser"
                :min="1"
                :max="100"
                @change="entriesPerUser = parseInt($event)"
              />
            </el-label>
          </div>
          <!-- entries at a time -->
          <div>
            <el-label>
              <div>
                Entries at once
              </div>
              <el-input-number
                label="Entries at Once"
                v-model="entriesAtOnce"
                :min="1"
                :max="100"
                @change="entriesAtOnce = parseInt($event)"
              />
            </el-label>
          </div>
          <!-- target size -->
          <div>
            <el-label>
              <div>
                Target size
              </div>
              <el-input-number
                label="Target size"
                v-model="targetSize"
                :min="120"
                :max="420"
                @change="targetSize = parseInt($event)"
              />
            </el-label>
          </div>
          <!-- base ball size -->
          <div>
            <el-label>
              <div>
                Base ball size
              </div>
              <el-input-number
                label="Base ball size"
                v-model="baseBallSize"
                :min="1"
                :max="100"
                @change="baseBallSize = parseInt($event)"
              />
            </el-label>
          </div>
          <!-- max ball size -->
          <div>
            <el-label>
              <div>
                Max ball size
              </div>
              <el-input-number
                label="Max ball size"
                v-model="maxBallSize"
                :min="1"
                :max="100"
                @change="maxBallSize = parseInt($event)"
              />
            </el-label>
          </div>
        </div>
        <!-- HMMMMMM, other ideas -->
        <!--   -->
      </el-aside>
      <el-main class="preview-section">
        <div id="player-url-step">
          <el-input
            id="player-url-element"
            class="player-url-element"
            ref="playerUrlElement"
            :modelValue="getPlayerUrl()"
            @focus="copyUrlToClipboard('input')()"
          >
            <template #prepend>
              <el-button @click="copyUrlToClipboard()()">Copy</el-button>
            </template>
          </el-input>
        </div>
        <iframe id="player-step" class="player" :src="getPlayerUrl()" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";

import { ElMessage } from "element-plus";

import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import "./welcome.css";

const tour = new Shepherd.Tour({
  defaultStepOptions: {
    classes: "shadow-md bg-purple-dark",
    scrollTo: true,
  },
  cancelIcon: {
    enabled: true,
  },
  classes: "class-1 class-2",
  scrollTo: {
    behavior: "smooth",
    block: "center",
  },
  useModalOverlay: true,
});

tour.addStep({
  id: "config-step",
  text: "Welcome. Getting started is quick and easy.",
  buttons: [
    {
      action: () => {
        window.localStorage.setItem(ONBOARDING_COMPLETE, true);
        tour.cancel();
      },
      secondary: true,
      text: "Exit",
    },
    {
      text: "Next",
      action: tour.next,
    },
  ],
});

tour.addStep({
  id: "channel-name-step",
  text:
    "Enter you channel name so that the game can listen to your chat's commands.",
  attachTo: {
    element: "#channel-name-step",
    on: "right",
  },
  buttons: [
    {
      action: tour.back,
      secondary: true,
      text: "Back",
    },
    {
      text: "Next",
      action: tour.next,
    },
  ],
});

tour.addStep({
  id: "other-config-step",
  text: "You can also customize some of the rules of the game.",
  attachTo: {
    element: "#other-config-step",
    on: "right",
  },
  buttons: [
    {
      action: tour.back,
      secondary: true,
      text: "Back",
    },
    {
      text: "Next",
      action: tour.next,
    },
  ],
});

tour.addStep({
  id: "player-url-step",
  text:
    "Copy your url and paste it into a BrowserSource in your streaming software. Make the dimensions of the browser source equal to your stream output.",
  attachTo: {
    element: "#player-url-step",
    on: "bottom",
  },
  buttons: [
    {
      action: tour.back,
      secondary: true,
      text: "Back",
    },
    {
      text: "Next",
      action: tour.next,
    },
  ],
});

tour.addStep({
  id: "player-step",
  text:
    "This preview is a poor representation of the game physics. We recommend you copy the URL to a new browser window and make it the size of your stream output.",
  attachTo: {
    element: "#player-step",
    on: "top",
  },
  buttons: [
    {
      action: tour.back,
      secondary: true,
      text: "Back",
    },
    {
      text: "Finish",
      action: () => {
        window.localStorage.setItem(ONBOARDING_COMPLETE, true);
        tour.next();
      },
    },
  ],
});

const ONBOARDING_COMPLETE = "ONBOARDING_COMPLETE";

export default defineComponent({
  data() {
    return {
      channelName: "",
      gameTimeoutSeconds: 90,
      entriesPerUser: 1,
      entriesAtOnce: 1,
      targetSize: 240,
      baseBallSize: 40,
      maxBallSize: 60,
      basePlayerUrl:
        window.location.hostname === "localhost"
          ? "http://localhost:1234"
          : "https://cmgriffing.github.io/flick-it/player",
      tour,
    };
  },
  setup() {
    const playerUrlElement = ref(null);

    onMounted(() => {
      console.log("onMounted", playerUrlElement.value);

      if (!window.localStorage.getItem(ONBOARDING_COMPLETE)) {
        tour.start();
      }
    });

    const showCopied = (success) => {
      if (success) {
        ElMessage.success("URL Copied");
      } else {
        ElMessage.error("Channel name must be configured");
      }
    };

    return {
      playerUrlElement,
      showCopied,
    };
  },
  head() {
    return {
      bodyAttrs: {
        class: "reset-body",
      },
    };
  },
  methods: {
    getPlayerUrl() {
      return `${this.basePlayerUrl}?channelName=${this.channelName}&gameTimeoutSeconds=${this.gameTimeoutSeconds}&entriesAtOnce=${this.entriesAtOnce}&entriesPerUser=${this.entriesPerUser}&baseBallSize=${this.baseBallSize}&maxBallSize=${this.maxBallSize}&targetSize=${this.targetSize}`;
    },
    copyUrlToClipboard(from) {
      return () => {
        // const inputElement = this.playerUrlElement.value;
        const inputElement = document.querySelector("#player-url-element");
        console.log("copying");
        if (inputElement) {
          console.log({ inputElement });
          inputElement.select();
          document.execCommand("copy");

          if (from === "input") {
            this.showCopied(this.channelName !== "");
          }
        }
      };
    },
  },
});
</script>

<style>
.reset-body {
  padding: 0;
  margin: 0;
}
</style>

<style lang="postcss" scoped>
.page {
  height: 100vh;
}

.header {
  padding: 10px;
}

h1 {
  line-height: 40px;
}

.github-icon {
  padding: 10px;
}

.config-section {
  width: 400px;
  padding: 0 32px 100px 32px;
  max-height: calc(100vh - 60px);
  overflow-y: scroll;
}

.preview-section {
  margin-top: 28px;
}

el-label {
  margin: 10px;
}

.el-input-number {
  width: 100%;
}

.player-url-element {
  width: calc(100% - 20px);
}

.player {
  display: flex;
  width: calc(100vw - 460px);
  height: calc(100vh - 180px);
}

.spacer {
  flex: 1 1 auto;
}

iframe {
  border: none;
}
</style>
