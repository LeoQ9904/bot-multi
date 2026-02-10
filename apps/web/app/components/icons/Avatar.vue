<template>
    <img :src="user.photoURL" :alt="user.displayName" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"/>
</template>
<script setup>
    const { user } = useFirebaseAuth();
</script>
