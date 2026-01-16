import {ExternalLinkIcon, Package, Sheet} from "lucide-react";
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
import MainSideBarGameMenu from "./MainSideBarGameMenu";

const collectionMenu = [
    {
        title: "Boosters",
        url: "/collection/boosters",
        icon: Package,
    },
    {
        title: "Cartes",
        url: "/collection/cards",
        icon: Sheet,
    },
    {
        title: "Evènements",
        url: "https://joutes.app",
        icon: ExternalLinkIcon,
        external: true,
    },
];

export async function MainSideBar() {
    const games = (await db.collection("games").find().toArray()).map((game) => ({
        id: game._id.toString(),
        name: game.name,
        icon: game.icon,
        slug: game.slug,
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
                                        <Link href={item.url} className="flex items-center gap-2" target={item.external ? "_blank" : "_self"} rel={item.external ? "noopener noreferrer" : undefined}>
                                            {item.icon ? <item.icon size={16} /> : null}
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <MainSideBarGameMenu />
            </SidebarContent>
            <SidebarFooter>
                <MainSideBarUserMenu />
            </SidebarFooter>
        </Sidebar>
    );
}