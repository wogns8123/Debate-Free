<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <header class="p-6 bg-white shadow-md flex justify-between items-center">
            <h1 class="text-2xl font-bold text-purple-700">🌏 천하제일 토론대회</h1>
            <nav class="space-x-4">
                <router-link to="/" class="text-gray-600 hover:text-purple-600">홈</router-link>
            </nav>
        </header>

        <main class="p-6 max-w-6xl mx-auto">
            <router-view />
        </main>
    </div>
</template>

<script setup lang="ts">
// 전역 레이아웃 (내용 없음)
</script>
