<script setup>

</script>

<template>
  
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Talks</a></li>
      </ul>
      </nav>
  
</template>

<style scoped>

nav {
  float: right;
  
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  /* border: solid; */
  padding-right: 50px
}
nav li {
  padding-top: 25px;
  display: inline-block;
  margin-left: 150px;
  position: relative;
}
nav li:hover {
  color: orange;
}

nav a::before {
  content: '';
  display: block;
  height: 5px;
  width: calc(100% - 50px);
  width: 0;
  position: absolute;
  background-color: orange;
  top: 0;
  left: 0;
  transition: all ease-in-out 250ms;
}

nav li:hover a::before {
  width: 100%;
}

nav a {
  text-decoration: none;
  color: white;
  text-transform: uppercase;
  font-size: 14px;

}
nav a:hover {
  color: orange;
}
nav a:hover::before {
  width: 100%;

}

</style>