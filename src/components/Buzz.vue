<template>
  <li class="user" :style="winner ? 'background-color: #f6e273;' : ''">
    <div class="name">
      {{ user }}
    </div>
    <div class="time">
      {{ time }}
    </div>
  </li>
</template>

<script>
export default {
  name: "Buzz",
  props: {
    user: String,
    time: String,
    winner: Boolean,
  },
};
</script>

<style scoped>
.user {
  padding: 10px;
  display: flex;
  gap: 1rem;
}

.name {
  width: 30ch;
}

.has-buzzed {
  color: white;
  background-color: red;
  width: 20px;
  border-radius: 5px;
  text-align: center;
  float: right;
  margin-top: 10px;
}
</style>
