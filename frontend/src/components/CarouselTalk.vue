<script setup>
import { onMounted, ref, defineAsyncComponent } from 'vue';


const props = defineProps({
    carouselTalk: Object,
    carouselIndex: Number,
    carouselUser: String


})

const AsyncComments = defineAsyncComponent(() =>
import('/src/components/Comments.vue')
)

console.log("carousel talk:", props.carouselTalk)


</script>

<template>
<li class="carousel_slide">

    <div class="carousel_talk">
        <h2 > {{ carouselTalk.title }} {{ carouselIndex }}
                <button @click="deleteTalk(talk.title)">Remove</button>
        </h2>
        <div>
            by <strong>{{ carouselTalk.presenter }}</strong>
            <p> {{ carouselTalk.summary }}</p>
        </div>
        <AsyncComments :comments="carouselTalk.comments" :presenter="props.carouselUser" :title="carouselTalk.title"></AsyncComments>
    </div>
</li>



</template>



<style scoped>
.carousel_slide {
    position: relative;
    list-style: none;
    border: black solid;
    border-radius: 50px;


    object-fit: cover;
}

.carousel_talk {
    border: 4mm ridge orange;
    height: 100%;
    box-shadow: 15px 15px 15px black;
    padding: 30px;
    border-radius: 50px;


    
}

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px
}

button {
  background-color: orange;
  margin-top: 10px;
  border-radius: 30px;
  font-weight: bold;
  color: black;
  border: black;
}
</style>