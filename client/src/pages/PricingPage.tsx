import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckIcon, StarIcon, CrownIcon, ZapIcon, InfinityIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";

// Pricing data and features from Subscription.tsx
const pricingPlans = [
	{ tier: "Pro", duration: "Monthly", price: 299, monthlyEquivalent: 299, yearlyEquivalent: 3588, savings: "", isPopular: false },
	{ tier: "Pro", duration: "Quarterly", price: 870, monthlyEquivalent: 290, yearlyEquivalent: 3480, savings: "Save ₹27/month", isPopular: true },
	{ tier: "Pro", duration: "Half-Yearly", price: 1740, monthlyEquivalent: 290, yearlyEquivalent: 3480, savings: "Save ₹54/month", isPopular: false },
	{ tier: "Pro", duration: "Yearly", price: 2820, monthlyEquivalent: 235, yearlyEquivalent: 2820, savings: "Save ₹768/year", isPopular: false },
	{ tier: "GOAT", duration: "Monthly", price: 599, monthlyEquivalent: 599, yearlyEquivalent: 7188, savings: "", isPremium: true },
	{ tier: "GOAT", duration: "Quarterly", price: 1650, monthlyEquivalent: 550, yearlyEquivalent: 6600, savings: "Save ₹147/quarter", isPremium: true },
	{ tier: "GOAT", duration: "Half-Yearly", price: 3300, monthlyEquivalent: 550, yearlyEquivalent: 6600, savings: "Save ₹294/half-year", isPremium: true },
	{ tier: "GOAT", duration: "Yearly", price: 5990, monthlyEquivalent: 499, yearlyEquivalent: 5990, savings: "Save ₹1200/year", isPremium: true, isPopular: true },
];

const proFeatures = [
	"Unlimited AI text & image questions",
	"Full note summary generator (PDF)",
	"Flashcards & custom revision plans",
	"Pomodoro + AI timer assistant",
	"500 SP/day cap",
	"Earn Nova Coins (weekly rewards)",
	"Weekly streak boosters (2x SP Sundays)",
	"AI Tutor Lite (remembers your name & subjects)",
	"Leaderboard rewards (top 50 weekly)",
	"1 streak insurance token/month",
];

const goatFeatures = [
	"All Pro features",
	"2x Study Point multiplier on all activities",
	"AI Tutor Elite (remembers style & weak areas)",
	"GOAT Badge on leaderboard & chat",
	"Exclusive store items (titles, themes, etc.)",
	"1000 SP/day cap",
	"Access to exclusive 'Study Lounge'",
	"Monthly rank certificate (PDF + shareable)",
	"Fast-track customer support",
	"Early access to new features",
	"2 streak insurance tokens/month",
];

