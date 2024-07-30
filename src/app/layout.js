import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';
import 'mantine-react-table/styles.css'; 
import '@mantine/dates/styles.css'; 
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { AuthProvider } from "./context/AuthContext";
import { SupabaseContextProvider } from "./context/SupabaseContext";
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from "@mantine/modals";
import { DatesProvider } from "@mantine/dates";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "Cristiales Ice App";
const APP_DEFAULT_TITLE = "Cristiales Ice App";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Aplicación para le gestión de la fábrica de hielos Cristiales Ice";

export const metadata = {
  title: "Cristales Ice",
  description: "Aplicación para ventas",
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* <body className={inter.className}>{children}</body> */}
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark" forceColorScheme="dark" theme={{primaryColor:'cyan'}}>
            <Notifications position="top-right" zIndex={400}/>
            {/* <Model>{children}</Model> */}
            <AuthProvider>
              <SupabaseContextProvider>
                <ModalsProvider>
                  {children}
                </ModalsProvider>
              </SupabaseContextProvider>
            </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
