<template>
  <el-container class="page">
    <el-header>
      <h1>Flick It</h1>
    </el-header>
    <el-container>
      <el-aside class="config-section">
        <div>
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

        <!-- HMMMMMM, other ideas -->
        <!--   -->
      </el-aside>
      <el-main class="preview-section">
        <div>
          <el-input :modelValue="getPlayerUrl()" readonly>
            <template #prepend>
              <el-button @click="copyUrlToClipboard">Copy</el-button>
            </template>
          </el-input>
        </div>
        <iframe class="player" :src="getPlayerUrl()" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { defineComponent } from "vue";

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
      basePlayerUrl: "https://cmgriffing.github.io/flick-it/player",
    };
  },
  setup() {},
  head() {
    return {
      bodyAttrs: {
        class: "reset-body",
      },
    };
  },
  methods: {
    getPlayerUrl() {
      return `${this.basePlayerUrl}?channelName=${this.channelName}&entriesAtOnce=${this.entriesAtOnce}&entriesPerUser=${this.entriesPerUser}&baseBallSize=${this.baseBallSize}&maxBallSize=${this.maxBallSize}&targetSize=${this.targetSize}`;
    },
    copyUrlToClipboard() {
      navigator.permissions
        .query({ name: "clipboard-write" })
        .then((result) => {
          if (result.state == "granted" || result.state == "prompt") {
            navigator.clipboard.writeText(this.getPlayerUrl()).then(
              function() {
                /* clipboard successfully set */
              },
              function() {
                /* clipboard write failed */
              }
            );
          }
        });
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

.config-section {
  width: 400px;
  padding: 0 20px;
}

el-label {
  margin: 10px;
}

.player {
  display: flex;
  width: calc(100vw - 440px);
  height: calc(100vh - 160px);
}
</style>
