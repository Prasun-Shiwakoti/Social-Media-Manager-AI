import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3, Globe, Sparkles, TrendingUp, Users } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                        S
                    </div>
                    <span className="font-bold text-xl tracking-tight">SMM AI</span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
                    <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
                </nav>
                <div className="flex items-center gap-3">
                    <Link to="/login">
                        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
                    </Link>
                    <Link to="/signup">
                        <Button size="sm" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center pt-0">
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-8 text-center">
                                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-all hover:scale-105 border-transparent bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary shadow-md mt-2">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI-Powered Social Media Management
                                </div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                                    Supercharge your social growth with{" "}
                                    <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        AI
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                    Create stunning content, schedule posts, and analyze performance—all powered by cutting-edge AI. Focus on strategy while we handle the rest.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                    <Link to="/signup">
                                        <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:scale-105">
                                            Start for free
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-2 hover:bg-accent/50">
                                            View Demo
                                        </Button>
                                    </Link>
                                </div>

                                {/* Social Proof */}
                                <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span><strong className="text-foreground">10k+</strong> users</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        <span><strong className="text-foreground">2M+</strong> posts created</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 md:py-32 bg-muted/30 px-6 lg:px-12">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Everything you need to grow
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Powerful tools designed to help you dominate social media with ease and intelligence.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Zap,
                                    title: "AI Content Creation",
                                    description: "Generate stunning images and engaging captions in seconds with our advanced AI models.",
                                    gradient: "from-blue-500 to-cyan-500"
                                },
                                {
                                    icon: BarChart3,
                                    title: "Advanced Analytics",
                                    description: "Track your performance with detailed charts and insights to understand your audience better.",
                                    gradient: "from-purple-500 to-pink-500"
                                },
                                {
                                    icon: Globe,
                                    title: "Multi-Platform",
                                    description: "Manage Instagram, Twitter, LinkedIn, and more from a single unified dashboard.",
                                    gradient: "from-green-500 to-emerald-500"
                                }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-card p-8 rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 md:py-32 px-6 lg:px-12 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Ready to transform your social media?
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of creators and businesses using AI to grow their audience.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/signup">
                                <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:scale-105">
                                    Get Started for Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 lg:px-12 border-t border-border bg-muted/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            S
                        </div>
                        <span className="font-bold text-lg">SMM AI</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2024 Social Media Manager AI. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
