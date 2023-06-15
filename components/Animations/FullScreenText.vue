<template>
  <div>
    <div ref="slideBackground" class="slide-in-background"></div>
    <div ref="slideContainer" class="slide-in-out-container">
      <div class="slide-in-out">{{ text }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"

export default defineComponent({
  name: "Toolbox",

  mounted() {
    const slideBackground = this.$refs.slideBackground;
    const slideContainer = this.$refs.slideContainer;

    slideBackground.addEventListener('animationend', () => {
      slideBackground.style.display = 'none';
      slideContainer.style.display = 'none';
    });
  },

  props: [
      'text'
  ]
})
</script>

<style scoped>
.slide-in-background {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  background-color: rgba(0, 255, 187, 0.03);
  opacity: 0;
  animation: slide-in-background 3s ease-in-out 1s forwards;
  transform: translateX(-100%);
}

.slide-in-out-container {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-in-out {
  height: 50px;
  width: 100vw;
  padding: 4px 10px;
  position: fixed;
  font-size: 30px;
  text-align: center;
  text-shadow: 0px 0px 20px #fff;
  border-radius: 5px 0 0 5px;
  animation: slide-in-out 2.5s linear 1s forwards;
  transform: translateX(-100%);
  will-change: transform, left;
}

@keyframes slide-in-background {
  0% {
    transform: translateX(0);
    backdrop-filter: blur(0px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  35% {
    backdrop-filter: blur(5px);
  }
  65% {
    backdrop-filter: blur(5px);
  }
  70% {
    opacity: 1;
  }
  90% {
    opacity: 0;
    transform: translateX(0);
  }
  100% {
    backdrop-filter: blur(0px);
  }
}

@keyframes slide-in-out {
  0% {
    transform: translateX(-100%);
    animation-timing-function: ease-out;
  }
  10% {
    transform: translateX(-5%);
  }
  90% {
    transform: translateX(5%);
    opacity: 1;
  }
  100% {
    transform: translateX(7%);
    opacity: 0;
  }
}
</style>