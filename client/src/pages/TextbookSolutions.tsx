import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookIcon } from "@/components/ui/icons";

const TextbookSolutions: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Textbook Solutions</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Textbook solutions coming soon! Stay tuned for comprehensive solutions to your textbook problems.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextbookSolutions; 