<template>
    <div v-if="debateArguments.length === 0" class="text-center py-8 text-muted-foreground">
        <MessageSquare class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No arguments yet. Be the first to make your point!</p>
    </div>

    <div v-else class="space-y-4 max-h-96 overflow-y-auto">
        <Card v-for="argument in debateArguments" :key="argument.id" class="p-4">
            <div class="flex items-start gap-3">
                <Avatar class="w-10 h-10 flex-shrink-0">
                    <AvatarFallback
                        :class="`${getParticipant(argument.participantId)?.color} text-white`"
                    >
                        {{ getParticipant(argument.participantId)?.name.charAt(0).toUpperCase() }}
                    </AvatarFallback>
                </Avatar>

                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="font-medium">{{
                            getParticipant(argument.participantId)?.name
                        }}</span>
                        <Badge
                            :variant="argument.side === 'for' ? 'default' : 'destructive'"
                            :class="
                                argument.side === 'for'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-red-100 text-red-800 border-red-200'
                            "
                        >
                            {{ argument.side === 'for' ? '👍 For' : '👎 Against' }}
                        </Badge>
                        <span class="text-sm text-muted-foreground">{{
                            formatTime(argument.timestamp)
                        }}</span>
                    </div>
                    <div class="prose prose-sm max-w-none">
                        <p class="text-foreground leading-relaxed">{{ argument.text }}</p>
                    </div>
                </div>
            </div>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageSquare } from 'lucide-vue-next';
import type { Argument, Participant } from '../App';
import { ref } from 'vue';

interface Props {
    debateArguments: Argument[];
    participants: Participant[];
}

const props = defineProps<Props>();

const getParticipant = (participantId: string) => {
    return props.participants.find((p) => p.id === participantId);
};

const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
