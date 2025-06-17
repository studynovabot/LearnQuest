import React, { useState } from 'react';
import { PremiumButton } from './PremiumButton';
import { PremiumCard } from './PremiumCard';
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  CreditCard, 
  Users, 
  Star,
  Sparkles,
  Rocket,
  Trophy,
  Target,
  Brain,
  Clock,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  color: 'blue' | 'purple' | 'gradient';
  icon: React.ReactNode;
}

export const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "₹0",
      period: "/month",
      description: "Perfect for trying out StudyNova AI",
      features: [
        "Basic AI tutors",
        "25% of AI answers revealed",
        "5 flashcards per day",
        "2 AI revision sessions per day",
        "Standard XP (daily cap)",
        "Basic leaderboard access"
      ],
      cta: "Start Free",
      color: "blue",
      icon: <Rocket className="h-6 w-6" />
    },
    {
      name: "Premium",
      price: isAnnual ? "₹149" : "₹199",
      originalPrice: isAnnual ? "₹249" : "₹299",
      period: "/month",
      description: "Unlock your full potential",
      features: [
        "Full AI answers with explanations",
        "CBSE topper-formatted answers",
        "AIR Rank Simulator",
        "Smart Study Plan generator",
        "Unlimited AI flashcards",
        "Unlimited revision sessions",
        "2x XP and streak shields",
        "PDF export of answers",
        "Weak chapter detection"
      ],
      cta: "Start 7-Day Free Trial",
      popular: true,
      color: "gradient",
      icon: <Crown className="h-6 w-6" />
    },
    {
      name: "School Plan",
      price: isAnnual ? "₹99" : "₹149",
      originalPrice: isAnnual ? "₹199" : "₹249",
      period: "/student/month",
      description: "For educational institutions",
      features: [
        "All Premium features",
        "Bulk student accounts",
        "Teacher dashboard",
        "Class performance analytics",
        "Custom curriculum integration",
        "Dedicated account manager",
        "Teacher training sessions",
        "Priority support",
        "Custom branding options"
      ],
      cta: "Contact Sales",
      color: "purple",
      icon: <Users className="h-6 w-6" />
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200 mb-6">
              <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-indigo-700">Choose Your Learning Plan</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Unlock Your Learning
              <span className="block text-gradient">Potential</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start free, upgrade when you're ready for more. Join 50,000+ students achieving 95% better grades.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isAnnual ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
                <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-medium">
                  Save 40%
                </span>
              </span>
            </div>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full shadow-lg">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <PremiumCard 
                className={`p-8 h-full ${plan.popular ? 'ring-2 ring-indigo-500 shadow-2xl scale-105' : ''}`}
                hover={!plan.popular}
              >
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  }`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through mr-2">
                          {plan.originalPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-1">
                        {plan.period}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-emerald-600 font-medium mt-1">
                        Save {Math.round(((parseInt(plan.originalPrice.slice(1)) - parseInt(plan.price.slice(1))) / parseInt(plan.originalPrice.slice(1))) * 100)}%
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  
                  <PremiumButton
                    variant={plan.popular ? 'gradient' : plan.color === 'gradient' ? 'gradient' : 'primary'}
                    size="lg"
                    className="w-full mb-6"
                  >
                    {plan.cta}
                  </PremiumButton>
                </div>
                
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
        
        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-emerald-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              <span>Join 50,000+ students</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600">
              4.9/5 from 12,000+ reviews
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};