const PricingPage: React.FC = () => {
	const { user } = useUserContext();
	const [selectedTier, setSelectedTier] = useState<string>("Pro");
	const getPlansForTier = (tier: string) => pricingPlans.filter((plan) => plan.tier === tier);

	return (
		<>
			<Helmet>
				<title>Pricing – Study Nova</title>
				<meta name="description" content="Choose the best Study Nova plan for your learning needs. Compare Pro and Goat pricing tiers." />
			</Helmet>
			<div className="min-h-screen bg-slate-950 text-white flex flex-col">
				{/* Header Section */}
				<section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-16 md:py-24 text-center">
					<div className="container mx-auto px-4">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
						<p className="text-lg md:text-xl text-blue-100 mb-6">Start for free. Upgrade anytime for more power and features.</p>
						<div className="flex justify-center gap-4 mt-8">
							<Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0 px-8 py-3 text-base font-medium">
								<Link href={user ? "/app" : "/register"}>{user ? "Go to App" : "Get Started"}</Link>
							</Button>
						</div>
					</div>
				</section>

				{/* Feature Highlights */}
				<section className="w-full py-12 md:py-20 bg-slate-950">
					<div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
						<div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700">
							<ZapIcon size={32} className="mx-auto mb-4 text-blue-400" />
							<h3 className="font-semibold mb-2">AI-Powered Learning</h3>
							<p className="text-sm text-slate-400">Advanced AI tutors that adapt to your learning style</p>
						</div>
						<div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700">
							<InfinityIcon size={32} className="mx-auto mb-4 text-purple-400" />
							<h3 className="font-semibold mb-2">Unlimited Access</h3>
							<p className="text-sm text-slate-400">No limits on chat sessions or learning materials</p>
						</div>
						<div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700">
							<CheckIcon size={32} className="mx-auto mb-4 text-green-400" />
							<h3 className="font-semibold mb-2">Proven Results</h3>
							<p className="text-sm text-slate-400">Join thousands of successful learners</p>
						</div>
					</div>
				</section>

				{/* Pricing Tabs & Cards */}
				<section className="w-full py-12 md:py-20 bg-slate-950">
					<div className="container mx-auto px-4">
						<div className="flex justify-center mb-8">
							<div className="inline-flex rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
								<button
									className={`px-6 py-3 text-lg font-semibold transition-colors ${selectedTier === "Pro" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
									onClick={() => setSelectedTier("Pro")}
								>
									<StarIcon size={18} className="inline mr-2" /> Pro
								</button>
								<button
									className={`px-6 py-3 text-lg font-semibold transition-colors ${selectedTier === "Goat" ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
									onClick={() => setSelectedTier("Goat")}
								>
									<CrownIcon size={18} className="inline mr-2 text-yellow-400" /> Goat
								</button>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{getPlansForTier(selectedTier).map((plan, idx) => (
								<div key={plan.tier + plan.duration} className={`flex flex-col rounded-2xl border shadow-lg bg-slate-800/70 border-slate-700 p-8 relative ${plan.isPopular ? "ring-2 ring-blue-500 scale-105 z-10" : ""}`}>
									{plan.isPopular && (
										<div className="absolute -top-4 right-6 bg-blue-600 px-4 py-1 rounded-full text-xs font-semibold text-white shadow-lg">Most Popular</div>
									)}
									<h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
										{selectedTier === "Goat" && <CrownIcon size={20} className="text-yellow-400" />} {plan.duration}
									</h3>
									<div className="flex items-end gap-2 mt-2">
										<span className="text-4xl font-bold text-white">₹{plan.price}</span>
										<span className="text-slate-400 text-base">/ {plan.duration.toLowerCase()}</span>
									</div>
									{plan.savings && <div className="mt-2 text-green-400 font-semibold">{plan.savings}</div>}
									<ul className="mt-8 space-y-4 flex-1">
										{(selectedTier === "Pro" ? proFeatures : goatFeatures).map((feature) => (
											<li key={feature} className="flex items-start">
												<CheckIcon className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
												<span className="text-slate-300 text-left">{feature}</span>
											</li>
										))}
									</ul>
									<div className="flex flex-col mt-8">
										<Button className={`w-full ${selectedTier === "Goat" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"} text-white border-0`}>
											{user ? "Upgrade" : "Get Started"}
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="w-full py-16 md:py-24 bg-slate-900/50">
					<div className="container mx-auto px-4 max-w-4xl text-center">
						<h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-slate-300">
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
									<p className="text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
								</div>
								<div>
									<h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
									<p className="text-sm">We accept all major credit cards, debit cards, UPI, and net banking for Indian customers.</p>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Is there a free trial?</h4>
									<p className="text-sm">Yes, we offer a 7-day free trial for new users to experience our AI tutoring platform.</p>
								</div>
							</div>
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold mb-2">What's the difference between Pro and Goat?</h4>
									<p className="text-sm">Goat plan includes advanced AI models, 1-on-1 expert sessions, and priority support for serious learners.</p>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Can I get a refund?</h4>
									<p className="text-sm">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Do you offer student discounts?</h4>
									<p className="text-sm">Yes, we offer special pricing for students. Contact our support team with your student ID for details.</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="w-full py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
					<div className="container mx-auto px-4">
						<h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
						<p className="max-w-2xl mx-auto mb-8 text-blue-100 text-lg">Join thousands of students who have accelerated their learning with our AI-powered tutoring platform. Start your journey today with a plan that fits your needs.</p>
						<Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0 px-8 py-3 text-base font-medium">
							<Link href={user ? "/app" : "/register"}>{user ? "Go to App" : "Get Started"}</Link>
						</Button>
					</div>
				</section>
			</div>
		</>
	);
};

export default PricingPage;
