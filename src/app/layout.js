import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';
import 'mantine-react-table/styles.css'; 
import '@mantine/dates/styles.css'; //if using mantine date picker features
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { AuthProvider } from "./context/AuthContext";
import { SupabaseContextProvider } from "./context/SupabaseContext";
import { Notifications } from '@mantine/notifications';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Iceland",
  description: "Aplicación para ventas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* <body className={inter.className}>{children}</body> */}
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark" theme={{primaryColor:'cyan'}}>
          <Notifications position="top-right"/>
          {/* <Model>{children}</Model> */}
          <AuthProvider>
            <SupabaseContextProvider>
              {children}
            </SupabaseContextProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
