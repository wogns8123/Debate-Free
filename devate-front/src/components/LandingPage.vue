<template>
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="mb-4">🎯 랜덤 토론장</h1>
            <p class="text-muted-foreground max-w-2xl mx-auto">
                무작위 토픽으로 즉석 토론에 참여하세요. 논증 실력을 기르고, 다양한 관점을 탐구하며,
                의미 있는 토론을 경험해보세요.
            </p>
        </div>

        <!-- Quick Demo -->
        <div class="mb-8">
            <Card class="border-primary/20 bg-primary/5">
                <CardContent class="pt-6 flex items-center justify-between">
                    <div>
                        <h3 class="mb-2">빠른 데모 체험</h3>
                        <p class="text-muted-foreground">
                            샘플 토론에 참여하여 기능을 체험해보세요
                        </p>
                    </div>
                    <Button @click="quickJoinDemo" size="lg">
                        <Zap class="w-4 h-4 mr-2" /> 빠른 데모
                    </Button>
                </CardContent>
            </Card>
        </div>

        <!-- 기존 토론방 리스트 -->
        <div v-if="allDebates.length > 0" class="mb-8">
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <List class="w-5 h-5" /> 진행중인 토론방 ({{ allDebates.length }})
                    </CardTitle>
                    <CardDescription>기존 토론방에 참여하거나 관람해보세요</CardDescription>
                </CardHeader>
                <CardContent>
                    <DebateRoomsList :debates="allDebates" @join-debate="onJoinDebate" />
                </CardContent>
            </Card>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
            <!-- Topic Generator -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Shuffle class="w-5 h-5" /> 토픽 생성
                    </CardTitle>
                    <CardDescription>무작위 토론 주제를 생성하여 토론을 시작하세요</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <TopicGenerator
                        :currentTopic="currentTopic"
                        @topic-generated="currentTopic = $event"
                        @generate-topic="generateRandomTopic"
                    />
                </CardContent>
            </Card>

            <!-- Create Debate -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Users class="w-5 h-5" /> 토론방 생성
                    </CardTitle>
                    <CardDescription>정보를 입력하고 새로운 토론방을 만드세요</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div>
                        <Label for="playerName">이름</Label>
                        <Input
                            id="playerName"
                            placeholder="이름을 입력하세요"
                            v-model="playerName"
                        />
                    </div>

                    <div>
                        <Label>입장 선택</Label>
                        <div class="flex gap-2 mt-2">
                            <Button
                                :variant="selectedSide === 'for' ? 'default' : 'outline'"
                                @click="selectedSide = 'for'"
                                class="flex-1"
                            >
                                👍 찬성
                            </Button>
                            <Button
                                :variant="selectedSide === 'against' ? 'default' : 'outline'"
                                @click="selectedSide = 'against'"
                                class="flex-1"
                            >
                                👎 반대
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label for="timeLimit" class="flex items-center gap-2">
                            <Clock class="w-4 h-4" /> 시간 제한 (분)
                        </Label>
                        <Input
                            id="timeLimit"
                            type="number"
                            min="1"
                            max="30"
                            v-model.number="timeLimit"
                        />
                    </div>

                    <Button
                        @click="createDebate"
                        :disabled="!currentTopic || !playerName || !selectedSide"
                        class="w-full"
                        size="lg"
                    >
                        새 토론방 생성
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Input,
    Label,
} from './ui';
import { Shuffle, Users, Clock, Zap, List } from 'lucide-vue-next';
import TopicGenerator from './TopicGenerator.vue';
import DebateRoomsList from './DebateRoomsList.vue';
import { Debate, Participant } from '../types';

const props = defineProps<{
    allDebates: Debate[];
    onJoinDebate: (debate: Debate) => void;
    onCreateDebate: (debate: Debate) => void;
}>();

const currentTopic = ref('');
const playerName = ref('');
const selectedSide = ref<'for' | 'against' | null>(null);
const timeLimit = ref(10);

const DEBATE_TOPICS = [
    'Social media does more harm than good to society',
    'Artificial intelligence will replace human creativity',
    'Remote work is better than office work',
    'Video games are a legitimate form of art',
    'Space exploration is a waste of resources',
    'Cryptocurrency will replace traditional currency',
    'Schools should ban smartphones completely',
    'Universal basic income should be implemented globally',
    "Climate change is humanity's greatest threat",
    'Private companies should fund space exploration',
    'Online education is superior to traditional classroom learning',
    'Genetic engineering in humans should be allowed',
    'Social media influencers have too much power',
    'Self-driving cars will make roads safer',
    'Standardized testing should be abolished',
    'Nuclear energy is essential for fighting climate change',
    'Professional sports salaries are too high',
    'Mandatory military service builds character',
    'Fast fashion should be banned',
    'Homework is counterproductive to learning',
];

const PARTICIPANT_COLORS = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500',
];

function generateRandomTopic() {
    const randomTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
    currentTopic.value = randomTopic;
}

function createDebate() {
    if (!currentTopic.value || !playerName.value || !selectedSide.value) return;

    const participant: Participant = {
        id: Date.now().toString(),
        name: playerName.value,
        side: selectedSide.value,
        color: PARTICIPANT_COLORS[0],
    };

    const debate: Debate = {
        id: Date.now().toString(),
        topic: currentTopic.value,
        participants: [participant],
        arguments: [],
        timeLimit: timeLimit.value,
        currentPhase: 'waiting',
        createdAt: Date.now(),
    };

    props.onCreateDebate(debate);
}

function quickJoinDemo() {
    const demoTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
    const demoParticipants: Participant[] = [
        { id: '1', name: 'Alex', side: 'for', color: PARTICIPANT_COLORS[0] },
        { id: '2', name: 'Sam', side: 'against', color: PARTICIPANT_COLORS[1] },
    ];

    const demoDebate: Debate = {
        id: 'demo',
        topic: demoTopic,
        participants: demoParticipants,
        arguments: [],
        timeLimit: 5,
        currentPhase: 'debating',
        createdAt: Date.now(),
    };

    props.onJoinDebate(demoDebate);
}
</script>
