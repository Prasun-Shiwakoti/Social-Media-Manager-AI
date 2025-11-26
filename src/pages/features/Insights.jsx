import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Insights() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Weekly Insights</h2>
                <p className="text-muted-foreground">AI-powered recommendations for your growth.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Trending Now
                        </CardTitle>
                        <CardDescription className="text-indigo-100">
                            Topics gaining traction in your niche.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-center justify-between bg-white/10 p-2 rounded">
                                <span>#SustainableFashion</span>
                                <span className="text-sm font-bold">+45%</span>
                            </li>
                            <li className="flex items-center justify-between bg-white/10 p-2 rounded">
                                <span>#SummerVibes</span>
                                <span className="text-sm font-bold">+32%</span>
                            </li>
                            <li className="flex items-center justify-between bg-white/10 p-2 rounded">
                                <span>#EcoFriendly</span>
                                <span className="text-sm font-bold">+28%</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Content Ideas
                        </CardTitle>
                        <CardDescription>
                            Recommended posts based on your audience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <h4 className="font-semibold mb-1">Behind the Scenes</h4>
                            <p className="text-sm text-muted-foreground">Show how your products are made. High engagement potential.</p>
                        </div>
                        <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <h4 className="font-semibold mb-1">User Spotlight</h4>
                            <p className="text-sm text-muted-foreground">Feature a happy customer story.</p>
                        </div>
                        <Button variant="link" className="px-0">
                            View all recommendations <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
