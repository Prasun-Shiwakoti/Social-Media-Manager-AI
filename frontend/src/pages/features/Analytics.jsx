import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const followerData = [
    { name: "Mon", followers: 4000 },
    { name: "Tue", followers: 4500 },
    { name: "Wed", followers: 4200 },
    { name: "Thu", followers: 4800 },
    { name: "Fri", followers: 5200 },
    { name: "Sat", followers: 5800 },
    { name: "Sun", followers: 6000 },
];

const engagementData = [
    { name: "Mon", likes: 240, comments: 40 },
    { name: "Tue", likes: 300, comments: 50 },
    { name: "Wed", likes: 280, comments: 45 },
    { name: "Thu", likes: 350, comments: 60 },
    { name: "Fri", likes: 400, comments: 80 },
    { name: "Sat", likes: 450, comments: 90 },
    { name: "Sun", likes: 500, comments: 100 },
];

export default function Analytics() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">Detailed insights into your social media performance.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Follower Growth</CardTitle>
                                <CardDescription>
                                    +12% increase in followers this week.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={followerData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                                            <YAxis className="text-xs text-muted-foreground" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                                                itemStyle={{ color: "hsl(var(--foreground))" }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="followers"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Engagement Rate</CardTitle>
                                <CardDescription>
                                    Daily likes and comments.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={engagementData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                                            <YAxis className="text-xs text-muted-foreground" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                                                itemStyle={{ color: "hsl(var(--foreground))" }}
                                            />
                                            <Bar dataKey="likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="comments" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="audience">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audience Demographics</CardTitle>
                            <CardDescription>Coming soon...</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Detailed audience breakdown visualization will be here.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="posts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Post Performance</CardTitle>
                            <CardDescription>Coming soon...</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Detailed post performance table will be here.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
