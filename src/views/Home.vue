<template>
  <div>
    <div v-if="!usernameAlreadySelected">
      <h1>Win When They're Singing</h1>
      <p>You'll hear the introduction to song, then after a few seconds it will fade out.</p>
      <p>You need to buzz when you think the first lyric is sung.</p>
      <p>Closest wins.</p>
      <select-username
        @username-picked="onUsernameSelection"
      />
    </div>
    <buzzer v-else />
  </div>
</template>

<script>
import SelectUsername from "/src/components/SelectUsername.vue";
import Buzzer from "/src/components/Buzzer.vue";
import { socket } from "@/socket.js";

export default {
  name: 'Home',
  components: {
    SelectUsername,
    Buzzer
  },
  data() {
    return {
      usernameAlreadySelected: false,
    };
  },
  methods: {
    onUsernameSelection(username) {
      this.usernameAlreadySelected = true;
      socket.auth = { username };
      socket.connect();
    },
  },
  created() {
    debugger;
    const sessionID = localStorage.getItem("sessionID");
    if (sessionID) {
      this.usernameAlreadySelected = true;
      socket.auth = { sessionID };
      socket.connect();
    }

    socket.on("session", ({ sessionID, userID }) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = { sessionID };
      // store it in the localStorage
      localStorage.setItem("sessionID", sessionID);
      // save the ID of the user
      socket.userID = userID;
    });

    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        this.usernameAlreadySelected = false;
      }
    });
  },
  destroyed() {
    socket.off("connect_error");
  },
}
</script>
