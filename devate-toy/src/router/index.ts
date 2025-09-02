import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ChatRoomView from '../views/ChatRoomView.vue';

const routes = [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/room/:id', name: 'ChatRoom', component: ChatRoomView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
