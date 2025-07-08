<template>
  <div class="select-username">
    <form @submit.prevent="onSubmit">
      <label for="username">Who are you?</label>
      <input v-model="username" placeholder="Your name..." />
      <button :disabled="!isValid">Send</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "SelectUsername",
  data() {
    return {
      username: "",
    };
  },
  computed: {
    isValid() {
      return this.username.length > 2;
    },
  },
  methods: {
    onSubmit() {
      this.$emit("username-picked", this.username);
    },
  },
};
</script>

<style scoped>
.select-username {
  width: 300px;
  margin: 200px auto 0;
}
label {
  margin-right: 1rem;
}
</style>
