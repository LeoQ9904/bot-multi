<script setup>
defineProps({
    fontSize: {
        type: String,
        default: '2rem'
    }
});
</script>
<template>
    <div class="">
        <div class="material-symbols-outlined p-2" :style="{ fontSize: fontSize }">auto_awesome</div>
    </div>
</template>
