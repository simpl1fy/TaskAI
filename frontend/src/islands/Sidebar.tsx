import { SignOutButton, useAuth } from "@clerk/clerk-react";
import {
  LogOut,
  User,
  House,
  ChartColumnIncreasing,
  SquarePen,
  Settings,
  PanelLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Dispatch, SetStateAction } from "react";
import clsx from "clsx";

interface PropTypes {
  setActiveScreen: Dispatch<SetStateAction<String>>;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({
  setActiveScreen,
  collapsed,
  setCollapsed,
}: PropTypes) {
  const { getToken } = useAuth();
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const sidebarOptions = [
    {
      name: "Home",
      icon: <House size={20} />,
      click: "home",
    },
    {
      name: "Analytics",
      icon: <ChartColumnIncreasing size={20} />,
      click: "analytics",
    },
    {
      name: "Study Zone",
      icon: <SquarePen size={20} />,
      click: "study",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      click: "settings",
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;

      try {
        const response = await fetch(`${baseUrl}/user/info`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const resData = await response.json();
        if (resData.success) {
          setUserEmail(resData.email);
          setUsername(resData.name);
        }
      } catch (err) {
        console.error("An error occured while fetching user = " + err);
        toast.error("Failed to fetch user data. Please try again later!");
      }
    };

    fetchUserData();
  }, []);

  return (
    <div
      className={clsx(
        "bg-violet-200 h-screen sticky top-0 flex flex-col justify-between p-5",
        "transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
      aria-expanded={!collapsed}
    >
      <section>
        <header
          className={clsx(
            "flex items-center mb-5",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <h1
            className={clsx(
              "text-3xl font-bold text-violet-700 transition-all duration-200",
              collapsed ? "hidden" : "inline"
            )}
            aria-hidden={collapsed}
          >
            TaskAI
          </h1>
          <span
            className={clsx(collapsed ? "my-2" : "")}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <PanelLeft size={20} />
          </span>
        </header>
        <hr className="-mx-5 border-t-1 border-violet-300 mb-4" />
        <nav className="flex flex-col">
          {sidebarOptions.map((option, index) => (
            <button
              key={index}
              className={clsx(
                "mb-3 text-sm flex items-center p-2 gap-4 cursor-pointer",
                collapsed
                  ? "justify-center rounded-full"
                  : "rounded-lg hover:bg-violet-300 hover:shadow-sm transition-colors"
              )}
              onClick={() => setActiveScreen(option.click)}
              title={collapsed ? option.name : undefined}
            >
              <span className="shrink-0">{option.icon}</span>
              <span
                className={clsx(
                  "whitespace-nowrap transition-all duration-200",
                  collapsed ? "hidden" : "inline"
                )}
              >
                {option.name}
              </span>
            </button>
          ))}
        </nav>
      </section>
      <section className={clsx(
        "flex flex-col",
        collapsed ? "gap-6": "gap-5"
      )}>
        <hr className="-mx-5 border-t-1 border-violet-300" />

        <SignOutButton>
          <button
            className={clsx(
              "flex items-center rounded-full cursor-pointer transition-colors duration-200 justify-center",
              collapsed
                ? ""
                : "px-4 py-2 gap-3 not-odd:bg-violet-600 text-white"
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <span className={clsx(collapsed ? "p-2 justify-center items-center bg-violet-600 hover:bg-violet-700 rounded-full text-white": "")}>
              <LogOut size={19} />
            </span>
            {!collapsed && (
              <span className="text-sm transition-all duration-200">
                Signout
              </span>
            )}
          </button>
        </SignOutButton>

        <div
          className={clsx(
            "flex items-center gap-3 transition-all duration-200",
            collapsed ? "justify-center" : "justify-start"
          )}
          title="View Profile"
        >
          <section className="bg-violet-300 p-2 rounded-full">
            <User size={20} />
          </section>
          <section
            className={clsx(
              "flex flex-col gap-1 transition-all duration-200",
              collapsed ? "hidden" : "flex"
            )}
          >
            <span className="font-bold">{username}</span>
            <span className="text-sm text-gray-600">{userEmail}</span>
          </section>
        </div>
      </section>
    </div>
  );
}
