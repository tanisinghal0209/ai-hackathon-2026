import React from "react";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import RightPanel from "@/components/RightPanel";
import StatusBar from "@/components/StatusBar";
import WithAuth from "@/components/withAuth";

function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-container">
      <TopNavBar />
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <main className="main-content">
        {children}
      </main>
      <RightPanel />
      <StatusBar />
    </div>
  );
}

// Wrap with Auth Guard to protect all sub-pages in this layout group
export default function ProtectedWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WithAuth>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </WithAuth>
  );
}
