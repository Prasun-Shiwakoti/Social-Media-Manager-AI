import { ArrowUpRight, Users, Eye, MessageCircle, Plus, Calendar, Image as ImageIcon, ExternalLink } from "lucide-react";
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
    const userId = useSelector((state) => state.auth.userId)
    // Initial empty state for chart, will optionally display mock data if API returns nothing or single point to avoid empty chart
    const [followerData, setFollowerData] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);

    const [stats, setStats] = useState([
        {
            title: "Total Followers",
            value: 1,
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Total Reach",
            value: 20,
            icon: Eye,
            color: "text-green-500",
        },
        {
            title: "Accounts Engaged",
            value: 3,
            icon: MessageCircle,
            color: "text-purple-500",
        },
    ]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchDashboardData = async () => {
            // console.log('yo')
            setLoading(true);

            // Fetch Insights
            const insightsRes = await axios.get('/api/dashboard/instagram/insights/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Fetch Posts
            try {
                const postsRes = await axios.get('/api/dashboard/instagram/posts/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (postsRes.data.posts && Array.isArray(postsRes.data.posts)) {
                    setRecentPosts(postsRes.data.posts.slice(0, 3));
                }
                console.log(postsRes.data.posts)
            } catch (err) {
                console.error("Error fetching posts:", err);
            }

            const metrics = insightsRes.data.insights.account_metrics;
            setStats([
                {
                    title: "Total Followers",
                    value: metrics.follower_count?.[0]?.value?.toLocaleString() || "0",
                    icon: Users,
                    color: "text-blue-500",
                },
                {
                    title: "Total Reach",
                    value: metrics.reach?.[0]?.value?.toLocaleString() || "0",
                    icon: Eye,
                    color: "text-green-500",
                },
                {
                    title: "Accounts Engaged",
                    value: metrics.accounts_engaged?.[0]?.value?.toLocaleString() || "0",
                    icon: MessageCircle,
                    color: "text-purple-500",
                },
            ]);

            // const followerSeries = metrics.follower_count || [];

            //     if (Array.isArray(followerSeries) && followerSeries.length > 0) {
            //         // If we have history (more than 1 point), map it
            //         if (followerSeries.length >= 1) {
            //             const formattedData = followerSeries.map(item => ({
            //                 name: new Date(item.end_time || Date.now()).toLocaleDateString('en-US', { weekday: 'short' }),
            //                 followers: item.value
            //             }));
            //             setFollowerData(formattedData);
            //         } else {
            //             // fallback if only 1 point: maybe show it?
            //             setFollowerData([{
            //                 name: 'Today',
            //                 followers: followerSeries[0].value
            //             }]);
            //         }
            //     } else if (metrics.followers && Array.isArray(metrics.followers)) {
            //         // Try 'followers' (new followers) count if available as proxy for activity, though graph says "Follower growth"
            //         const formattedData = metrics.followers.map(item => ({
            //             name: new Date(item.end_time || Date.now()).toLocaleDateString('en-US', { weekday: 'short' }),
            //             followers: item.value
            //         }));
            //         setFollowerData(formattedData);
            //     }


            // } catch (err) {
            //     console.error("Error fetching dashboard data:", err);
            //     setError("Failed to load dashboard data");
            // } finally {
            //     setLoading(false);
            // }
        }
        if (token) {
            fetchDashboardData();
        }
    }, [token, userId]);




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
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Analytics Chart */}
            {/* <Card className="col-span-4">
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
            </Card> */}

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your latest posts from Instagram.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentPosts.map((post) => (
                                <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                    <img
                                        src={post.media_url}
                                        alt={post.caption}
                                        className="w-10 h-10 rounded-md object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{post.caption || "No caption"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ""}
                                        </p>
                                    </div>
                                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                            {recentPosts.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent posts found.</p>
                            )}
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
