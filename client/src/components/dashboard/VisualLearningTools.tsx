import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  BarChart, 
  BookOpen, 
  BrainCircuit, 
  FileText, 
  FlowChart, 
  Loader2, 
  MindMap, 
  Network, 
  Pencil, 
  Zap 
} from "lucide-react";
import { useChat } from "@/hooks/useChat";

interface ConceptMap {
  title: string;
  nodes: {
    id: string;
    label: string;
    description: string;
  }[];
  connections: {
    source: string;
    target: string;
    label: string;
  }[];
}

const VisualLearningTools = () => {
  const [activeTab, setActiveTab] = useState("concept-maps");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conceptMap, setConceptMap] = useState<ConceptMap | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const { toast } = useToast();
  const { sendMessage } = useChat();

  const handleGenerateVisual = async (type: string, topic: string) => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate a visual.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setCurrentTopic(topic);
    
    try {
      // Construct the prompt for the AI
      let prompt = `Generate a ${type === "concept-maps" ? "concept map" : type === "flowcharts" ? "flowchart" : "mind map"} for the topic: ${topic}`;
      
      // Send the message to the AI
      await sendMessage(prompt);
      
      // For demo purposes, create a mock concept map
      // In a real implementation, you would parse the AI response
      if (type === "concept-maps") {
        const mockConceptMap: ConceptMap = {
          title: `${topic} Concept Map`,
          nodes: [
            { id: "n1", label: "Main Concept", description: "The central idea or principle" },
            { id: "n2", label: "Sub-Concept 1", description: "A key component or aspect" },
            { id: "n3", label: "Sub-Concept 2", description: "Another important element" },
            { id: "n4", label: "Related Idea 1", description: "Connected concept or application" },
            { id: "n5", label: "Related Idea 2", description: "Another connected concept" },
            { id: "n6", label: "Example 1", description: "Practical example or case study" },
            { id: "n7", label: "Example 2", description: "Another illustrative example" }
          ],
          connections: [
            { source: "n1", target: "n2", label: "includes" },
            { source: "n1", target: "n3", label: "contains" },
            { source: "n2", target: "n4", label: "relates to" },
            { source: "n3", target: "n5", label: "influences" },
            { source: "n4", target: "n6", label: "exemplified by" },
            { source: "n5", target: "n7", label: "demonstrated in" }
          ]
        };
        
        setConceptMap(mockConceptMap);
      } else {
        // For other visual types, we'd handle differently
        // For now, just show the concept map as a demo
        const mockConceptMap: ConceptMap = {
          title: `${topic} ${type === "flowcharts" ? "Flowchart" : "Mind Map"}`,
          nodes: [
            { id: "n1", label: "Start", description: "Beginning point" },
            { id: "n2", label: "Process 1", description: "First step or procedure" },
            { id: "n3", label: "Decision", description: "Evaluation point" },
            { id: "n4", label: "Process 2A", description: "Follow-up to positive decision" },
            { id: "n5", label: "Process 2B", description: "Alternative path" },
            { id: "n6", label: "End Result A", description: "Outcome of main path" },
            { id: "n7", label: "End Result B", description: "Outcome of alternative path" }
          ],
          connections: [
            { source: "n1", target: "n2", label: "leads to" },
            { source: "n2", target: "n3", label: "evaluate" },
            { source: "n3", target: "n4", label: "if yes" },
            { source: "n3", target: "n5", label: "if no" },
            { source: "n4", target: "n6", label: "results in" },
            { source: "n5", target: "n7", label: "results in" }
          ]
        };
        
        setConceptMap(mockConceptMap);
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: "Generation failed",
        description: `Failed to generate ${type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderConceptMap = () => {
    if (!conceptMap) return null;
    
    // In a real implementation, you would use a library like react-flow or d3.js
    // For this demo, we'll create a simple visual representation
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 border border-border rounded-lg p-4 bg-card/50"
      >
        <h3 className="text-lg font-semibold mb-4 text-center">{conceptMap.title}</h3>
        
        <div className="relative h-[300px] w-full overflow-hidden bg-background/50 rounded-md">
          {/* Nodes */}
          {conceptMap.nodes.map((node, index) => {
            // Calculate position (in a real app, you'd use a proper layout algorithm)
            const angle = (2 * Math.PI * index) / conceptMap.nodes.length;
            const radius = node.id === "n1" ? 0 : 120; // Center the first node
            const x = 150 + radius * Math.cos(angle);
            const y = 150 + radius * Math.sin(angle);
            
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute bg-primary/10 border border-primary/30 rounded-lg p-2 w-[100px] text-center"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: "translate(-50%, -50%)"
                }}
                title={node.description}
              >
                <span className="text-xs font-medium">{node.label}</span>
              </motion.div>
            );
          })}
          
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {conceptMap.connections.map((conn, index) => {
              // Find source and target nodes
              const sourceNode = conceptMap.nodes.find(n => n.id === conn.source);
              const targetNode = conceptMap.nodes.find(n => n.id === conn.target);
              
              if (!sourceNode || !targetNode) return null;
              
              // Calculate positions (matching the node positioning logic above)
              const sourceIndex = conceptMap.nodes.findIndex(n => n.id === conn.source);
              const targetIndex = conceptMap.nodes.findIndex(n => n.id === conn.target);
              
              const sourceAngle = (2 * Math.PI * sourceIndex) / conceptMap.nodes.length;
              const targetAngle = (2 * Math.PI * targetIndex) / conceptMap.nodes.length;
              
              const sourceRadius = sourceNode.id === "n1" ? 0 : 120;
              const targetRadius = targetNode.id === "n1" ? 0 : 120;
              
              const x1 = 150 + sourceRadius * Math.cos(sourceAngle);
              const y1 = 150 + sourceRadius * Math.sin(sourceAngle);
              const x2 = 150 + targetRadius * Math.cos(targetAngle);
              const y2 = 150 + targetRadius * Math.sin(targetAngle);
              
              // Calculate midpoint for label
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              
              return (
                <g key={`${conn.source}-${conn.target}`}>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    className="text-primary/50"
                  />
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    x={mx}
                    y={my}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="text-[8px] fill-muted-foreground bg-background px-1"
                  >
                    {conn.label}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="text-center">This is a simplified visualization. In a complete implementation, you would be able to interact with the nodes, rearrange them, and export the diagram.</p>
        </div>
      </motion.div>
    );
  };

  const renderToolContent = (type: string) => {
    const topics = {
      "concept-maps": ["Photosynthesis", "Water Cycle", "Cell Structure", "Periodic Table"],
      "flowcharts": ["Problem Solving", "Scientific Method", "Decision Making", "Data Analysis"],
      "mind-maps": ["Essay Planning", "Project Management", "Study Strategy", "Research Process"]
    };
    
    const currentTopics = topics[type as keyof typeof topics] || [];
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {type === "concept-maps" 
            ? "Concept maps help visualize relationships between ideas and concepts."
            : type === "flowcharts" 
              ? "Flowcharts illustrate processes, decisions, and sequences of events."
              : "Mind maps organize information around a central concept with branching ideas."
          }
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {currentTopics.map((topic) => (
            <Button
              key={topic}
              variant="outline"
              size="sm"
              onClick={() => handleGenerateVisual(type, topic)}
              disabled={isGenerating}
              className="justify-start"
            >
              <Zap className="mr-2 h-4 w-4 text-primary" />
              {topic}
            </Button>
          ))}
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Enter your own topic..."
            className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                handleGenerateVisual(type, e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
            disabled={isGenerating}
          />
        </div>
        
        {isGenerating && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm">Generating visualization for "{currentTopic}"...</span>
          </div>
        )}
        
        {conceptMap && !isGenerating && renderConceptMap()}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MindMap className="h-5 w-5 text-primary" />
          Visual Learning Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="concept-maps" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="concept-maps" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span>Concept Maps</span>
            </TabsTrigger>
            <TabsTrigger value="flowcharts" className="flex items-center gap-2">
              <FlowChart className="h-4 w-4" />
              <span>Flowcharts</span>
            </TabsTrigger>
            <TabsTrigger value="mind-maps" className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" />
              <span>Mind Maps</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="concept-maps">
            {renderToolContent("concept-maps")}
          </TabsContent>
          
          <TabsContent value="flowcharts">
            {renderToolContent("flowcharts")}
          </TabsContent>
          
          <TabsContent value="mind-maps">
            {renderToolContent("mind-maps")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualLearningTools;