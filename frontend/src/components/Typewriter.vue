<script setup>


</script>

<template>
    <h2>
        <span class="typewriter">
            Welcome to the Full Stack BookChat App<span class="caret"></span>
        </span>
    </h2>
</template>

<style scoped>

h2 {
    font-size: 20px;
    position: relative;
    width: max-content;
    overflow: hidden;
    color: transparent;

    
}

/* h2::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  -webkit-background-clip: text;
  background-clip: text;
  background: transparent;
  color: black;
  z-index: 1;

  animation: typewriter 4s steps(37) forwards;

} */

/* @keyframes typewriter {
    from {
        width: 0;
    }
    to {
        width: 100%
    }
} */

.typewriter {
    display: inline-block;

    position: relative;
    color: white;
    overflow: hidden;
    white-space: nowrap;
    background: transparent;

    animation: typewriter 8s steps(37) infinite;
    
}


.caret {
    display: inline-block;
    width: 0.125em;
    height: 1em;
    background: white;
    animation: blink 1s step-end infinite;
    position: absolute;
    left: 100%;
    top: 0;
    transform: translateX(-0.125em)
}

@keyframes typewriter {
    from {
        width: 0;
    }
    50% {
        width: 100%;
    }
    100% {
        width: 0;
    }
}


@keyframes blink {
    50% {
        opacity: 0;
    }

}











</style>