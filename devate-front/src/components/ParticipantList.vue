<template>
<div class="space-y-4">
    <!-- For Side -->
    <div>
    <div class="flex items-center gap-2 mb-2">
        <Badge variant="default" class="bg-green-100 text-green-800 border-green-200">
        👍 For ({{ forParticipants.length }})
        </Badge>
    </div>
    <div class="space-y-2">
        <ParticipantItem v-for="p in forParticipants" :key="p.id" :participant="p" />
        <div v-if="forParticipants.length === 0" class="text-muted-foreground text-sm text-center py-2">
        No participants yet
        </div>
    </div>
    </div>

    <!-- Against Side -->
    <div>
    <div class="flex items-center gap-2 mb-2">
        <Badge variant="destructive" class="bg-red-100 text-red-800 border-red-200">
        👎 Against ({{ againstParticipants.length }})
        </Badge>
    </div>
    <div class="space-y-2">
        <ParticipantItem v-for="p in againstParticipants" :key="p.id" :participant="p" />
        <div v-if="againstParticipants.length === 0" class="text-muted-foreground text-sm text-cen
