import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Bell, Search, User } from "lucide-react";

export function Layout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Top Navbar */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-96">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full hover:bg-accent relative">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:ring-2 ring-offset-2 ring-primary transition-all">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
