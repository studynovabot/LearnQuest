import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RobotIcon, 
  UserIcon, 
  CompassIcon, 
  SmileIcon, 
  CalculatorIcon,
  LanguagesIcon,
  LockIcon
} from "@/components/ui/icons";
import { useChat } from "@/hooks/useChat";
import { AITutor } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const AITutors = () => {
  const { agents, unlockedAgents, lockedAgents, isLoading } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlockingId, setUnlockingId] = useState<number | null>(null);

  const getAgentIcon = (iconName?: string, size = 24) => {
    switch (iconName) {
      case 'user': return <UserIcon size={size} />;
      case 'robot': return <RobotIcon size={size} />;
      case 'compass': return <CompassIcon size={size} />;
      case 'smile': return <SmileIcon size={size} />;
      case 'calculator': return <CalculatorIcon size={size} />;
      case 'languages': return <LanguagesIcon size={size} />;
      default: return <RobotIcon size={size} />;
    }
  };

  const getAgentColorClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-primary';
      case 'purple': return 'bg-secondary';
      case 'teal': return 'bg-teal-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-primary';
    }
  };

  const handleUnlockAgent = async (agent: AITutor) => {
    toast({
      title: "Unlock Not Available",
      description: "Unlocking agents is not implemented.",
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-muted rounded-xl p-4 flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">AI Tutors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Unlocked Agents */}
          {unlockedAgents.map((agent: AITutor) => (
            <Link key={agent.id} href="/chat">
              <div className="agent-card bg-card rounded-xl p-4 flex flex-col items-center cursor-pointer transition duration-300">
                <div className={cn("w-16 h-16 rounded-full mb-3 flex items-center justify-center overflow-hidden", getAgentColorClass(agent.color))}>
                  {getAgentIcon(agent.iconName, 32)}
                </div>
                <span className="font-medium text-center">{agent.name}</span>
              </div>
            </Link>
          ))}
          
          {/* Locked Agents */}
          {lockedAgents.map((agent: AITutor) => (
            <div key={agent.id} className="agent-card bg-card rounded-xl p-4 flex flex-col items-center transition duration-300 opacity-70">
              <div className="w-16 h-16 rounded-full bg-gray-500 mb-3 flex items-center justify-center overflow-hidden">
                <LockIcon size={32} />
              </div>
              <span className="font-medium text-center">{agent.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{agent.xpRequired} XP</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => handleUnlockAgent(agent)}
                disabled={true}
              >
                Unlock
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AITutors;
