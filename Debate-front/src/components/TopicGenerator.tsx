import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Shuffle, Lightbulb, Edit3 } from 'lucide-react';

type TopicGeneratorProps = {
  currentTopic: string;
  onTopicGenerated: (topic: string) => void;
  onGenerateTopic: () => void;
};

export function TopicGenerator({ currentTopic, onTopicGenerated, onGenerateTopic }: TopicGeneratorProps) {
  const [customTopic, setCustomTopic] = useState('');
  const [activeTab, setActiveTab] = useState('random');

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      onTopicGenerated(customTopic.trim());
      setCustomTopic('');
    }
  };

  const handleRandomGenerate = () => {
    onGenerateTopic();
    setActiveTab('random');
  };

  return (
    <div className="space-y-4">
      {currentTopic ? (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="mb-1">토론 주제</h4>
              <p className="text-foreground">{currentTopic}</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>토론 주제를 생성하거나 직접 입력하세요</p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="random" className="flex items-center gap-2">
            <Shuffle className="w-4 h-4" />
            랜덤 생성
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            직접 입력
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="random" className="mt-4">
          <Button 
            onClick={handleRandomGenerate}
            variant="outline" 
            className="w-full"
            size="lg"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            {currentTopic ? '새 랜덤 토픽 생성' : '랜덤 토픽 생성'}
          </Button>
        </TabsContent>
        
        <TabsContent value="custom" className="mt-4 space-y-3">
          <div>
            <Label htmlFor="customTopic">커스텀 토론 주제</Label>
            <Textarea
              id="customTopic"
              placeholder="토론하고 싶은 주제를 입력하세요..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleCustomTopicSubmit}
            disabled={!customTopic.trim()}
            className="w-full"
            size="lg"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            주제 설정
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}