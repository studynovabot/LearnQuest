import React from "react";
import {
  HomeIcon, MessageIcon, FlashlightIcon, BookOpenIcon,
  ImageIcon, SparklesIcon, UploadIcon, CreditCardIcon, PaletteIcon
} from "@/components/ui/icons";

const IconTest: React.FC = () => {
  const icons = [
    { Icon: HomeIcon, name: "Home" },
    { Icon: MessageIcon, name: "Message" },
    { Icon: FlashlightIcon, name: "Flashlight" },
    { Icon: BookOpenIcon, name: "BookOpen" },
    { Icon: ImageIcon, name: "Image" },
    { Icon: SparklesIcon, name: "Sparkles" },
    { Icon: UploadIcon, name: "Upload" },
    { Icon: CreditCardIcon, name: "CreditCard" },
    { Icon: PaletteIcon, name: "Palette" },
  ];

  return (
    <div className="p-4 bg-card border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Icon Test</h3>
      <div className="grid grid-cols-3 gap-4">
        {icons.map(({ Icon, name }) => (
          <div key={name} className="flex items-center gap-2 p-2 border rounded">
            <Icon size={20} />
            <span className="text-sm">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconTest;
