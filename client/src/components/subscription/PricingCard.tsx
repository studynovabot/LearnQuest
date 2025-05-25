import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CrownIcon, StarIcon } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PricingPlan {
  tier: string;
  duration: string;
  price: number;
  monthlyEquivalent: number;
  yearlyEquivalent: number;
  savings: string;
  isPopular?: boolean;
  isPremium?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  features: string[];
  onSelect: () => void;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  features,
  onSelect,
  className
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'Monthly': return 'month';
      case 'Quarterly': return 'quarter';
      case 'Half-Yearly': return 'half-year';
      case 'Yearly': return 'year';
      default: return duration.toLowerCase();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("relative", className)}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        plan.isPremium ? "border-2 border-primary glow-blue" : "hover:border-primary/50",
        plan.isPopular ? "scale-105" : "hover:scale-102"
      )}>
        {plan.isPopular && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-semibold shadow-lg">
              Most Popular
            </Badge>
          </div>
        )}

        {plan.isPremium && (
          <div className="absolute top-4 right-4">
            <CrownIcon size={24} className="text-yellow-400" />
          </div>
        )}

        <CardHeader className={cn(
          "text-center pb-4",
          plan.isPremium ? "bg-gradient-to-br from-purple-900/20 to-blue-900/20" : ""
        )}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {plan.isPremium ? (
              <CrownIcon size={20} className="text-yellow-400" />
            ) : (
              <StarIcon size={20} className="text-blue-400" />
            )}
            <CardTitle className="text-2xl font-bold">
              {plan.tier}
            </CardTitle>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            {plan.tier === 'Pro' ? 'Best for regular learners' : 'For daily practitioners'}
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold">
              {formatPrice(plan.price)}
              <span className="text-lg font-normal text-muted-foreground">
                /{getDurationLabel(plan.duration)}
              </span>
            </div>

            {plan.duration !== 'Monthly' && (
              <div className="text-sm text-muted-foreground">
                {formatPrice(plan.monthlyEquivalent)}/month
              </div>
            )}

            {plan.savings && (
              <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                <CheckIcon size={14} />
                {plan.savings}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckIcon size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={onSelect}
            className={cn(
              "w-full py-3 font-semibold transition-all duration-300",
              plan.isPremium
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                : "bg-primary hover:bg-primary/90"
            )}
            size="lg"
          >
            Get Started
          </Button>

          {plan.duration !== 'Monthly' && (
            <div className="text-center text-xs text-muted-foreground">
              Billed {plan.duration.toLowerCase()}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PricingCard;
