import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
	Box,
	Activity,
	Brain,
	PackageOpen,
	Menu,
	X,
	User,
	Settings,
	LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthContext";

interface NavbarProps {
	onSignInClick?: () => void;
}

export function Navbar({ onSignInClick }: NavbarProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, logout } = useAuth();

	const handleLogoClick = () => {
		window.location.hash = "#home";
	};

	const handleSignOut = () => {
		logout();
		window.location.hash = "#home";
	};

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div
						className="flex items-center gap-2 cursor-pointer"
						onClick={handleLogoClick}
					>
						<div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
							<Box className="w-6 h-6 text-white" />
						</div>
						<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
							Vital Box
						</span>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-8">
						<a
							href="#home"
							className="text-gray-700 hover:text-emerald-600 transition-colors"
						>
							Home
						</a>
						<a
							href="#bmi"
							className="text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-2"
						>
							<Activity className="w-4 h-4" />
							BMI Calculator
						</a>
						<a
							href="#ai-advisor"
							className="text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-2"
						>
							<Brain className="w-4 h-4" />
							AI Advisor
						</a>
						<a
							href="#choose-box"
							className="text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-2"
						>
							<PackageOpen className="w-4 h-4" />
							Choose Your Box
						</a>
					</div>

					{/* Desktop CTA / User Menu */}
					<div className="hidden md:block">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
										<Avatar className="w-8 h-8 border-2 border-emerald-500">
											<AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
												{user.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className="text-gray-700">{user.name}</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<div className="px-2 py-1.5">
										<p>{user.name}</p>
										<p className="text-gray-500">{user.email}</p>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<User className="w-4 h-4 mr-2" />
										View Profile
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Settings className="w-4 h-4 mr-2" />
										Settings
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSignOut}>
										<LogOut className="w-4 h-4 mr-2" />
										Sign Out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Button
								onClick={onSignInClick}
								className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
							>
								Sign In
							</Button>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden p-2"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? (
							<X className="w-6 h-6 text-gray-700" />
						) : (
							<Menu className="w-6 h-6 text-gray-700" />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden py-4 space-y-4">
						<a
							href="#home"
							className="block text-gray-700 hover:text-emerald-600 transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Home
						</a>
						<a
							href="#bmi"
							className="block text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							<Activity className="w-4 h-4" />
							BMI Calculator
						</a>
						<a
							href="#ai-advisor"
							className="block text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							<Brain className="w-4 h-4" />
							AI Advisor
						</a>
						<a
							href="#choose-box"
							className="block text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							<PackageOpen className="w-4 h-4" />
							Choose Your Box
						</a>

						{user ? (
							<div className="space-y-2 pt-4 border-t border-gray-200">
								<div className="flex items-center gap-2 px-2">
									<Avatar className="w-8 h-8 border-2 border-emerald-500">
										<AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
											{user.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<p>{user.name}</p>
										<p className="text-gray-500">{user.email}</p>
									</div>
								</div>
								<Button variant="outline" className="w-full justify-start">
									<User className="w-4 h-4 mr-2" />
									View Profile
								</Button>
								<Button variant="outline" className="w-full justify-start">
									<Settings className="w-4 h-4 mr-2" />
									Settings
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start text-red-600 hover:text-red-700"
									onClick={handleSignOut}
								>
									<LogOut className="w-4 h-4 mr-2" />
									Sign Out
								</Button>
							</div>
						) : (
							<Button
								onClick={onSignInClick}
								className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
							>
								Sign In
							</Button>
						)}
					</div>
				)}
			</div>
		</nav>
	);
}
