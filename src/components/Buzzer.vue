<template>
  <div class="buzzer">
    <h1>Question {{ question }}</h1>
    <input :disabled="buzzerDisabled" type="button" value="BUZZ" @click="onBuzz" >
  </div>
</template>

<script>
import { socket } from "../socket";
export default {
  name: "Buzzer",
  data() {
    return {
      question: 1,
      users: [],
      buzzerDisabled: true
    };
  },
  methods: {
    onBuzz() {
      if (!this.buzzerDisabled) {
        socket.emit("buzz");
        this.buzzerDisabled = true
      }
    },
  },
  created() {
    socket.on("users", (users) => {
      users.forEach((user) => {
        for (let i = 0; i < this.users.length; i++) {
          const existingUser = this.users[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            return;
          }
        }
        user.self = user.userID === socket.userID;
        this.users.push(user);
      });
      // put the current user first, and sort by username
      this.users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
    });
    socket.on('change question', (data) => {
      this.question = data + 1
    })
    socket.on('track started', () => {
      this.buzzerDisabled = false
    })
  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
  },
};
</script>

<style scoped>
.left-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  overflow-x: hidden;
  background-color: #3f0e40;
  color: white;
}

.right-panel {
  margin-left: 260px;
}

.buzzer {
  margin-top: 30vh;
}
</style>
