<!-- components/ArgumentInput.vue -->
<template>
    <div class="space-y-4">
        <!-- Participant Select -->
        <div>
            <Label for="participant-select">Speaking as</Label>
            <Select v-model="selectedParticipant">
                <SelectTrigger>
                    <SelectValue placeholder="Select participant" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="participant in participants"
                        :key="participant.id"
                        :value="participant.id"
                    >
                        <div class="flex items-center gap-2">
                            <div :class="`w-3 h-3 rounded-full ${participant.color}`" />
                            {{ participant.name }} ({{
                                participant.side === 'for' ? '👍 For' : '👎 Against'
                            }})
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <!-- Argument Textarea -->
        <div>
            <Label for="argument-text">Your Argument</Label>
            <Textarea
                id="argument-text"
                placeholder="Type your argument here... (Ctrl/Cmd + Enter to submit)"
                v-model="argumentText"
                @keydown="handleKeyPress"
                :disabled="disabled"
                rows="4"
                class="resize-none"
            />
            <div class="flex justify-between items-center mt-2">
                <p class="text-sm text-muted-foreground">
                    {{ argumentText.length }}/1000 characters
                </p>
                <p class="text-sm text-muted-foreground">Ctrl/Cmd + Enter to submit</p>
            </div>
        </div>

        <!-- Submit Button -->
        <Button
            @click="handleSubmit"
            :disabled="!argumentText.trim() || !selectedParticipant || disabled"
            class="w-full"
            size="lg"
        >
            <Send class="w-4 h-4 mr-2" />
            Submit Argument
        </Button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from './ui/button.vue';
import Textarea from './ui/textarea.vue';
import Select from './ui/select.vue';
import { Label } from './ui/label';
import { Send } from 'lucide-vue-next';
import type { Participant } from '../App';

interface Props {
    participants: Participant[];
    onAddArgument: (text: string, participantId: string) => void;
    disabled?: boolean;
}

const props = defineProps<Props>();
const argumentText = ref('');
const selectedParticipant = ref('');

const handleSubmit = () => {
    if (!argumentText.value.trim() || !selectedParticipant.value) return;

    props.onAddArgument(argumentText.value.trim(), selectedParticipant.value);
    argumentText.value = '';
};

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
    }
};
</script>
