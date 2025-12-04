<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Marquer pour afficher le modal d'upload au premier accès au dashboard
    if (this.$route.path === '/dashboard' && !localStorage.getItem('hasSeenUploadModal')) {
      localStorage.setItem('showUploadModal', 'true')
      localStorage.setItem('hasSeenUploadModal', 'true')
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #F8F9FA;
}

button {
  font-family: inherit;
}

input, select, textarea {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #F1F1F1;
}

::-webkit-scrollbar-thumb {
  background: #00478F;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #003366;
}
</style>
