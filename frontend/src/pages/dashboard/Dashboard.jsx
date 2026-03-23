import { ArrowUpRight, Users, Eye, MessageCircle, Plus, Calendar, Image as ImageIcon, ExternalLink, Heart, Loader2 } from "lucide-react";
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
    const [allPosts, setAllPosts] = useState([]); // Store all posts for aggregation
    const [profile, setProfile] = useState(null);

    const [stats, setStats] = useState([
        {
            title: "Total Followers",
            value: "0",
            icon: Users,
            color: "blue",
        },
        {
            title: "Total Reach",
            value: "0",
            icon: Eye,
            color: "indigo",
        },
        {
            title: "Total Likes",
            value: "0",
            icon: Heart,
            color: "rose",
        },
    ]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch Insights
                const insightsRes = await axios.get('/api/dashboard/instagram/insights/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch Profile
                const profileRes = await axios.get('/api/dashboard/instagram/profile/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(profileRes.data.profile);

                // Fetch Posts
                const postsRes = await axios.get('/api/dashboard/instagram/posts/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const allFetchedPosts = postsRes.data.posts || [];
                setAllPosts(allFetchedPosts);
                setRecentPosts(allFetchedPosts.slice(0, 3));

                // Process Stats
                const rawInsights = insightsRes.data.insights || [];
                const metrics = {};
                rawInsights.forEach((item) => {
                    const key = Object.keys(item)[0];
                    const metricData = item[key];
                    let vals = [];
                    if (metricData?.values && Array.isArray(metricData.values)) {
                        vals = metricData.values;
                    } else if (metricData?.total_value !== undefined) {
                        const tv = metricData.total_value;
                        const numVal = typeof tv === 'object' ? (tv?.value ?? 0) : (tv ?? 0);
                        vals = [{ value: numVal }];
                    }
                    metrics[key] = vals;
                });

                const profileData = profileRes.data.profile;

                // Help function to get latest value from insights
                const latestVal = (key) => {
                    const vals = metrics[key] || [];
                    if (vals.length === 0) return 0;
                    return vals[vals.length - 1].value ?? 0;
                };

                // Aggregated data
                const totalLikes = allFetchedPosts.reduce((sum, p) => sum + (p.like_count ?? 0), 0);
                const statFollowers = profileData?.followers_count ?? latestVal('follower_count') ?? 0;
                const statReach = latestVal('reach') ?? 0;

                setStats([
                    {
                        title: "Total Followers",
                        value: statFollowers.toLocaleString(),
                        icon: Users,
                        color: "blue",
                    },
                    {
                        title: "Total Reach",
                        value: statReach.toLocaleString(),
                        icon: Eye,
                        color: "indigo",
                    },
                    {
                        title: "Total Likes",
                        value: totalLikes.toLocaleString(),
                        icon: Heart,
                        color: "rose",
                    },
                ]);

                // Process Chart Data (Follower Growth)
                const followerSeries = metrics.follower_count || [];
                if (followerSeries.length > 0) {
                    setFollowerData(followerSeries.map(item => ({
                        name: new Date(item.end_time).toLocaleDateString('en-US', { weekday: 'short' }),
                        followers: item.value
                    })));
                } else if (profileData?.followers_count !== undefined) {
                    setFollowerData([{ name: 'Today', followers: profileData.followers_count }]);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token, userId]);




    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Syncing your dashboard...</p>
            </div>
        );
    }

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
            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const colorClasses = {
                        blue: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20",
                        indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/20",
                        rose: "bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20",
                        violet: "bg-gradient-to-br from-violet-500 to-violet-600 shadow-violet-500/20",
                        amber: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20"
                    };
                    const selectedColor = colorClasses[stat.color] || colorClasses.blue;

                    return (
                        <Card key={stat.title} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm group">
                            <CardContent className="p-0">
                                <div className="p-5 flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${selectedColor} shadow-lg`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">{stat.title}</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Analytics Chart */}
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Follower Overview</CardTitle>
                    <CardDescription>
                        Follower growth over the last 7 days.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={followerData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] text-muted-foreground" />
                                <YAxis axisLine={false} tickLine={false} className="text-[10px] text-muted-foreground" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: "hsl(var(--card))", boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="followers"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "white" }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
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
