import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, getStatusColor } from "@/lib/utils";
import { Subject } from "@/types";
import { useXp } from "@/hooks/useXp";
import { Skeleton } from "@/components/ui/skeleton";

const SubjectOverview = () => {
  const { subjects, isLoading } = useXp();

  const getStatusText = (status: string): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + (word || '').slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Subject Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!Array.isArray(subjects) || subjects.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <p>No subjects available.</p>
            <p className="text-sm mt-2">Start learning to track your progress!</p>
          </div>
        ) : (
          <>
            {(subjects as Subject[]).map((subject: Subject, index: number) => (
              <div key={`${subject.id}-${index}`}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{subject.name}</span>
                  <span className="text-muted-foreground">{getStatusText(subject.status)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={cn("progress-fill", getStatusColor(subject.status))} 
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-foreground">
              View Detailed Analysis
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectOverview;
