<template>
  <div>
    <div v-if="!usernameAlreadySelected">
    <select-username
    @username-picked="onUsernameSelection"
    />
    </div>
    <div v-else>
      <h1>Jukebox</h1>
      <div v-for="song in songs" :key="song.name">
        <div v-if="currentSong === song.id" class="player">
          <h2>Song {{ song.id + 1 }}</h2>
          <h3 v-if="completed[currentSong]">{{ song.name }}</h3>
          <audio
          :data-player="song.id"
          controls
          controlslist="nodownload,nofullscreen"
            preload="auto"
            style="width:480px;"
            @play="onTrackStart($event, song)"
            @pause="onTrackStop"
            >
            <source :src="song.file" type="audio/mp4" />
            <p>Your browser does not support HTML5 audio.</p>
          </audio>
          <button @click="reveal(song)">Reveal</button>
        </div>
      </div>
      <div>
        <h3>Guesses</h3>
          <p id="timer"></p>
        <ul class="guesses" v-for="buzz in buzzes[currentSong]" :key="buzz.userSessionId">
          <buzz v-if="buzz.username" :user="buzz.username" :time="buzz.time" :winner="showWinner && winners[currentSong]?.username === buzz.username" />
        </ul>
      </div>
      <button @click="previous">Previous song</button>
      <button @click="next">Next song</button>
    </div>
  </div>
</template>

<script>
import { socket } from "@/socket"
import Buzz from "@/components/Buzz.vue"
import SelectUsername from "@/components/SelectUsername.vue";
import track1 from "@/songs/dani-california.m4a";
import track2 from "@/songs/kiss-from-a-rose.m4a";
import track3 from "@/songs/september.m4a";
import track4 from "@/songs/golden-brown.m4a";
import track5 from "@/songs/walkie-talkie-man.m4a";
import track6 from "@/songs/come-together.m4a";
import track7 from "@/songs/does-your-mother-know.m4a";
import track8 from "@/songs/ghosttown.m4a";
export default {
  name: 'Jukebox',
  components: {Buzz, SelectUsername},
  data: function() {
    return {
      usernameAlreadySelected: false,
      users: [],
      completed: [false, false, false, false, false, false, false, false, false, false],
      buzzes: [[], [], [],[],[],[],[],[],[],[],],
      winners: [null, null, null, null, null, null, null, null, null, null],
      currentSong: 0,
      winner: null,
      showWinner: false,
      quizzing: true,
      songs: [
        {
          id: 0,
          name: "Dani California",
          fadeOut: 6.5,
          lyrics: 16.05,
          file: track1
        },
        {
          id: 1,
          name: "Kiss from a Rose",
          fadeOut: 6.5,
          lyrics: 24.5,
          file: track2
        },
        {
          id: 2,
          name: "September",
          fadeOut: 6.5,
          lyrics: 20.1,
          file: track3
        },
        {
          id: 3,
          name: "Golden Brown",
          fadeOut: 6.5,
          lyrics: 21.3,
          file: track4
        },
        {
          id: 4,
          name: "Walkie Talkie Man",
          fadeOut: 6.5,
          lyrics: 15.8,
          file: track5
        },
        {
          id: 5,
          name: "Come Together",
          fadeOut: 6.5,
          lyrics: 12.1,
          file: track6
        },
        {
          id: 6,
          name: "Does Your Mother Know",
          fadeOut: 6.5,
          lyrics: 21.7,
          file: track7
        },
        {
          id: 7,
          name: "Ghost Town",
          fadeOut: 12,
          lyrics: 44,
          file: track8
        },
      ]
    }
  },
  methods: {
    onUsernameSelection(username) {
      this.usernameAlreadySelected = true;
      socket.auth = { username };
      socket.connect();
    },
    changeTrack() {
      const songId = this.currentSong
      this.quizzing = true
      socket.emit("update current track", { track: songId });
    },
    next() {
      if (this.currentSong < this.songs.length) {
        this.currentSong++
        this.changeTrack()
      }
    },
    previous() {
      if (this.currentSong > 0) {
        this.currentSong--
        this.changeTrack()
      }
    },
    reveal(song) {
      this.completed[this.currentSong] = true
      const player = document.querySelector(`[data-player='${song.id}']`)
      player.volume = 1
      player.currentTime = 0
      player.play()
      const timer = document.getElementById('timer')
      // if (this.buzzes[this.currentSong]) {
      //   this.winners[this.currentSong] = this.buzzes[this.currentSong].reduce((prev, curr) => {
      //     if (Math.abs(curr.time - song.lyrics) < Math.abs(prev.time - song.lyrics)) {
      //       return curr
      //     } else {
      //       return prev
      //     }
      //   })
      // }
      setInterval(() => {
        if (player.currentTime < song.lyrics) {
          timer.innerText = player.currentTime.toFixed(2); // will get you a lot more updates.
        } else {
          // this.showWinner = true
        }
      }, 30);
    },
    onTrackStart(event, song) {
      event.target.volume = 1
      if (this.quizzing) {
        socket.emit("start track", { id: song.id });
        setInterval(() => {
          if (this.quizzing && event.target.volume > 0.011 && event.target.currentTime > song.fadeOut) {
            event.target.volume -= .01
            if (event.target.volume < .01) {
              event.target.volume = 0
            }
          }
        }, 30);
      }
    },
    onTrackStop() {
      this.quizzing = false
      this.$set(this.completed, this.currentSong, true)
    },
  },
  created() {
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

    const initReactiveProperties = (user) => {
      user.buzzed = false;
    };

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
        initReactiveProperties(user);
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
    socket.on("buzzes", (buzzes) => {
      buzzes[this.currentSong].forEach((buzz) => {
        if (!this.buzzes[this.currentSong].some(b => b.userSessionId === buzz.userSessionId)) {
          this.buzzes[this.currentSong].push(buzz);
        }
      });
      // put the current user first, and sort by username
      this.buzzes[this.currentSong].sort((a, b) => {
        if (a.time < b.time) return -1;
        return a.time > b.time ? 1 : 0;
      });
    });
  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
  },
}
</script>
<style>
.guesses {
  width: 30rem;
  margin: 0 auto;
}
#timer {
  font-size: 2rem;
}
</style>