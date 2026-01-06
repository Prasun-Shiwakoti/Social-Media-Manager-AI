import { ArrowUpRight, Users, Eye, MessageCircle, Plus, Calendar, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Dashboard() {

    const token = useSelector((state) => state.auth.token)
    console.log(token)
    const id = 1;
    const followerData = [
        { name: "Mon", followers: 4000 },
        { name: "Tue", followers: 4500 },
        { name: "Wed", followers: 4200 },
        { name: "Thu", followers: 4800 },
        { name: "Fri", followers: 5200 },
        { name: "Sat", followers: 5800 },
        { name: "Sun", followers: 6000 },
    ];

    const stats = [
        {
            title: "Total Followers",
            value: "12,345",
            change: "+12%",
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Total Reach",
            value: "45.2k",
            change: "+8%",
            icon: Eye,
            color: "text-green-500",
        },
        {
            title: "Engagement Rate",
            value: "4.8%",
            change: "+2.1%",
            icon: MessageCircle,
            color: "text-purple-500",
        },
    ];

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setLoading(true);
        axios.get(`/api/account/business-accounts/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }).then(function (res) {
            console.log(res)
        }).catch((err) => {
            console.log(err);
            setError(err);
        })
        return () => {
            setLoading(false)
        }

    }, [])




    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-4">

                    <Button asChild>
                        <Link to="/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Content
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <span className="text-green-500 flex items-center mr-1">
                                        {stat.change}
                                        <ArrowUpRight className="h-3 w-3 ml-0.5" />
                                    </span>
                                    from last month
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Analytics Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                        Follower growth over the last 7 days.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px]">
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

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            You have 3 unread messages and 5 new comments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New comment on "Summer Vibes"</p>
                                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Shortcuts to your most used tools.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="w-full justify-start h-auto py-4" asChild>
                            <Link to="/create">
                                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-md mr-4">
                                    <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Generate Image</div>
                                    <div className="text-xs text-muted-foreground">Create AI visuals</div>
                                </div>
                            </Link>
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
