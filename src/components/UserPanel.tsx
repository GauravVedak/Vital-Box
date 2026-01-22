"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
	Activity,
	Package,
	Calendar,
	ShoppingCart,
	LogOut,
	TrendingUp,
	Weight,
	Target,
	Home,
	X,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

type PanelSection = "body-stats" | "order-history" | "scheduled-order" | "cart";
type PanelForm = "body" | "goal";
type BodyStatsForm = {
	weight: string;
	weightUnit: "kg" | "lb";
	height: string;
	heightUnit: "cm" | "ft";
};

export function UserPanel() {
	const { user, logout } = useAuth();
	const [activeSection, setActiveSection] = useState<PanelSection>("body-stats");
	const [isStatsFormOpen, setIsStatsFormOpen] = useState(false);
	const [activeForm, setActiveForm] = useState<PanelForm>("body");
	const [bodyStatsForm, setBodyStatsForm] = useState<BodyStatsForm>({
		weight: "",
		weightUnit: "kg",
		height: "",
		heightUnit: "cm",
	});
	const [goalWeightInput, setGoalWeightInput] = useState("");

	// Hardcoded data for the chart - in real app, this would come from the API
	const [weightHistory, setWeightHistory] = useState([
		{ date: "Jan", weight: 75, bmi: 24.5 },
		{ date: "Feb", weight: 73.5, bmi: 24.0 },
		{ date: "Mar", weight: 72, bmi: 23.5 },
		{ date: "Apr", weight: 71, bmi: 23.2 },
		{ date: "May", weight: 70, bmi: 22.9 },
		{ date: "Jun", weight: 69, bmi: 22.5 },
	]);
	const [goalWeight, setGoalWeight] = useState(65);

	const currentWeight = weightHistory[weightHistory.length - 1]?.weight ?? 0;
	const startWeight = weightHistory[0]?.weight ?? 0;
	const progressRange = startWeight - goalWeight;
	const weightProgress =
		progressRange === 0
			? 0
			: Math.max(
					0,
					Math.min(100, ((startWeight - currentWeight) / progressRange) * 100)
				);

	const chartConfig = {
		weight: {
			label: "Weight (kg)",
			color: "#10b981",
		},
		bmi: {
			label: "BMI",
			color: "#14b8a6",
		},
	};

	const handleLogout = () => {
		logout();
		window.location.hash = "#home";
	};

	const handleBackToHome = () => {
		window.location.hash = "#home";
	};

	const handleOpenBodyStatsForm = () => {
		setActiveForm("body");
		setBodyStatsForm((prev) => ({
			...prev,
			weight: currentWeight.toString(),
		}));
		setIsStatsFormOpen(true);
	};

	const handleOpenGoalWeightForm = () => {
		setActiveForm("goal");
		setGoalWeightInput(goalWeight.toString());
		setIsStatsFormOpen(true);
	};

	const handleCloseStatsForm = () => {
		setIsStatsFormOpen(false);
	};

	const handleBodyStatsSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const rawWeight = Number(bodyStatsForm.weight);
		const rawHeight = Number(bodyStatsForm.height);

		if (Number.isNaN(rawWeight) || rawWeight <= 0) {
			return;
		}

		const nextWeightKg =
			bodyStatsForm.weightUnit === "lb" ? rawWeight * 0.453592 : rawWeight;
		const nextHeightMeters =
			bodyStatsForm.heightUnit === "ft" ? rawHeight * 0.3048 : rawHeight / 100;
		const lastEntry = weightHistory[weightHistory.length - 1];
		const nextBmi =
			nextHeightMeters > 0
				? nextWeightKg / (nextHeightMeters * nextHeightMeters)
				: lastEntry?.bmi ?? 0;
		const nextLabel = new Date().toLocaleString("en-US", { month: "short" });

		setWeightHistory((prev) => [
			...prev,
			{
				date: nextLabel,
				weight: Number(nextWeightKg.toFixed(1)),
				bmi: Number(nextBmi.toFixed(1)),
			},
		]);
		setIsStatsFormOpen(false);
	};

	const handleGoalWeightSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const nextGoalWeight = Number(goalWeightInput);
		if (!Number.isNaN(nextGoalWeight) && nextGoalWeight > 0) {
			setGoalWeight(nextGoalWeight);
			setIsStatsFormOpen(false);
		}
	};

	const navigationItems = [
		{
			id: "body-stats" as PanelSection,
			label: "Body Stats",
			icon: Activity,
		},
		{
			id: "order-history" as PanelSection,
			label: "Order History",
			icon: Package,
		},
		{
			id: "scheduled-order" as PanelSection,
			label: "Scheduled Order",
			icon: Calendar,
		},
		{
			id: "cart" as PanelSection,
			label: "Cart",
			icon: ShoppingCart,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<div className="flex h-screen">
				{/* Left Sidebar Navigation */}
				<aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
					{/* Header */}
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-xl font-bold text-gray-900">User Panel</h2>
						<p className="text-sm text-gray-600 mt-1">{user?.name}</p>
					</div>

					{/* Navigation Items */}
					<nav className="flex-1 p-4 space-y-2">
						<motion.button
							onClick={handleBackToHome}
							className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Home className="w-5 h-5" />
							<span className="font-medium">Back To Home Screen</span>
						</motion.button>
						{navigationItems.map((item) => {
							const Icon = item.icon;
							const isActive = activeSection === item.id;
							return (
								<motion.button
									key={item.id}
									onClick={() => setActiveSection(item.id)}
									className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
										isActive
											? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
											: "text-gray-700 hover:bg-gray-100"
									}`}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Icon className="w-5 h-5" />
									<span className="font-medium">{item.label}</span>
								</motion.button>
							);
						})}
					</nav>

					{/* Logout Button */}
					<div className="p-4 border-t border-gray-200">
						<motion.button
							onClick={handleLogout}
							className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<LogOut className="w-5 h-5" />
							<span className="font-medium">Log out</span>
						</motion.button>
					</div>
				</aside>

				{/* Main Content Area */}
				<main className="flex-1 overflow-y-auto p-8">
					{activeSection === "body-stats" && (
						<div className="relative">
							<div
								className={`max-w-7xl mx-auto space-y-6 transition-all duration-300 ${
									isStatsFormOpen ? "sm:pr-[360px]" : "sm:pr-0"
								}`}
							>
								<div>
									<h1 className="text-3xl font-bold text-gray-900">Body Stats</h1>
									<p className="text-gray-600 mt-2">
										Track your weight and BMI progress over time
									</p>
								</div>

								{/* Goal Weight Progress */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Target className="w-5 h-5 text-emerald-600" />
											Goal Weight Progress
										</CardTitle>
										<CardDescription>
											Progress towards your goal weight of {goalWeight} kg
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="mb-4 flex justify-end">
											<motion.button
												onClick={handleOpenGoalWeightForm}
												className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Update Goal Weight
											</motion.button>
										</div>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm text-gray-600">Current Weight</p>
													<p className="text-2xl font-bold text-gray-900">
														{currentWeight} kg
													</p>
												</div>
												<div className="text-right">
													<p className="text-sm text-gray-600">Goal Weight</p>
													<p className="text-2xl font-bold text-emerald-600">
														{goalWeight} kg
													</p>
												</div>
											</div>
											<div className="space-y-2">
												<Progress
													value={Math.abs(weightProgress)}
													className="h-3"
												/>
												<p className="text-sm text-gray-600 text-center">
													{Math.abs(weightProgress).toFixed(1)}% progress
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Weight History Chart */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Weight className="w-5 h-5 text-emerald-600" />
											Weight History
										</CardTitle>
										<CardDescription>
											Your weight progression over the past 6 months
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="mb-4 flex justify-end">
											<motion.button
												onClick={handleOpenBodyStatsForm}
												className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Update Body Stats
											</motion.button>
										</div>
										<ChartContainer
											config={chartConfig}
											className="h-[400px] w-full"
										>
											<LineChart data={weightHistory}>
												<CartesianGrid
													strokeDasharray="3 3"
													className="stroke-gray-200"
												/>
												<XAxis
													dataKey="date"
													className="text-xs"
													tick={{ fill: "#6b7280" }}
												/>
												<YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
												<ChartTooltip content={<ChartTooltipContent />} />
												<Legend />
												<Line
													type="monotone"
													dataKey="weight"
													stroke="#10b981"
													strokeWidth={2}
													name="Weight (kg)"
													dot={{ fill: "#10b981", r: 4 }}
													activeDot={{ r: 6 }}
												/>
											</LineChart>
										</ChartContainer>
									</CardContent>
								</Card>

								{/* BMI History Chart */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<TrendingUp className="w-5 h-5 text-emerald-600" />
											BMI History
										</CardTitle>
										<CardDescription>
											Your BMI progression over the past 6 months
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={chartConfig}
											className="h-[400px] w-full"
										>
											<LineChart data={weightHistory}>
												<CartesianGrid
													strokeDasharray="3 3"
													className="stroke-gray-200"
												/>
												<XAxis
													dataKey="date"
													className="text-xs"
													tick={{ fill: "#6b7280" }}
												/>
												<YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
												<ChartTooltip content={<ChartTooltipContent />} />
												<Legend />
												<Line
													type="monotone"
													dataKey="bmi"
													stroke="#14b8a6"
													strokeWidth={2}
													name="BMI"
													dot={{ fill: "#14b8a6", r: 4 }}
													activeDot={{ r: 6 }}
												/>
											</LineChart>
										</ChartContainer>
									</CardContent>
								</Card>
							</div>

							<motion.aside
								initial={false}
								animate={
									isStatsFormOpen
										? { x: 0, opacity: 1 }
										: { x: 380, opacity: 0 }
								}
								transition={{ type: "spring", stiffness: 260, damping: 28 }}
								className="absolute right-0 top-0 h-full w-full sm:w-[360px] rounded-l-3xl border-l border-gray-200 bg-white p-6 shadow-xl"
								style={{ pointerEvents: isStatsFormOpen ? "auto" : "none" }}
								aria-hidden={!isStatsFormOpen}
							>
								<div className="space-y-6">
									<div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
										<div>
											<h2 className="text-lg font-semibold text-gray-900">
												{activeForm === "body"
													? "Update Body Stats"
													: "Update Goal Weight"}
											</h2>
											<p className="text-sm text-gray-600">
												{activeForm === "body"
													? "Enter your latest measurements."
													: "Set the target you'd like to reach."}
											</p>
										</div>
										<motion.button
											onClick={handleCloseStatsForm}
											className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											aria-label="Close form"
										>
											<X className="h-4 w-4" />
										</motion.button>
									</div>

									{activeForm === "body" ? (
										<form className="space-y-5" onSubmit={handleBodyStatsSubmit}>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Weight
												</label>
												<div className="flex gap-2">
													<input
														type="number"
														min="0"
														step="0.1"
														value={bodyStatsForm.weight}
														onChange={(event) =>
															setBodyStatsForm((prev) => ({
																...prev,
																weight: event.target.value,
															}))
														}
														className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
														placeholder="Enter weight"
													/>
													<select
														value={bodyStatsForm.weightUnit}
														onChange={(event) =>
															setBodyStatsForm((prev) => ({
																...prev,
																weightUnit: event.target.value as BodyStatsForm["weightUnit"],
															}))
														}
														className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
													>
														<option value="kg">kg</option>
														<option value="lb">lb</option>
													</select>
												</div>
											</div>

											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Height
												</label>
												<div className="flex gap-2">
													<input
														type="number"
														min="0"
														step="0.1"
														value={bodyStatsForm.height}
														onChange={(event) =>
															setBodyStatsForm((prev) => ({
																...prev,
																height: event.target.value,
															}))
														}
														className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
														placeholder="Enter height"
													/>
													<select
														value={bodyStatsForm.heightUnit}
														onChange={(event) =>
															setBodyStatsForm((prev) => ({
																...prev,
																heightUnit: event.target.value as BodyStatsForm["heightUnit"],
															}))
														}
														className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
													>
														<option value="cm">cm</option>
														<option value="ft">ft</option>
													</select>
												</div>
											</div>

											<button
												type="submit"
												className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
											>
												Save Body Stats
											</button>
										</form>
									) : (
										<form className="space-y-5" onSubmit={handleGoalWeightSubmit}>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Goal Weight (kg)
												</label>
												<input
													type="number"
													min="0"
													step="0.1"
													value={goalWeightInput}
													onChange={(event) => setGoalWeightInput(event.target.value)}
													className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
													placeholder="Enter your goal weight"
												/>
											</div>
											<button
												type="submit"
												className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
											>
												Save Goal Weight
											</button>
										</form>
									)}
								</div>
							</motion.aside>
						</div>
					)}

					{activeSection === "order-history" && (
						<div className="max-w-7xl mx-auto space-y-6">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">Order History</h1>
								<p className="text-gray-600 mt-2">View your past orders</p>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>Recent Orders</CardTitle>
									<CardDescription>Your order history will appear here</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-12 text-gray-500">
										<Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
										<p>No orders yet</p>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{activeSection === "scheduled-order" && (
						<div className="max-w-7xl mx-auto space-y-6">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">Scheduled Orders</h1>
								<p className="text-gray-600 mt-2">
									Manage your subscription and scheduled deliveries
								</p>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>Upcoming Deliveries</CardTitle>
									<CardDescription>
										Your scheduled orders will appear here
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-12 text-gray-500">
										<Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
										<p>No scheduled orders</p>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{activeSection === "cart" && (
						<div className="max-w-7xl mx-auto space-y-6">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">Cart</h1>
								<p className="text-gray-600 mt-2">Review your items before checkout</p>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>Shopping Cart</CardTitle>
									<CardDescription>Items in your cart</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-12 text-gray-500">
										<ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
										<p>Your cart is empty</p>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
