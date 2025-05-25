import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import PricingCard from "@/components/subscription/PricingCard";
import { CrownIcon, StarIcon, ZapIcon, InfinityIcon, CheckIcon } from "@/components/ui/icons";

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

const Subscription = () => {
  const [selectedTier, setSelectedTier] = useState<string>('Pro');

  // Pricing data based on your Excel sheet
  const pricingPlans: PricingPlan[] = [
    // Pro Plans
    { tier: 'Pro', duration: 'Monthly', price: 350, monthlyEquivalent: 350, yearlyEquivalent: 4200, savings: '', isPopular: false },
    { tier: 'Pro', duration: 'Quarterly', price: 870, monthlyEquivalent: 290, yearlyEquivalent: 3480, savings: 'Save ₹180', isPopular: true },
    { tier: 'Pro', duration: 'Half-Yearly', price: 1740, monthlyEquivalent: 290, yearlyEquivalent: 3480, savings: 'Save ₹360', isPopular: false },
    { tier: 'Pro', duration: 'Yearly', price: 2820, monthlyEquivalent: 235, yearlyEquivalent: 2820, savings: 'Save ₹1380', isPopular: false },

    // Goat Plans
    { tier: 'Goat', duration: 'Monthly', price: 410, monthlyEquivalent: 410, yearlyEquivalent: 4920, savings: '', isPremium: true },
    { tier: 'Goat', duration: 'Quarterly', price: 990, monthlyEquivalent: 330, yearlyEquivalent: 3960, savings: 'Save ₹240', isPremium: true },
    { tier: 'Goat', duration: 'Half-Yearly', price: 1980, monthlyEquivalent: 330, yearlyEquivalent: 3960, savings: 'Save ₹480', isPremium: true },
    { tier: 'Goat', duration: 'Yearly', price: 3180, monthlyEquivalent: 265, yearlyEquivalent: 3180, savings: 'Save ₹1740', isPremium: true, isPopular: true },
  ];

  const proFeatures = [
    "Access to all AI tutors",
    "Unlimited chat sessions",
    "Progress tracking & analytics",
    "Custom study plans",
    "Priority support",
    "Mobile app access",
    "Offline content download",
    "Basic performance insights"
  ];

  const goatFeatures = [
    "Everything in Pro",
    "Advanced AI tutoring models",
    "Personalized learning paths",
    "Real-time performance analysis",
    "1-on-1 expert sessions",
    "Advanced study materials",
    "Priority queue access",
    "Custom AI tutor training",
    "Advanced analytics dashboard",
    "Early access to new features"
  ];

  const getPlansForTier = (tier: string) => {
    return pricingPlans.filter(plan => plan.tier === tier);
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    console.log('Selected plan:', plan);
    // Here you would integrate with your payment system
  };

  return (
    <>
      <Helmet>
        <title>Subscription Plans | Study Nova - Gamified Learning Platform</title>
        <meta name="description" content="Choose the perfect subscription plan for your learning journey. Unlock premium AI tutors and advanced features." />
      </Helmet>

      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Pricing Plans
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to accelerate your learning journey with our AI-powered tutoring platform
          </p>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="text-center p-6">
            <ZapIcon size={32} className="mx-auto mb-4 text-blue-400" />
            <h3 className="font-semibold mb-2">AI-Powered Learning</h3>
            <p className="text-sm text-muted-foreground">Advanced AI tutors that adapt to your learning style</p>
          </Card>
          <Card className="text-center p-6">
            <InfinityIcon size={32} className="mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Unlimited Access</h3>
            <p className="text-sm text-muted-foreground">No limits on chat sessions or learning materials</p>
          </Card>
          <Card className="text-center p-6">
            <CheckIcon size={32} className="mx-auto mb-4 text-green-400" />
            <h3 className="font-semibold mb-2">Proven Results</h3>
            <p className="text-sm text-muted-foreground">Join thousands of successful learners</p>
          </Card>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <Tabs value={selectedTier} onValueChange={setSelectedTier} className="space-y-8">
                <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                  <TabsTrigger value="Pro" className="flex items-center gap-2">
                    <StarIcon size={16} />
                    Pro
                  </TabsTrigger>
                  <TabsTrigger value="Goat" className="flex items-center gap-2">
                    <CrownIcon size={16} />
                    Goat
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="Pro" className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Pro Plan</h2>
                    <p className="text-muted-foreground">Perfect for regular learners who want comprehensive AI tutoring</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getPlansForTier('Pro').map((plan, index) => (
                      <PricingCard
                        key={`${plan.tier}-${plan.duration}`}
                        plan={plan}
                        features={proFeatures}
                        onSelect={() => handlePlanSelect(plan)}
                        className={index === 1 ? "md:scale-105" : ""}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="Goat" className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                      <CrownIcon size={24} className="text-yellow-400" />
                      Goat Plan
                    </h2>
                    <p className="text-muted-foreground">For daily practitioners who demand the ultimate learning experience</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getPlansForTier('Goat').map((plan, index) => (
                      <PricingCard
                        key={`${plan.tier}-${plan.duration}`}
                        plan={plan}
                        features={goatFeatures}
                        onSelect={() => handlePlanSelect(plan)}
                        className={index === 3 ? "md:scale-105" : ""}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
                    <p className="text-sm text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                    <p className="text-sm text-muted-foreground">We accept all major credit cards, debit cards, UPI, and net banking for Indian customers.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                    <p className="text-sm text-muted-foreground">Yes, we offer a 7-day free trial for new users to experience our AI tutoring platform.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What's the difference between Pro and Goat?</h4>
                    <p className="text-sm text-muted-foreground">Goat plan includes advanced AI models, 1-on-1 expert sessions, and priority support for serious learners.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Can I get a refund?</h4>
                    <p className="text-sm text-muted-foreground">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Do you offer student discounts?</h4>
                    <p className="text-sm text-muted-foreground">Yes, we offer special pricing for students. Contact our support team with your student ID for details.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl font-bold">Ready to Transform Your Learning?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who have accelerated their learning with our AI-powered tutoring platform.
            Start your journey today with a plan that fits your needs.
          </p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Subscription;
