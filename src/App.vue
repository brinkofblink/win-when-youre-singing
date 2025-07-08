<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
html, body {
  min-height: 90vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 90vh;
  position: relative;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
button, input[type="button"] {
  margin: 0.5rem;
  appearance: none;
  background-color: #42b983;
  font-size: 1.4rem;
  color: white;
  padding: 0.5rem 1rem;
  outline: none;
  border: none;
  border-radius: .2rem;
}

button:disabled, input[type="button"]:disabled {
  opacity: 0.3;
}
</style>
