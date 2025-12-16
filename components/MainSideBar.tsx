import {Book, Package} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "./ui/sidebar";
import Link from "next/link";
import db from "@/lib/mongodb";
import {MainSideBarUserMenu} from "@/components/MainSideBarUserMenu";
import {MainSideBarGameSelector} from "@/components/MainSideBarGameSelector";

const collectionMenu = [
    {
        title: "Boosters",
        url: "/collection/boosters",
        icon: Package,
    },
    {
        title: "Decks",
        url: "/collection/decks",
        icon: Book,
    },
];

export async function MainSideBar() {
    const games = (await db.collection("games").find().toArray()).map((game) => ({
        id: game._id.toString(),
        name: game.name,
        icon: game.icon,
    }));

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">Joutes Tools</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <MainSideBarGameSelector games={games} />
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Ma Collection</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {collectionMenu.map((item) => (
                                <SidebarMenuItem
                                    key={item.title}
                                >
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className="flex items-center gap-2">
                                            {item.icon ? <item.icon size={16} /> : null}
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Outils de Jeu</SidebarGroupLabel>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <MainSideBarUserMenu />
            </SidebarFooter>
        </Sidebar>
    );
}