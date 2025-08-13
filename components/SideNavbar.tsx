"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useSidebar } from "@/context/SidebarContext";

export default function SideNavbar({
  avatar,
  name,
  playgroundActive = true,
  onCollapse,
}: {
  avatar?: string;
  name?: string;
  playgroundActive?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}) {
  const { registrationData, userData } = useUser();
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use provided props or fall back to context data
  const userAvatar =
    avatar || userData?.avatar || registrationData.avatar || "/User.png";
  const userName = name || userData?.name || registrationData.name || "User";
  const pathname = usePathname();

  // Notify parent when collapsed state changes (for backward compatibility)
  useEffect(() => {
    onCollapse?.(sidebarCollapsed);
  }, [sidebarCollapsed, onCollapse]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use userData from context for mission completion status
  const hasCompletedMission3 = userData?.hasCompletedMission3 || false;

  const navItems = [
    {
      icon: "home",
      label: "Home",
      href: "/home",
      active: pathname === "/home",
    },
    {
      icon: "missions",
      label: "Missions",
      href: "/missions",
      active: pathname === "/missions",
    },
    hasCompletedMission3
      ? {
          icon: "playground-active",
          label: "Playground",
          href: "/playground",
          active: pathname === "/playground" || playgroundActive,
        }
      : {
          icon: "playground-disabled",
          label: "Playground",
          href: "#",
          disabled: true,
        },
    {
      icon: "demo",
      label: "Demo",
      href: "/demo",
      active: pathname === "/demo",
    },
    {
      icon: "projects",
      label: "Projects",
      href: "/projects",
      active: pathname === "/projects",
    },
  ];

  // SVG icon components
  const renderIcon = (
    iconType: string,
    isActive: boolean = false,
    isDisabled: boolean = false
  ) => {
    const color = isDisabled ? "#BDC8D5" : "#222E3A";

    switch (iconType) {
      case "home":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 50 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.261719 47.8266V20.0552C0.261719 19.078 0.481374 18.1523 0.920687 17.278C1.36 16.4038 1.96534 15.6838 2.73672 15.118L21.2992 1.23233C22.382 0.409476 23.6195 -0.00195312 25.0117 -0.00195312C26.4039 -0.00195312 27.6414 0.409476 28.7242 1.23233L47.2867 15.118C48.0601 15.6838 48.6665 16.4038 49.1058 17.278C49.5451 18.1523 49.7638 19.078 49.7617 20.0552V47.8266C49.7617 49.5238 49.1553 50.9771 47.9426 52.1867C46.7298 53.3963 45.2737 54.0001 43.5742 53.998H34.293C33.4164 53.998 32.6821 53.7018 32.0902 53.1093C31.4983 52.5169 31.2013 51.7845 31.1992 50.9123V35.4838C31.1992 34.6095 30.9022 33.8771 30.3082 33.2867C29.7142 32.6963 28.98 32.4001 28.1055 32.398H21.918C21.0414 32.398 20.3072 32.6943 19.7152 33.2867C19.1233 33.8792 18.8263 34.6115 18.8242 35.4838V50.9123C18.8242 51.7866 18.5272 52.52 17.9332 53.1124C17.3392 53.7049 16.605 54.0001 15.7305 53.998H6.44922C4.74766 53.998 3.29153 53.3943 2.08084 52.1867C0.870156 50.9792 0.263781 49.5258 0.261719 47.8266Z"
              fill={color}
            />
          </svg>
        );

      case "missions":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 50 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M42.5118 7.6114C47.0555 12.148 49.6543 18.2713 49.7585 24.6866C49.8626 31.1018 47.4641 37.3061 43.07 41.9874L42.5118 42.564L30.8438 54.2121C29.3633 55.6895 27.3758 56.5497 25.2839 56.6186C23.192 56.6874 21.152 55.9597 19.5774 54.5828L19.1814 54.2121L7.51068 42.5613C2.86925 37.9266 0.261719 31.6407 0.261719 25.0863C0.261719 18.532 2.86925 12.246 7.51068 7.6114C12.1521 2.97676 18.4472 0.373047 25.0112 0.373047C31.5752 0.373047 37.8703 2.97676 42.5118 7.6114ZM25.0112 16.8486C23.9278 16.8486 22.8551 17.0617 21.8542 17.4757C20.8533 17.8897 19.9438 18.4964 19.1777 19.2614C18.4117 20.0263 17.804 20.9345 17.3894 21.9339C16.9748 22.9333 16.7614 24.0045 16.7614 25.0863C16.7614 26.1681 16.9748 27.2393 17.3894 28.2388C17.804 29.2382 18.4117 30.1463 19.1777 30.9113C19.9438 31.6762 20.8533 32.283 21.8542 32.697C22.8551 33.111 23.9278 33.324 25.0112 33.324C27.1992 33.324 29.2976 32.4561 30.8447 30.9113C32.3918 29.3664 33.261 27.2711 33.261 25.0863C33.261 22.9016 32.3918 20.8063 30.8447 19.2614C29.2976 17.7165 27.1992 16.8486 25.0112 16.8486Z"
              fill={color}
            />
          </svg>
        );

      case "playground-active":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 61 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M27.0117 -0.00195312V12.508C25.3009 13.1129 23.8127 14.2205 22.7423 15.6859C21.672 17.1512 21.0694 18.9057 21.0136 20.7195C20.9578 22.5333 21.4515 24.3215 22.4297 25.8499C23.408 27.3782 24.8253 28.5752 26.4957 29.2841L27.0117 29.4851V41.9981H6.01172C4.49799 41.9985 3.04002 41.4268 1.93008 40.3976C0.820131 39.3683 0.140249 37.9575 0.0267194 36.4481L0.0117191 35.9981V32.9981H9.01172C10.5254 32.9985 11.9834 32.4268 13.0934 31.3976C14.2033 30.3683 14.8832 28.9575 14.9967 27.448L15.0117 26.9981V14.998C15.0122 13.4843 14.4405 12.0263 13.4112 10.9164C12.382 9.80646 10.9712 9.12658 9.46172 9.01305L9.01172 8.99805H0.0117191V5.99805C0.01124 4.48432 0.582938 3.02635 1.61221 1.9164C2.64148 0.806459 4.05225 0.126577 5.56172 0.0130472L6.01172 -0.00195312H27.0117ZM54.0117 -0.00195312C55.603 -0.00195312 57.1292 0.630188 58.2544 1.75541C59.3796 2.88062 60.0117 4.40675 60.0117 5.99805V8.99805H51.0117C49.4204 8.99805 47.8943 9.63019 46.7691 10.7554C45.6439 11.8806 45.0117 13.4067 45.0117 14.998V26.9981C45.0117 28.5893 45.6439 30.1155 46.7691 31.2407C47.8943 32.3659 49.4204 32.9981 51.0117 32.9981H60.0117V35.9981C60.0117 37.5894 59.3796 39.1155 58.2544 40.2407C57.1292 41.3659 55.603 41.9981 54.0117 41.9981H33.0117V29.4881C34.7683 28.8682 36.2894 27.7188 37.3654 26.1983C38.4413 24.6777 39.0191 22.8608 39.0191 20.9981C39.0191 19.1353 38.4413 17.3184 37.3654 15.7978C36.2894 14.2773 34.7683 13.1279 33.0117 12.508V-0.00195312H54.0117ZM9.01172 14.998V26.9981H0.0117191V14.998H9.01172ZM60.0117 14.998V26.9981H51.0117V14.998H60.0117ZM30.0117 17.9981C30.8074 17.9981 31.5704 18.3141 32.133 18.8767C32.6957 19.4393 33.0117 20.2024 33.0117 20.9981C33.0117 21.7937 32.6957 22.5568 32.133 23.1194C31.5704 23.682 30.8074 23.9981 30.0117 23.9981C29.2161 23.9981 28.453 23.682 27.8904 23.1194C27.3278 22.5568 27.0117 21.7937 27.0117 20.9981C27.0117 20.2024 27.3278 19.4393 27.8904 18.8767C28.453 18.3141 29.2161 17.9981 30.0117 17.9981Z"
              fill={color}
            />
          </svg>
        );

      case "playground-disabled":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 61 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M27.0117 -0.00195312V12.508C25.3009 13.1129 23.8127 14.2205 22.7423 15.6859C21.672 17.1512 21.0694 18.9057 21.0136 20.7195C20.9578 22.5333 21.4515 24.3215 22.4297 25.8499C23.408 27.3782 24.8253 28.5752 26.4957 29.2841L27.0117 29.4851V41.9981H6.01172C4.49799 41.9985 3.04002 41.4268 1.93008 40.3976C0.820131 39.3683 0.140249 37.9575 0.0267194 36.4481L0.0117191 35.9981V32.9981H9.01172C10.5254 32.9985 11.9834 32.4268 13.0934 31.3976C14.2033 30.3683 14.8832 28.9575 14.9967 27.448L15.0117 26.9981V14.998C15.0122 13.4843 14.4405 12.0263 13.4112 10.9164C12.382 9.80646 10.9712 9.12658 9.46172 9.01305L9.01172 8.99805H0.0117191V5.99805C0.01124 4.48432 0.582938 3.02635 1.61221 1.9164C2.64148 0.806459 4.05225 0.126577 5.56172 0.0130472L6.01172 -0.00195312H27.0117ZM54.0117 -0.00195312C55.603 -0.00195312 57.1292 0.630188 58.2544 1.75541C59.3796 2.88062 60.0117 4.40675 60.0117 5.99805V8.99805H51.0117C49.4204 8.99805 47.8943 9.63019 46.7691 10.7554C45.6439 11.8806 45.0117 13.4067 45.0117 14.998V26.9981C45.0117 28.5893 45.6439 30.1155 46.7691 31.2407C47.8943 32.3659 49.4204 32.9981 51.0117 32.9981H60.0117V35.9981C60.0117 37.5894 59.3796 39.1155 58.2544 40.2407C57.1292 41.3659 55.603 41.9981 54.0117 41.9981H33.0117V29.4881C34.7683 28.8682 36.2894 27.7188 37.3654 26.1983C38.4413 24.6777 39.0191 22.8608 39.0191 20.9981C39.0191 19.1353 38.4413 17.3184 37.3654 15.7978C36.2894 14.2773 34.7683 13.1279 33.0117 12.508V-0.00195312H54.0117ZM9.01172 14.998V26.9981H0.0117191V14.998H9.01172ZM60.0117 14.998V26.9981H51.0117V14.998H60.0117ZM30.0117 17.9981C30.8074 17.9981 31.5704 18.3141 32.133 18.8767C32.6957 19.4393 33.0117 20.2024 33.0117 20.9981C33.0117 21.7937 32.6957 22.5568 32.133 23.1194C31.5704 23.682 30.8074 23.9981 30.0117 23.9981C29.2161 23.9981 28.453 23.682 27.8904 23.1194C27.3278 22.5568 27.0117 21.7937 27.0117 20.9981C27.0117 20.2024 27.3278 19.4393 27.8904 18.8767C28.453 18.3141 29.2161 17.9981 30.0117 17.9981Z"
              fill={color}
            />
          </svg>
        );

      case "demo":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 61 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={""}
            style={{
              filter: "none",
            }}
          >
            <path
              d="M18.7617 23.748C15.2617 23.748 12.5117 26.498 12.5117 29.998C12.5117 33.498 15.2617 36.2481 18.7617 36.2481C22.2617 36.2481 25.0117 33.498 25.0117 29.998C25.0117 26.498 22.2617 23.748 18.7617 23.748ZM41.2617 23.748C37.7617 23.748 35.0117 26.498 35.0117 29.998C35.0117 33.498 37.7617 36.2481 41.2617 36.2481C44.7617 36.2481 47.5117 33.498 47.5117 29.998C47.5117 26.498 44.7617 23.748 41.2617 23.748ZM30.0117 9.99805C41.0117 9.99805 50.0117 18.998 50.0117 29.998C50.0117 40.9981 41.0117 49.9981 30.0117 49.9981C19.0117 49.9981 10.0117 40.9981 10.0117 29.998C10.0117 18.998 19.0117 9.99805 30.0117 9.99805ZM30.0117 4.99805C16.2617 4.99805 5.01172 16.248 5.01172 29.998C5.01172 43.7481 16.2617 54.9981 30.0117 54.9981C43.7617 54.9981 55.0117 43.7481 55.0117 29.998C55.0117 16.248 43.7617 4.99805 30.0117 4.99805ZM30.0117 12.498C26.5117 12.498 23.7617 15.248 23.7617 18.748C23.7617 22.248 26.5117 24.998 30.0117 24.998C33.5117 24.998 36.2617 22.248 36.2617 18.748C36.2617 15.248 33.5117 12.498 30.0117 12.498ZM33.7617 18.748C33.7617 19.248 33.5117 19.748 33.2617 20.248L31.7617 18.748L33.2617 17.248C33.5117 17.748 33.7617 18.248 33.7617 18.748ZM31.5117 15.498L30.0117 16.998L28.5117 15.498C29.0117 15.248 29.5117 14.998 30.0117 14.998C30.5117 14.998 31.0117 15.248 31.5117 15.498ZM26.7617 20.248C26.5117 19.748 26.2617 19.248 26.2617 18.748C26.2617 18.248 26.5117 17.748 26.7617 17.248L28.2617 18.748L26.7617 20.248ZM28.5117 21.998L30.0117 20.498L31.5117 21.998C31.0117 22.248 30.5117 22.498 30.0117 22.498C29.5117 22.498 29.0117 22.248 28.5117 21.998ZM30.0117 34.9981C26.5117 34.9981 23.7617 37.7481 23.7617 41.2481C23.7617 44.7481 26.5117 47.4981 30.0117 47.4981C33.5117 47.4981 36.2617 44.7481 36.2617 41.2481C36.2617 37.7481 33.5117 34.9981 30.0117 34.9981ZM33.7617 41.2481C33.7617 41.7481 33.5117 42.2481 33.2617 42.7481L31.7617 41.2481L33.2617 39.7481C33.5117 40.2481 33.7617 40.7481 33.7617 41.2481ZM31.5117 37.9981L30.0117 39.4981L28.5117 37.9981C29.0117 37.7481 29.5117 37.4981 30.0117 37.4981C30.5117 37.4981 31.0117 37.7481 31.5117 37.9981ZM26.7617 42.7481C26.5117 42.2481 26.2617 41.7481 26.2617 41.2481C26.2617 40.7481 26.5117 40.2481 26.7617 39.7481L28.2617 41.2481L26.7617 42.7481ZM28.5117 44.498L30.0117 42.9981L31.5117 44.498C31.0117 44.748 30.5117 44.9981 30.0117 44.9981C29.5117 44.9981 29.0117 44.748 28.5117 44.498Z"
              fill={color}
            />
          </svg>
        );

      case "projects":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 54 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M27.5469 6.94742C26.5406 6.7768 25.1669 6.76367 22.6906 6.76367C18.4972 6.76367 15.5156 6.76805 13.2581 7.06992C11.0444 7.36523 9.77344 7.92305 8.84812 8.84617C7.92281 9.7693 7.36719 11.0402 7.07188 13.2409C6.77 15.4896 6.76562 18.4515 6.76562 22.6252V31.3752C6.76562 35.5446 6.77 38.5065 7.07188 40.7552C7.36719 42.9559 7.92281 44.2246 8.84812 45.1521C9.77344 46.0752 11.0422 46.6309 13.2428 46.9262C15.4916 47.2302 18.4534 47.2324 22.625 47.2324H31.375C35.5466 47.2324 38.5106 47.228 40.7594 46.9262C42.9578 46.6309 44.2266 46.0752 45.1519 45.1499C46.0772 44.2246 46.6328 42.9559 46.9281 40.7552C47.23 38.5087 47.2344 35.5446 47.2344 31.373V30.4171C47.2344 27.0571 47.2125 25.4646 46.8538 24.2637H40.0069C37.5284 24.2637 35.505 24.2637 33.9037 24.0493C32.2347 23.824 30.7866 23.3384 29.6294 22.1812C28.4722 21.024 27.9866 19.578 27.7612 17.9046C27.5469 16.3077 27.5469 14.2821 27.5469 11.8015V6.94742ZM30.8281 8.64492V11.6855C30.8281 14.3105 30.8325 16.113 31.0141 17.4671C31.1891 18.7752 31.5041 19.4162 31.9503 19.8602C32.3966 20.3043 33.0353 20.6215 34.3434 20.7965C35.6975 20.978 37.5 20.9824 40.125 20.9824H44.5438C43.7042 20.1832 42.851 19.3985 41.9844 18.6287L33.3241 10.8346C32.5071 10.0877 31.675 9.35767 30.8281 8.64492ZM23.0078 3.48242C26.0375 3.48242 27.9953 3.48242 29.7956 4.17148C31.5959 4.86273 33.0441 6.16648 35.2863 8.18555L35.5203 8.39555L44.1784 16.1896L44.4519 16.4346C47.0419 18.7643 48.7175 20.2715 49.6166 22.2927C50.5156 24.314 50.5178 26.5671 50.5156 30.0496V31.4955C50.5156 35.5162 50.5156 38.7012 50.1809 41.1927C49.8353 43.7565 49.1091 45.8324 47.4728 47.4709C45.8344 49.1071 43.7584 49.8334 41.1947 50.179C38.7009 50.5137 35.5181 50.5137 31.4975 50.5137H22.5025C18.4819 50.5137 15.2969 50.5137 12.8053 50.179C10.2416 49.8334 8.16563 49.1071 6.52719 47.4709C4.89094 45.8324 4.16469 43.7565 3.81906 41.1927C3.48438 38.699 3.48438 35.5162 3.48438 31.4955V22.5027C3.48438 18.4821 3.48438 15.2971 3.81906 12.8055C4.16469 10.2418 4.89094 8.16586 6.52719 6.52742C8.16781 4.88898 10.2481 4.16492 12.8228 3.8193C15.3253 3.48461 18.5256 3.48461 22.5681 3.48461H23.01"
              fill={color}
            />
          </svg>
        );

      default:
        return null;
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
    setDropdownOpen(false);
  };

  return (
    <aside
      className={`flex flex-col justify-between items-center h-screen ${
        sidebarCollapsed ? "w-[80px]" : "w-[260px]"
      } bg-[#F8F9FC] rounded-r-3xl py-6 px-2 shadow-2xl z-50 fixed left-0 top-0`}
    >
      {/* Corner fillers to prevent background showing through rounded corners */}
      <div
        className="absolute top-0 right-0 w-6 h-6 bg-[#F8F9FC]"
        style={{
          borderTopRightRadius: "24px",
          borderBottomLeftRadius: "24px",
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-6 h-6 bg-[#F8F9FC]"
        style={{
          borderBottomRightRadius: "24px",
          borderTopLeftRadius: "24px",
          zIndex: 1,
        }}
      />

      {/* Logo at the top */}
      <div
        className={`mb-8 w-full flex justify-center ${
          sidebarCollapsed ? "px-0" : "px-2"
        }`}
        style={{ zIndex: 2 }}
      >
        <div
          className={`bg-white rounded-2xl flex items-center justify-center ${
            sidebarCollapsed ? "w-14 h-14" : "w-[150px] h-[50px]"
          }`}
        >
          <Image
            src={
              sidebarCollapsed
                ? "/BuddyNeo-collapsed.svg"
                : "/BuddyNeo-expanded.svg"
            }
            alt="BuddyNeo Logo"
            width={sidebarCollapsed ? 48 : 120}
            height={sidebarCollapsed ? 48 : 40}
          />
        </div>
      </div>
      {/* Navigation icons - centered vertically */}
      <div
        className="flex-1 flex flex-col justify-center items-center w-full"
        style={{ zIndex: 2 }}
      >
        <nav
          className={`flex flex-col ${
            sidebarCollapsed ? "gap-4" : "gap-6"
          } items-start w-full ${sidebarCollapsed ? "pl-2" : "pl-8"}`}
        >
          {navItems.map((item) =>
            item.disabled ? (
              <div
                key={item.label}
                className={`flex flex-row items-center gap-3 cursor-not-allowed select-none ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3`}
                title={sidebarCollapsed ? item.label : ""}
              >
                {renderIcon(item.icon, false, true)}
                {!sidebarCollapsed && (
                  <span
                    className="text-base font-semibold"
                    style={{ color: "#BDC8D5" }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            ) : item.active ? (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-row items-center gap-3 ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3 rounded-2xl ${
                  item.active
                    ? "border border-[#00AEEF] bg-white shadow-sm"
                    : "hover:bg-[#F0F4F8] transition-colors"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                {renderIcon(item.icon, true, false)}
                {!sidebarCollapsed && (
                  <span className="text-base font-semibold text-[#222E3A]">
                    {item.label}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-row items-center gap-3 ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3 rounded-2xl hover:bg-[#F0F4F8] transition-colors`}
                title={sidebarCollapsed ? item.label : ""}
              >
                {renderIcon(item.icon, false, false)}
                {!sidebarCollapsed && (
                  <span className="text-base font-semibold text-[#222E3A]">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          )}
        </nav>
      </div>
      {/* User/avatar section at the bottom */}
      <div
        className="w-full flex flex-col items-center mb-2"
        style={{ zIndex: 2 }}
      >
        <div
          className={`${
            sidebarCollapsed
              ? "w-12 px-0 flex flex-col items-center"
              : "w-[90%] px-3 flex flex-row items-center justify-between"
          } bg-white rounded-2xl py-2 mt-2 shadow-sm hover:bg-[#F0F4F8] transition-colors relative`}
          ref={dropdownRef}
          title={sidebarCollapsed ? "Profile" : ""}
        >
          <Link
            href="/profile"
            className={`flex ${
              sidebarCollapsed
                ? "flex-col items-center"
                : "flex-row items-center gap-2"
            } flex-1`}
          >
            <div className="w-10 h-10 rounded-full bg-[#FFFBEA] flex items-center justify-center overflow-hidden">
              <Image
                src={userAvatar}
                alt="User Avatar"
                width={36}
                height={36}
              />
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-semibold text-[#222E3A]">
                {userName}
              </span>
            )}
          </Link>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E0E0E0] transition-colors ${
              sidebarCollapsed ? "mt-2" : ""
            }`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Menu"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <circle cx="4" cy="10" r="2" fill="#888" />
              <circle cx="10" cy="10" r="2" fill="#888" />
              <circle cx="16" cy="10" r="2" fill="#888" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className={`absolute w-48 bg-[#d0eafb] rounded-2xl shadow-xl border border-[#E0E6ED] z-50 overflow-hidden opacity-90 ${
                sidebarCollapsed
                  ? "left-full ml-2 top-0"
                  : "left-full ml-2 top-0"
              }`}
            >
              <div className="py-1">
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm font-medium text-[#222E3A] hover:bg-[#c5deee] transition-colors w-full"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>Settings</span>
                  <svg
                    className="w-4 h-4 ml-auto text-[#00AEEF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-[#222E3A] hover:bg-[#c5deee] transition-colors"
                >
                  <span>Logout</span>
                  <svg
                    className="w-4 h-4 text-[#00AEEF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Vertical divider/handle */}
      <button
        className={`absolute top-1/2 right-0 -translate-y-1/2 w-3 h-12 flex items-center justify-center group transition-transform ${
          sidebarCollapsed ? "scale-x-[-1]" : ""
        }`}
        onClick={() => {
          setSidebarCollapsed(!sidebarCollapsed);
        }}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          outline: "none",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          zIndex: 3,
        }}
      >
        <div className="w-2 h-8 bg-[#E0E6ED] rounded-full shadow-inner group-hover:bg-[#00AEEF] transition-colors" />
      </button>
    </aside>
  );
}
