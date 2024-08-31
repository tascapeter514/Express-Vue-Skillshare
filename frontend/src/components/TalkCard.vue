<template>
    <div class="talk">
        <div class="flex">
            <h5 class="card-text_title">
                {{ carouselTalk.title }}
                <button @click="deleteTalk(carouselTalk.title)">Remove</button>
            </h5>
            <div class="card-text_presenter">
                by <strong>{{ carouselTalk.presenter }}</strong>
                
            </div>
            <div class="card-text_summary">
                <!-- Add Summary -->
              <strong>  {{ carouselTalk.summary }} </strong>
            </div>
        </div>
        <!-- Add Comments Here -->
        <AsyncComments
        :comments="carouselTalk.comments"
        :presenter="props.carouselUser"
        :title="carouselTalk.title"></AsyncComments>
    </div>

</template>

<script setup>

import { onMounted, ref, defineAsyncComponent} from 'vue';



const props = defineProps({
    carouselTalk: Object,
    carouselUser: String,
    carouselIndex: Number
})

const AsyncComments = defineAsyncComponent(() => 
    import('/src/components/Comments.vue')
)

const deleteTalk = (talkTitle) => {
  const encodedTitle = encodeURIComponent(talkTitle)
  // console.log("JSON title:", talkTitle)
  // console.log("encoded title:", encodedTitle)
  fetch(`/talks/database/${encodedTitle}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

</script>

<style scoped>

.talk {
    padding: 30px;
    margin-right: 5px;
    border-radius: 50px;
    position: relative;
    background-color: #4166D6;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* background: #fff; */
    border: orange solid;
    box-shadow: 15px 15px 15px black;
    gap: 1rem;
    cursor: pointer;
    text-align: center;
    width: 100%;
    height: 100%;
}

.card-text_title {
    padding: 0 0.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    padding-top: 1rem;
    padding-bottom: 0.2rem;
}

.card-text_title h5 {
    /* font-size: 1.2rem;
    font-weight: 600;
    padding-top: 1rem;
    padding-bottom: 0.2rem; */
}

.card-text_summary {
    padding-bottom: 0.5rem;
}

.flex {
    display: flex;
    flex-direction: column;
}

.talk:hover {
    transform: scale(1.15) translateY(-30px);
    box-shadow: 3px 2px 25px rgba(2, 129, 255, .03);
    /* background: orange; */
    transition: 1s ease;

}




button {
  background-color: orange;
  margin-top: 10px;
  border-radius: 30px;
  font-weight: bold;
  color: black;
  border: black;
  padding: 5px
}

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px
}

</style>