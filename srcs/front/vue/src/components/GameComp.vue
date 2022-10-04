<script setup>
import PhaserContainer from '@/components/PhaserContainer.vue'

</script>

<template>
    <h2> Game COmponent </h2>
    <Suspense>
        <PhaserContainer />
        
        <template #fallback>
            <div class="placeholder">
                Downloading...
            </div>
        </template>
    </Suspense>
</template>

<style></style>
