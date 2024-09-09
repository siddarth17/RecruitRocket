import { GitHubBanner, Refine, WelcomePage, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { HomeOutlined, UserOutlined, BulbOutlined } from '@ant-design/icons';
import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { authProvider, dataProvider, liveProvider } from "./providers";
import { Home, ForgotPassword, Login, Register, ApplicantList, ApplicantEditPage, Values } from "./pages";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
  NavigateToResource,
} from "@refinedev/react-router-v6";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/layout" 
import { resources } from "./config/resources";
import Create from "./pages/company/create";
import { useState } from "react";
import { NotificationProvider } from "@refinedev/core";

function App() {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const handleCreateSuccess = (newApplicant: any) => {
    // Handle the new applicant creation
    setIsCreateModalVisible(false);
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <AntdApp>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              liveProvider={liveProvider}
              routerProvider={routerBindings}
              authProvider={authProvider}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: "Home",
                    icon: <HomeOutlined />,
                  },
                },
                {
                  name: "applicants",
                  list: "/applicants",
                  create: "/applicants/create",
                  edit: "/applicants/edit/:id",
                  show: "/applicants/show/:id",
                  meta: {
                    label: "Applicants",
                    icon: <UserOutlined />,
                  },
                },
                {
                  name: "values",
                  list: "/values",
                  meta: {
                    label: "Values",
                    icon: <BulbOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: "QFnXRZ-1ltB75-201ZGF",
                liveMode: "auto",
              }}
            >
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} /> 
                <Route
                  element={
                    <Authenticated
                      key="authenticated-layout"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Layout>
                        <Outlet />
                      </Layout> 
                    </Authenticated>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="/applicants">
                    <Route index element={<ApplicantList />} />
                    <Route path="create" element={
                      <Create
                        visible={isCreateModalVisible}
                        onCancel={() => setIsCreateModalVisible(false)}
                        onCreateSuccess={handleCreateSuccess}
                      />
                    } />
                    <Route path="edit/:id" element={<ApplicantEditPage />} />
                    <Route path="show/:id" element={<ApplicantEditPage />} />
                  </Route>
                  <Route path="/values" element={<Values />} />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </AntdApp>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;