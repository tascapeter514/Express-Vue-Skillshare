<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
const currentSlide = ref(1)
const slides = ref([])
const getSlideCount = ref(0)



//mock function to simulate async data loading

const updateSlideCount = async () => {
  await nextTick(); // Wait for DOM updates
  getSlideCount.value = document.querySelectorAll('.slide').length; // Count slides
  console.log('slide count:', getSlideCount.value); // Log for debugging
}



//next slide

const nextSlide = () => {
    if (currentSlide.value === getSlideCount.value) {
        currentSlide.value = 1;
        return;
    }
    currentSlide.value += 1
}

//prev slide

const prevSlide = () => {
    if (currentSlide.value === 1) {
        currentSlide.value = 1;
        return;
    }
    currentSlide.value -= 1;
}



onMounted(async () => {
    await updateSlideCount()
})
</script>

<template>
    <div class="carousel">
        <slot :currentSlide="currentSlide"></slot>

        <!--Navigation-->
        <div class="navigate">
            <div class="toggle-page left">
                <i @click="prevSlide" class="fa-solid fa-chevron-left"></i>
            </div>
            <div class="toggle-page right">
                <i @click="nextSlide" class="fa-solid fa-chevron-right"></i>
            </div>
        </div>

        <!--Pagination-->
        <div class="pagination" v-if="getSlideCount > 0">
            <span v-for="(slide, index) in getSlideCount" :key="index" :class="{active : index + 1 === currentSlide}">

            
            </span>
        </div>



    </div>


</template>


<style scoped>
.navigate {
    padding: 0 16px;
    height: 100%;
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;

    .toggle-page {
        display: flex;
        flex: 1;
    }

    .right {
        justify-content: flex-end;
    }

    i {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        background-color: orange;
        color: blue;

    }



}

.pagination {
    position: absolute;
    bottom: 24px;
    width: 100%;
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;

    span {
        cursor: pointer;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: orange;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
    }

    .active {
        background-color: blue
    }

}







</style>