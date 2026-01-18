import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar, Header } from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Chat from './pages/Chat/Chat';
import Calendar from './pages/Calendar/Calendar';
import Settings from './pages/Settings/Settings';
import './App.css';

const pageConfig = {
    '/': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your overview.' },
    '/chat': { title: 'Chat', subtitle: 'Talk to your AI assistant.' },
    '/calendar': { title: 'Calendar', subtitle: 'Manage your schedule.' },
    '/settings': { title: 'Settings', subtitle: 'Configure your preferences.' },
};

export default function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <Header
                                    title={pageConfig['/'].title}
                                    subtitle={pageConfig['/'].subtitle}
                                />
                                <div className="page-container">
                                    <Dashboard />
                                </div>
                            </>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <>
                                <Header
                                    title={pageConfig['/chat'].title}
                                    subtitle={pageConfig['/chat'].subtitle}
                                />
                                <Chat />
                            </>
                        }
                    />
                    <Route
                        path="/calendar"
                        element={
                            <>
                                <Header
                                    title={pageConfig['/calendar'].title}
                                    subtitle={pageConfig['/calendar'].subtitle}
                                />
                                <div className="page-container">
                                    <Calendar />
                                </div>
                            </>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <>
                                <Header
                                    title={pageConfig['/settings'].title}
                                    subtitle={pageConfig['/settings'].subtitle}
                                />
                                <div className="page-container">
                                    <Settings />
                                </div>
                            </>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}
